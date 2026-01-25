import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ProjectFolder } from '@/types'
import {
  createFolder as createFolderService,
  updateFolder as updateFolderService,
  deleteFolder as deleteFolderService,
  subscribeToUserFolders,
} from '@/services/folders.service'
import { useAuth } from './AuthContext'
import { toast } from '@/hooks/use-toast'

interface FolderContextType {
  folders: ProjectFolder[]
  selectedFolderId: string | null
  isLoading: boolean
  createFolder: (name: string, color?: string) => Promise<string>
  updateFolder: (folderId: string, updates: Partial<ProjectFolder>) => Promise<void>
  deleteFolder: (folderId: string) => Promise<void>
  selectFolder: (folderId: string | null) => void
  reorderFolders: (folderIds: string[]) => Promise<void>
}

const FolderContext = createContext<FolderContextType | undefined>(undefined)

export function FolderProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [folders, setFolders] = useState<ProjectFolder[]>([])
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Subscribe to user's folders
  useEffect(() => {
    if (!user) {
      setFolders([])
      setSelectedFolderId(null)
      return
    }

    const unsubscribe = subscribeToUserFolders(user.uid, (folders) => {
      setFolders(folders)
    })

    return () => unsubscribe()
  }, [user])

  const createFolder = useCallback(async (name: string, color?: string): Promise<string> => {
    if (!user) {
      throw new Error('Must be logged in to create a folder')
    }

    try {
      setIsLoading(true)
      const folderId = await createFolderService({
        userId: user.uid,
        name,
        color,
        order: folders.length,
      })

      toast({
        title: "Folder created",
        description: `Folder "${name}" has been created`,
      })

      return folderId
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to create folder",
        description: error.message,
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [user, folders.length])

  const updateFolder = useCallback(async (folderId: string, updates: Partial<ProjectFolder>) => {
    try {
      await updateFolderService(folderId, updates)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to update folder",
        description: error.message,
      })
      throw error
    }
  }, [])

  const deleteFolder = useCallback(async (folderId: string) => {
    try {
      await deleteFolderService(folderId)

      if (selectedFolderId === folderId) {
        setSelectedFolderId(null)
      }

      toast({
        title: "Folder deleted",
        description: "The folder has been deleted",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete folder",
        description: error.message,
      })
      throw error
    }
  }, [selectedFolderId])

  const selectFolder = useCallback((folderId: string | null) => {
    setSelectedFolderId(folderId)
  }, [])

  const reorderFolders = useCallback(async (folderIds: string[]) => {
    try {
      await Promise.all(
        folderIds.map((id, index) => updateFolderService(id, { order: index }))
      )
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to reorder folders",
        description: error.message,
      })
      throw error
    }
  }, [])

  return (
    <FolderContext.Provider
      value={{
        folders,
        selectedFolderId,
        isLoading,
        createFolder,
        updateFolder,
        deleteFolder,
        selectFolder,
        reorderFolders,
      }}
    >
      {children}
    </FolderContext.Provider>
  )
}

export function useFolders() {
  const context = useContext(FolderContext)
  if (context === undefined) {
    throw new Error('useFolders must be used within a FolderProvider')
  }
  return context
}
