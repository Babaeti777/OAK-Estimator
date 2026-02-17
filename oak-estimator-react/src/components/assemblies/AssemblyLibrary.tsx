/**
 * Assembly Library Component
 *
 * Browse, search, and add assemblies to projects.
 * Features category browsing, search, and multi-select.
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  X,
  Plus,
  Clock,
  Check,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Copy,
  Hammer,
  Shovel,
  Square,
  Frame,
  Home,
  Droplets,
  Zap,
  Wind,
  Layers,
  LayoutDashboard,
  Grid3X3,
  Paintbrush,
  Archive,
  Lightbulb,
  Building2,
  TreePine,
  Sparkles,
  Settings,
  Pencil,
} from 'lucide-react'
import { AssemblyEditor } from './AssemblyEditor'
import { ItemSearchInput } from './ItemSearchInput'
import type { SearchableItem } from '@/data/item-search'
import type { Assembly, AssemblyCategory, DependencyWarning } from '@/types'
import {
  ASSEMBLY_CATEGORIES,
  DEFAULT_ASSEMBLIES,
  getCategoryInfo,
  getSuggestedDependencies,
} from '@/data/default-assemblies'
import { useProject } from '@/contexts/ProjectContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { createAssembly, getUserAssemblies, updateAssembly } from '@/services/assemblies.service'

// Icon mapping for categories
const CATEGORY_ICONS: Record<AssemblyCategory, React.ComponentType<{ className?: string }>> = {
  demolition: Hammer,
  sitework: Shovel,
  concrete: Square,
  framing: Frame,
  roofing: Home,
  plumbing: Droplets,
  electrical: Zap,
  hvac: Wind,
  insulation: Layers,
  drywall: LayoutDashboard,
  flooring: Grid3X3,
  painting: Paintbrush,
  cabinets: Archive,
  fixtures: Lightbulb,
  exterior: Building2,
  landscaping: TreePine,
  cleanup: Sparkles,
  custom: Settings,
}

interface AssemblyLibraryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type ViewMode = 'categories' | 'list' | 'detail'
type TabFilter = 'all' | 'default' | 'my' | 'recent'

export function AssemblyLibrary({ open, onOpenChange }: AssemblyLibraryProps) {
  const { user } = useAuth()
  const { currentProject, addLineItem } = useProject()
  const { toast } = useToast()

  // State
  const [viewMode, setViewMode] = useState<ViewMode>('categories')
  const [selectedCategory, setSelectedCategory] = useState<AssemblyCategory | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [tabFilter, setTabFilter] = useState<TabFilter>('all')
  const [selectedAssemblies, setSelectedAssemblies] = useState<Assembly[]>([])
  const [userAssemblies, setUserAssemblies] = useState<Assembly[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [detailAssembly, setDetailAssembly] = useState<Assembly | null>(null)

  // Editable review state - items staged for adding to project
  const [reviewItems, setReviewItems] = useState<Array<{
    assemblyName: string
    division: string
    description: string
    type: string
    quantity: number
    unit: string
    unitCost: number
    notes?: string
    schedule?: string
  }> | null>(null)

  // Assembly Editor state
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingAssembly, setEditingAssembly] = useState<Assembly | null>(null)

  // Load user assemblies when dialog opens
  const loadUserAssemblies = useCallback(async () => {
    if (!user) return
    try {
      const assemblies = await getUserAssemblies(user.uid)
      setUserAssemblies(assemblies)
    } catch (error) {
      console.error('Failed to load user assemblies:', error)
    }
  }, [user])

  // Load on open
  useMemo(() => {
    if (open) {
      loadUserAssemblies()
    }
  }, [open, loadUserAssemblies])

  // Combined assemblies list
  const allAssemblies = useMemo(() => {
    const combined = [...DEFAULT_ASSEMBLIES, ...userAssemblies]

    // Apply tab filter
    let filtered = combined
    if (tabFilter === 'default') {
      filtered = combined.filter(a => a.isDefault)
    } else if (tabFilter === 'my') {
      filtered = combined.filter(a => a.userId === user?.uid && !a.isDefault)
    } else if (tabFilter === 'recent') {
      filtered = combined
        .filter(a => a.lastUsedAt)
        .sort((a, b) => (b.lastUsedAt || 0) - (a.lastUsedAt || 0))
        .slice(0, 10)
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(a => a.category === selectedCategory)
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        a =>
          a.name.toLowerCase().includes(query) ||
          a.description?.toLowerCase().includes(query) ||
          a.tags?.some(t => t.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [tabFilter, selectedCategory, searchQuery, userAssemblies, user])

  // Check for dependency warnings
  const getDependencyWarnings = useCallback(
    (assembly: Assembly): DependencyWarning | null => {
      const selectedCategories = new Set(selectedAssemblies.map(a => a.category))
      const suggestedDeps = getSuggestedDependencies(assembly.category)

      const missingDeps = suggestedDeps.filter(dep => !selectedCategories.has(dep))

      if (missingDeps.length === 0) return null

      return {
        assemblyId: assembly.id,
        assemblyName: assembly.name,
        missingDependencies: missingDeps.map(dep => ({
          category: dep,
          categoryName: getCategoryInfo(dep)?.name || dep,
        })),
        message: `This assembly typically follows: ${missingDeps
          .map(d => getCategoryInfo(d)?.name)
          .join(', ')}`,
      }
    },
    [selectedAssemblies]
  )

  // Toggle assembly selection
  const toggleAssemblySelection = useCallback((assembly: Assembly) => {
    setSelectedAssemblies(prev => {
      const isSelected = prev.some(a => a.id === assembly.id)
      if (isSelected) {
        return prev.filter(a => a.id !== assembly.id)
      } else {
        return [...prev, assembly]
      }
    })
  }, [])

  // Calculate totals for selected assemblies
  const selectionTotals = useMemo(() => {
    const totalCost = selectedAssemblies.reduce((sum, a) => sum + a.totalCost, 0)
    const totalDuration = selectedAssemblies.reduce((sum, a) => sum + a.estimatedDuration, 0)
    return { totalCost, totalDuration }
  }, [selectedAssemblies])

  // Stage items for review/editing before adding
  const handleReviewBeforeAdd = useCallback(() => {
    if (selectedAssemblies.length === 0) return

    const items = selectedAssemblies.flatMap(assembly =>
      assembly.items.map(item => ({
        assemblyName: assembly.name,
        division: item.division,
        description: `[${assembly.name}] ${item.description}`,
        type: item.type,
        quantity: item.quantity,
        unit: item.unit,
        unitCost: item.unitCost,
        notes: item.notes,
        schedule: `Duration: ${assembly.estimatedDuration} ${assembly.durationUnit}`,
      }))
    )
    setReviewItems(items)
  }, [selectedAssemblies])

  // Update a review item
  const updateReviewItem = useCallback((index: number, updates: Partial<typeof reviewItems extends Array<infer T> | null ? T : never>) => {
    setReviewItems(prev => {
      if (!prev) return prev
      const updated = [...prev]
      updated[index] = { ...updated[index], ...updates }
      return updated
    })
  }, [])

  // Remove a review item
  const removeReviewItem = useCallback((index: number) => {
    setReviewItems(prev => prev ? prev.filter((_, i) => i !== index) : prev)
  }, [])

  // Add reviewed/edited items to project
  const handleAddToProject = useCallback(async () => {
    if (!currentProject) return

    const itemsToAdd = reviewItems || selectedAssemblies.flatMap(assembly =>
      assembly.items.map(item => ({
        assemblyName: assembly.name,
        division: item.division,
        description: `[${assembly.name}] ${item.description}`,
        type: item.type as string,
        quantity: item.quantity,
        unit: item.unit,
        unitCost: item.unitCost,
        notes: item.notes,
        schedule: `Duration: ${assembly.estimatedDuration} ${assembly.durationUnit}`,
      }))
    )

    if (itemsToAdd.length === 0) return

    setIsLoading(true)
    try {
      for (const item of itemsToAdd) {
        await addLineItem({
          division: item.division,
          description: item.description,
          type: item.type as any,
          quantity: item.quantity,
          unit: item.unit,
          unitCost: item.unitCost,
          totalCost: item.quantity * item.unitCost,
          notes: item.notes,
          schedule: item.schedule,
        })
      }

      // Update usage count for non-default assemblies
      for (const assembly of selectedAssemblies) {
        if (!assembly.isDefault && assembly.userId === user?.uid) {
          await updateAssembly(assembly.id, {
            usageCount: (assembly.usageCount || 0) + 1,
            lastUsedAt: Date.now(),
          })
        }
      }

      toast({
        title: 'Items added to project',
        description: `Added ${itemsToAdd.length} items to project`,
      })

      setSelectedAssemblies([])
      setReviewItems(null)
      onOpenChange(false)
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Failed to add items',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentProject, selectedAssemblies, addLineItem, user, toast, onOpenChange])

  // Edit a user assembly
  const handleEditAssembly = useCallback((assembly: Assembly) => {
    setEditingAssembly(assembly)
    setEditorOpen(true)
  }, [])

  // Handle save from editor
  const handleEditorSave = useCallback(() => {
    setEditorOpen(false)
    setEditingAssembly(null)
    loadUserAssemblies()
  }, [loadUserAssemblies])

  // Fork an assembly (copy default to user's library)
  const handleForkAssembly = useCallback(
    async (assembly: Assembly) => {
      if (!user) return

      setIsLoading(true)
      try {
        await createAssembly({
          userId: user.uid,
          name: `${assembly.name} (Copy)`,
          description: assembly.description,
          category: assembly.category,
          tags: assembly.tags,
          items: assembly.items.map(item => ({
            ...item,
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          })),
          totalCost: assembly.totalCost,
          estimatedDuration: assembly.estimatedDuration,
          durationUnit: assembly.durationUnit,
          dependencies: assembly.dependencies,
          phase: assembly.phase,
          isDefault: false,
          isShared: false,
          usageCount: 0,
          forkedFrom: assembly.id,
        })

        toast({
          title: 'Assembly forked',
          description: `"${assembly.name}" has been copied to your library`,
        })

        loadUserAssemblies()
      } catch (error: unknown) {
        toast({
          variant: 'destructive',
          title: 'Failed to fork assembly',
          description: error instanceof Error ? error.message : 'Unknown error occurred',
        })
      } finally {
        setIsLoading(false)
      }
    },
    [user, toast, loadUserAssemblies]
  )

  // Navigate back
  const handleBack = () => {
    if (viewMode === 'detail') {
      setViewMode(selectedCategory ? 'list' : 'categories')
      setDetailAssembly(null)
    } else if (viewMode === 'list') {
      setViewMode('categories')
      setSelectedCategory(null)
    }
  }

  // Category card click
  const handleCategoryClick = (category: AssemblyCategory) => {
    setSelectedCategory(category)
    setViewMode('list')
  }

  // Assembly card click
  const handleAssemblyClick = (assembly: Assembly) => {
    setDetailAssembly(assembly)
    setViewMode('detail')
  }

  // Render category grid
  const renderCategoryGrid = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {ASSEMBLY_CATEGORIES.filter(c => c.id !== 'custom').map(category => {
        const Icon = CATEGORY_ICONS[category.id]
        const count = DEFAULT_ASSEMBLIES.filter(a => a.category === category.id).length
        const userCount = userAssemblies.filter(a => a.category === category.id).length

        return (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className="flex flex-col items-center gap-2 p-4 rounded-lg border border-border hover:border-primary hover:bg-accent/50 transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="text-center">
              <div className="font-medium text-sm">{category.name}</div>
              <div className="text-xs text-muted-foreground">
                {count + userCount} assemblies
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )

  // Render assembly list
  const renderAssemblyList = () => (
    <div className="space-y-2">
      {allAssemblies.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No assemblies found
        </div>
      ) : (
        allAssemblies.map(assembly => {
          const isSelected = selectedAssemblies.some(a => a.id === assembly.id)
          const warning = getDependencyWarnings(assembly)

          return (
            <div
              key={assembly.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-muted-foreground/50'
              }`}
            >
              {/* Selection checkbox */}
              <button
                onClick={() => toggleAssemblySelection(assembly)}
                className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                  isSelected
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-muted-foreground/50'
                }`}
              >
                {isSelected && <Check className="w-3 h-3" />}
              </button>

              {/* Assembly info */}
              <button
                onClick={() => handleAssemblyClick(assembly)}
                className="flex-1 text-left min-w-0"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium truncate">{assembly.name}</span>
                  {assembly.isDefault && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500">
                      Default
                    </span>
                  )}
                  {warning && (
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  <span>{assembly.items.length} items</span>
                  <span>${assembly.totalCost.toLocaleString()}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {assembly.estimatedDuration} {assembly.durationUnit}
                  </span>
                </div>
              </button>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                {assembly.isDefault ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleForkAssembly(assembly)
                    }}
                    title="Fork to my library"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditAssembly(assembly)
                    }}
                    title="Edit assembly"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                )}
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
          )
        })
      )}
    </div>
  )

  // Render assembly detail
  const renderAssemblyDetail = () => {
    if (!detailAssembly) return null

    const warning = getDependencyWarnings(detailAssembly)
    const isSelected = selectedAssemblies.some(a => a.id === detailAssembly.id)
    const categoryInfo = getCategoryInfo(detailAssembly.category)
    const Icon = CATEGORY_ICONS[detailAssembly.category]

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg">{detailAssembly.name}</h3>
            <p className="text-sm text-muted-foreground">{detailAssembly.description}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs px-2 py-0.5 rounded bg-secondary">
                {categoryInfo?.name}
              </span>
              {detailAssembly.tags?.map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded bg-muted">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Warning */}
        {warning && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="font-medium text-amber-600">Dependency Notice</div>
              <div className="text-muted-foreground">{warning.message}</div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-secondary/50 text-center">
            <div className="text-lg font-semibold">
              ${detailAssembly.totalCost.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total Cost</div>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50 text-center">
            <div className="text-lg font-semibold">
              {detailAssembly.estimatedDuration}
            </div>
            <div className="text-xs text-muted-foreground">
              {detailAssembly.durationUnit}
            </div>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50 text-center">
            <div className="text-lg font-semibold">{detailAssembly.items.length}</div>
            <div className="text-xs text-muted-foreground">Items</div>
          </div>
        </div>

        {/* Items table */}
        <div>
          <h4 className="font-medium mb-2">Items</h4>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-2">Description</th>
                  <th className="text-right p-2">Qty</th>
                  <th className="text-right p-2">Unit</th>
                  <th className="text-right p-2">Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {detailAssembly.items.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-muted/30">
                    <td className="p-2">{item.description}</td>
                    <td className="text-right p-2">{item.quantity}</td>
                    <td className="text-right p-2">{item.unit}</td>
                    <td className="text-right p-2">
                      ${(item.quantity * item.unitCost).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant={isSelected ? 'secondary' : 'default'}
            className="flex-1"
            onClick={() => toggleAssemblySelection(detailAssembly)}
          >
            {isSelected ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Selected
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Select Assembly
              </>
            )}
          </Button>
          {detailAssembly.isDefault ? (
            <Button variant="outline" onClick={() => handleForkAssembly(detailAssembly)}>
              <Copy className="w-4 h-4 mr-2" />
              Fork
            </Button>
          ) : (
            <Button variant="outline" onClick={() => handleEditAssembly(detailAssembly)}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {viewMode !== 'categories' && (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            <DialogTitle>
              {viewMode === 'categories' && 'Assembly Library'}
              {viewMode === 'list' &&
                (selectedCategory
                  ? getCategoryInfo(selectedCategory)?.name || 'Assemblies'
                  : 'All Assemblies')}
              {viewMode === 'detail' && 'Assembly Details'}
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Search and tabs */}
        {viewMode !== 'detail' && (
          <div className="space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search assemblies..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b">
              {(['all', 'default', 'my', 'recent'] as TabFilter[]).map(tab => (
                <button
                  key={tab}
                  onClick={() => setTabFilter(tab)}
                  className={`px-3 py-1.5 text-sm capitalize border-b-2 transition-colors ${
                    tabFilter === tab
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab === 'my' ? 'My Library' : tab}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {reviewItems ? (
            /* Review & Edit View */
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">
                  Review & edit items before adding ({reviewItems.length} items)
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setReviewItems(null)}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              </div>
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-2 py-1">
                <div className="col-span-4">Description</div>
                <div className="col-span-2">Type</div>
                <div className="col-span-1">Qty</div>
                <div className="col-span-1">Unit</div>
                <div className="col-span-2">Unit Cost</div>
                <div className="col-span-1">Total</div>
                <div className="col-span-1"></div>
              </div>
              {reviewItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center p-2 rounded bg-muted/30 hover:bg-muted/50">
                  <div className="col-span-4">
                    <ItemSearchInput
                      value={item.description}
                      onChange={desc => updateReviewItem(index, { description: desc })}
                      onSelectItem={(match: SearchableItem) => {
                        updateReviewItem(index, {
                          description: match.description,
                          type: match.type,
                          unit: match.unit,
                          unitCost: match.unitCost,
                          notes: match.notes,
                        })
                      }}
                      className="text-sm h-8"
                    />
                  </div>
                  <div className="col-span-2 text-xs text-muted-foreground capitalize">
                    {item.type}
                  </div>
                  <div className="col-span-1">
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={e => updateReviewItem(index, { quantity: parseFloat(e.target.value) || 0 })}
                      className="text-sm h-8"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-1">
                    <Input
                      value={item.unit}
                      onChange={e => updateReviewItem(index, { unit: e.target.value })}
                      className="text-sm h-8"
                    />
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      value={item.unitCost}
                      onChange={e => updateReviewItem(index, { unitCost: parseFloat(e.target.value) || 0 })}
                      className="text-sm h-8"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="col-span-1 text-xs font-medium">
                    ${(item.quantity * item.unitCost).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </div>
                  <div className="col-span-1 flex justify-center">
                    <button onClick={() => removeReviewItem(index)} className="text-destructive hover:text-destructive/80">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-end text-sm font-semibold pt-2 border-t">
                Total: ${reviewItems.reduce((sum, i) => sum + i.quantity * i.unitCost, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          ) : (
            <>
              {viewMode === 'categories' && !searchQuery && renderCategoryGrid()}
              {(viewMode === 'list' || searchQuery) && renderAssemblyList()}
              {viewMode === 'detail' && renderAssemblyDetail()}
            </>
          )}
        </div>

        {/* Selection footer */}
        {(selectedAssemblies.length > 0 || reviewItems) && (
          <div className="border-t pt-3 mt-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm">
                {reviewItems ? (
                  <span className="font-medium">{reviewItems.length} items ready to add</span>
                ) : (
                  <>
                    <span className="font-medium">{selectedAssemblies.length}</span> selected
                    <span className="text-muted-foreground mx-2">|</span>
                    <span className="text-muted-foreground">
                      ${selectionTotals.totalCost.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground mx-2">|</span>
                    <span className="text-muted-foreground">
                      {selectionTotals.totalDuration} days
                    </span>
                  </>
                )}
              </div>
              <div className="flex gap-2">
                {reviewItems ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReviewItems(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddToProject}
                      disabled={isLoading || !currentProject || reviewItems.length === 0}
                    >
                      {isLoading ? 'Adding...' : (
                        <>
                          <Plus className="w-4 h-4 mr-1" />
                          Add {reviewItems.length} Items
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedAssemblies([])}
                    >
                      Clear
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleReviewBeforeAdd}
                    >
                      Review & Edit
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleAddToProject}
                      disabled={isLoading || !currentProject}
                    >
                      {isLoading ? 'Adding...' : (
                        <>
                          <Plus className="w-4 h-4 mr-1" />
                          Add to Project
                        </>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Assembly Editor Dialog */}
      <AssemblyEditor
        assembly={editingAssembly}
        open={editorOpen}
        onOpenChange={(open) => {
          setEditorOpen(open)
          if (!open) setEditingAssembly(null)
        }}
        onSave={handleEditorSave}
        mode="edit"
      />
    </Dialog>
  )
}
