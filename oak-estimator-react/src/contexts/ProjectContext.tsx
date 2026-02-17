import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import type { Project, LineItem, CompanySettings, ProjectSettings, Summary } from '@/types'
import {
  getUserProjects,
  createProject as createFirestoreProject,
  updateProject as updateFirestoreProject,
  deleteProject as deleteFirestoreProject,
  trashProject as trashFirestoreProject,
  restoreProject as restoreFirestoreProject,
  getTrashedProjects,
  subscribeToProject,
  subscribeToUserProjects,
} from '@/services/firestore.service'
import { useAuth } from './AuthContext'
import { toast } from '@/hooks/use-toast'

interface ProjectContextType {
  currentProject: Project | null
  projects: Project[]
  trashedProjects: Project[]
  summary: Summary
  isLoading: boolean
  canUndo: boolean
  canRedo: boolean
  undo: () => Promise<void>
  redo: () => Promise<void>
  createProject: () => Promise<void>
  duplicateProject: (projectId: string) => Promise<void>
  loadProject: (projectId: string) => Promise<void>
  updateCompanySettings: (settings: CompanySettings) => Promise<void>
  updateProjectSettings: (settings: ProjectSettings) => Promise<void>
  addLineItem: (item: Omit<LineItem, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => Promise<void>
  updateLineItem: (itemId: string, updates: Partial<LineItem>) => Promise<void>
  deleteLineItem: (itemId: string) => Promise<void>
  deleteLineItems: (itemIds: string[]) => Promise<void>
  trashProject: (projectId: string) => Promise<void>
  restoreProject: (projectId: string) => Promise<void>
  deleteProjectPermanently: (projectId: string) => Promise<void>
  loadTrashedProjects: () => Promise<void>
}

const MAX_UNDO_HISTORY = 50

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [trashedProjects, setTrashedProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Undo/Redo history stack (stores line item snapshots)
  const undoStack = useRef<LineItem[][]>([])
  const redoStack = useRef<LineItem[][]>([])
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const isUndoRedoAction = useRef(false)

  // Push current line items to undo stack before a change
  const pushUndoSnapshot = useCallback(() => {
    if (!currentProject || isUndoRedoAction.current) return
    undoStack.current.push([...currentProject.lineItems])
    if (undoStack.current.length > MAX_UNDO_HISTORY) {
      undoStack.current.shift()
    }
    redoStack.current = [] // Clear redo on new action
    setCanUndo(true)
    setCanRedo(false)
  }, [currentProject])

  const undo = useCallback(async () => {
    if (!currentProject || undoStack.current.length === 0) return

    const previousItems = undoStack.current.pop()!
    redoStack.current.push([...currentProject.lineItems])

    isUndoRedoAction.current = true
    try {
      await updateFirestoreProject(currentProject.id, {
        lineItems: previousItems,
      })
      toast({ title: 'Undo', description: 'Reverted last change' })
    } catch (error: any) {
      // Restore undo stack on failure
      undoStack.current.push(previousItems)
      redoStack.current.pop()
      toast({ variant: 'destructive', title: 'Undo failed', description: error.message })
    } finally {
      isUndoRedoAction.current = false
      setCanUndo(undoStack.current.length > 0)
      setCanRedo(redoStack.current.length > 0)
    }
  }, [currentProject])

  const redo = useCallback(async () => {
    if (!currentProject || redoStack.current.length === 0) return

    const nextItems = redoStack.current.pop()!
    undoStack.current.push([...currentProject.lineItems])

    isUndoRedoAction.current = true
    try {
      await updateFirestoreProject(currentProject.id, {
        lineItems: nextItems,
      })
      toast({ title: 'Redo', description: 'Reapplied change' })
    } catch (error: any) {
      redoStack.current.push(nextItems)
      undoStack.current.pop()
      toast({ variant: 'destructive', title: 'Redo failed', description: error.message })
    } finally {
      isUndoRedoAction.current = false
      setCanUndo(undoStack.current.length > 0)
      setCanRedo(redoStack.current.length > 0)
    }
  }, [currentProject])

  // Clear undo/redo when switching projects
  const clearHistory = useCallback(() => {
    undoStack.current = []
    redoStack.current = []
    setCanUndo(false)
    setCanRedo(false)
  }, [])

  // Calculate summary from line items with configurable rates
  const summary: Summary = React.useMemo(() => {
    if (!currentProject) {
      return {
        materialsCost: 0,
        laborCost: 0,
        equipmentCost: 0,
        subcontractorCost: 0,
        miscCost: 0,
        subtotal: 0,
        markup: 0,
        markupPercentage: 15,
        tax: 0,
        taxPercentage: 7,
        totalCost: 0,
      }
    }

    const materialsCost = currentProject.lineItems
      .filter(item => item.type === 'material')
      .reduce((sum, item) => sum + item.totalCost, 0)

    const laborCost = currentProject.lineItems
      .filter(item => item.type === 'labor')
      .reduce((sum, item) => sum + item.totalCost, 0)

    const equipmentCost = currentProject.lineItems
      .filter(item => item.type === 'equipment')
      .reduce((sum, item) => sum + item.totalCost, 0)

    const subcontractorCost = currentProject.lineItems
      .filter(item => item.type === 'subcontractor')
      .reduce((sum, item) => sum + item.totalCost, 0)

    const miscCost = currentProject.lineItems
      .filter(item => item.type === 'misc')
      .reduce((sum, item) => sum + item.totalCost, 0)

    const subtotal = materialsCost + laborCost + equipmentCost + subcontractorCost + miscCost

    // Use project-specific rates or defaults
    const markupPercentage = currentProject.projectSettings.markupPercentage ?? 15
    const markup = subtotal * (markupPercentage / 100)
    const taxPercentage = currentProject.projectSettings.taxPercentage ?? 7
    const tax = (subtotal + markup) * (taxPercentage / 100)
    const totalCost = subtotal + markup + tax

    return {
      materialsCost,
      laborCost,
      equipmentCost,
      subcontractorCost,
      miscCost,
      subtotal,
      markup,
      markupPercentage,
      tax,
      taxPercentage,
      totalCost,
    }
  }, [currentProject])

  // Subscribe to user's projects
  useEffect(() => {
    if (!user) {
      setProjects([])
      return
    }

    const unsubscribe = subscribeToUserProjects(user.uid, (projects) => {
      setProjects(projects)
    })

    return () => unsubscribe()
  }, [user])

  // Subscribe to current project changes
  useEffect(() => {
    if (!currentProject?.id) {
      return
    }

    const unsubscribe = subscribeToProject(currentProject.id, (project) => {
      setCurrentProject(project)
    })

    return () => unsubscribe()
  }, [currentProject?.id])

  const createProject = useCallback(async () => {
    if (!user) {
      throw new Error('Must be logged in to create a project')
    }

    try {
      setIsLoading(true)

      const newProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.uid,
        companySettings: {
          companyName: '',
          address: '',
          phone: '',
          email: user.email || '',
        },
        projectSettings: {
          projectName: 'Untitled Project',
          projectNumber: '',
          location: '',
          architect: '',
          estimator: user.displayName || '',
          date: new Date().toISOString().split('T')[0],
          inclusions: '',
          exclusions: '',
          terms: '',
        },
        lineItems: [],
      }

      const projectId = await createFirestoreProject(newProject)
      const project = await getUserProjects(user.uid)
      const created = project.find(p => p.id === projectId)

      if (created) {
        setCurrentProject(created)
        toast({
          title: "Project created",
          description: "Your new project has been created successfully",
        })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create project",
        description: error.message,
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const duplicateProject = useCallback(async (projectId: string) => {
    if (!user) {
      throw new Error('Must be logged in to duplicate a project')
    }

    const sourceProject = projects.find(p => p.id === projectId)
    if (!sourceProject) {
      throw new Error('Project not found')
    }

    try {
      setIsLoading(true)

      // Create new line items with new IDs
      const now = Date.now()
      const newLineItems = sourceProject.lineItems.map((item, index) => ({
        ...item,
        id: `item-${now}-${index}`,
        createdAt: now,
        updatedAt: now,
      }))

      const newProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: user.uid,
        companySettings: { ...sourceProject.companySettings },
        projectSettings: {
          ...sourceProject.projectSettings,
          projectName: `${sourceProject.projectSettings.projectName} (Copy)`,
          date: new Date().toISOString().split('T')[0],
        },
        lineItems: newLineItems,
        status: 'draft',
      }

      const newProjectId = await createFirestoreProject(newProject)
      const allProjects = await getUserProjects(user.uid)
      const created = allProjects.find(p => p.id === newProjectId)

      if (created) {
        setCurrentProject(created)
        toast({
          title: "Project duplicated",
          description: `Created "${created.projectSettings.projectName}"`,
        })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to duplicate project",
        description: error.message,
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [user, projects])

  const loadProject = useCallback(async (projectId: string) => {
    try {
      setIsLoading(true)
      clearHistory()
      const project = projects.find(p => p.id === projectId)
      if (project) {
        setCurrentProject(project)
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to load project",
        description: error.message,
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [projects, clearHistory])

  const updateCompanySettings = useCallback(async (settings: CompanySettings) => {
    if (!currentProject) {
      throw new Error('No project selected')
    }

    try {
      await updateFirestoreProject(currentProject.id, {
        companySettings: settings,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update company settings",
        description: error.message,
      })
      throw error
    }
  }, [currentProject])

  const updateProjectSettings = useCallback(async (settings: ProjectSettings) => {
    if (!currentProject) {
      throw new Error('No project selected')
    }

    try {
      await updateFirestoreProject(currentProject.id, {
        projectSettings: settings,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update project settings",
        description: error.message,
      })
      throw error
    }
  }, [currentProject])

  const addLineItem = useCallback(async (
    item: Omit<LineItem, 'id' | 'createdAt' | 'updatedAt' | 'order'>
  ) => {
    if (!currentProject) {
      throw new Error('No project selected')
    }

    pushUndoSnapshot()
    try {
      const now = Date.now()
      const newItem: LineItem = {
        ...item,
        id: `item-${now}`,
        createdAt: now,
        updatedAt: now,
        order: currentProject.lineItems.length,
      }

      await updateFirestoreProject(currentProject.id, {
        lineItems: [...currentProject.lineItems, newItem],
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to add line item",
        description: error.message,
      })
      throw error
    }
  }, [currentProject, pushUndoSnapshot])

  const updateLineItem = useCallback(async (itemId: string, updates: Partial<LineItem>) => {
    if (!currentProject) {
      throw new Error('No project selected')
    }

    pushUndoSnapshot()
    try {
      const updatedItems = currentProject.lineItems.map(item =>
        item.id === itemId
          ? { ...item, ...updates, updatedAt: Date.now() }
          : item
      )

      await updateFirestoreProject(currentProject.id, {
        lineItems: updatedItems,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update line item",
        description: error.message,
      })
      throw error
    }
  }, [currentProject, pushUndoSnapshot])

  const deleteLineItem = useCallback(async (itemId: string) => {
    if (!currentProject) {
      throw new Error('No project selected')
    }

    pushUndoSnapshot()
    try {
      const updatedItems = currentProject.lineItems.filter(item => item.id !== itemId)

      await updateFirestoreProject(currentProject.id, {
        lineItems: updatedItems,
      })

      toast({
        title: "Line item deleted",
        description: "The line item has been removed",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete line item",
        description: error.message,
      })
      throw error
    }
  }, [currentProject, pushUndoSnapshot])

  const deleteLineItems = useCallback(async (itemIds: string[]) => {
    if (!currentProject) {
      throw new Error('No project selected')
    }

    pushUndoSnapshot()
    try {
      const idsSet = new Set(itemIds)
      const updatedItems = currentProject.lineItems.filter(item => !idsSet.has(item.id))

      await updateFirestoreProject(currentProject.id, {
        lineItems: updatedItems,
      })

      toast({
        title: "Line items deleted",
        description: `${itemIds.length} items have been removed`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete line items",
        description: error.message,
      })
      throw error
    }
  }, [currentProject, pushUndoSnapshot])

  const trashProject = useCallback(async (projectId: string) => {
    try {
      await trashFirestoreProject(projectId)

      if (currentProject?.id === projectId) {
        setCurrentProject(null)
      }

      toast({
        title: "Project moved to trash",
        description: "Project will be permanently deleted in 30 days",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to trash project",
        description: error.message,
      })
      throw error
    }
  }, [currentProject])

  const restoreProject = useCallback(async (projectId: string) => {
    if (!user) return

    try {
      await restoreFirestoreProject(projectId)

      toast({
        title: "Project restored",
        description: "Project has been restored successfully",
      })

      // Reload trashed projects
      await loadTrashedProjects()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to restore project",
        description: error.message,
      })
      throw error
    }
  }, [user])

  const deleteProjectPermanently = useCallback(async (projectId: string) => {
    try {
      await deleteFirestoreProject(projectId)

      if (currentProject?.id === projectId) {
        setCurrentProject(null)
      }

      toast({
        title: "Project permanently deleted",
        description: "The project has been permanently deleted",
      })

      // Reload trashed projects
      if (user) {
        await loadTrashedProjects()
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete project",
        description: error.message,
      })
      throw error
    }
  }, [currentProject, user])

  const loadTrashedProjects = useCallback(async () => {
    if (!user) return

    try {
      const trashed = await getTrashedProjects(user.uid)
      setTrashedProjects(trashed)
    } catch (error: any) {
      console.error('Failed to load trashed projects:', error)
    }
  }, [user])

  // Load trashed projects when user changes
  useEffect(() => {
    if (user) {
      loadTrashedProjects()
    }
  }, [user, loadTrashedProjects])

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        projects,
        trashedProjects,
        summary,
        isLoading,
        canUndo,
        canRedo,
        undo,
        redo,
        createProject,
        duplicateProject,
        loadProject,
        updateCompanySettings,
        updateProjectSettings,
        addLineItem,
        updateLineItem,
        deleteLineItem,
        deleteLineItems,
        trashProject,
        restoreProject,
        deleteProjectPermanently,
        loadTrashedProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}
