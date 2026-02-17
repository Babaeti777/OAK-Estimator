/**
 * Assembly Editor Component
 *
 * Full-featured editor for assemblies with:
 * - Duration-based scheduling fields
 * - Dependency selection
 * - Phase assignment
 * - Item editing with drag reorder
 */

import { useState, useCallback, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Plus,
  Trash2,
  Save,
  Clock,
  Link2,
  Tag,
  X,
  GripVertical,
} from 'lucide-react'
import type {
  Assembly,
  AssemblyItem,
  AssemblyCategory,
  ProjectPhase,
  LineItem,
} from '@/types'
import { ASSEMBLY_CATEGORIES, getCategoryInfo } from '@/data/default-assemblies'
import { DIVISIONS_ALL } from '@/data/divisions'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { createAssembly, updateAssembly } from '@/services/assemblies.service'
import { formatCurrency } from '@/lib/utils'

const ITEM_TYPES: Array<{ value: LineItem['type']; label: string }> = [
  { value: 'material', label: 'Material' },
  { value: 'labor', label: 'Labor' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'subcontractor', label: 'Subcontractor' },
  { value: 'misc', label: 'Miscellaneous' },
]

const DURATION_UNITS: Array<{ value: 'hours' | 'days' | 'weeks'; label: string }> = [
  { value: 'hours', label: 'Hours' },
  { value: 'days', label: 'Days' },
  { value: 'weeks', label: 'Weeks' },
]

const PROJECT_PHASES: Array<{ value: ProjectPhase; label: string }> = [
  { value: 'pre-construction', label: 'Pre-Construction' },
  { value: 'rough-in', label: 'Rough-In' },
  { value: 'mechanical', label: 'Mechanical' },
  { value: 'insulation-drywall', label: 'Insulation & Drywall' },
  { value: 'finishes', label: 'Finishes' },
  { value: 'fixtures', label: 'Fixtures' },
  { value: 'final', label: 'Final' },
]

interface AssemblyEditorProps {
  assembly?: Assembly | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave?: (assembly: Assembly) => void
  mode?: 'create' | 'edit'
}

function generateId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function AssemblyEditor({
  assembly,
  open,
  onOpenChange,
  onSave,
  mode = assembly ? 'edit' : 'create',
}: AssemblyEditorProps) {
  const { user } = useAuth()
  const { toast } = useToast()

  // Form state
  const [name, setName] = useState(assembly?.name || '')
  const [description, setDescription] = useState(assembly?.description || '')
  const [category, setCategory] = useState<AssemblyCategory>(assembly?.category || 'custom')
  const [tags, setTags] = useState<string[]>(assembly?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [estimatedDuration, setEstimatedDuration] = useState(assembly?.estimatedDuration || 1)
  const [durationUnit, setDurationUnit] = useState<'hours' | 'days' | 'weeks'>(
    assembly?.durationUnit || 'days'
  )
  const [phase, setPhase] = useState<ProjectPhase | undefined>(assembly?.phase)
  const [dependencies, setDependencies] = useState<AssemblyCategory[]>(
    (assembly?.dependencies as AssemblyCategory[]) || []
  )
  const [items, setItems] = useState<AssemblyItem[]>(
    assembly?.items || []
  )
  const [isLoading, setIsLoading] = useState(false)

  // Reset form when assembly changes
  useMemo(() => {
    if (assembly) {
      setName(assembly.name)
      setDescription(assembly.description || '')
      setCategory(assembly.category)
      setTags(assembly.tags || [])
      setEstimatedDuration(assembly.estimatedDuration)
      setDurationUnit(assembly.durationUnit)
      setPhase(assembly.phase)
      setDependencies((assembly.dependencies as AssemblyCategory[]) || [])
      setItems(assembly.items)
    } else {
      // Reset to defaults for new assembly
      setName('')
      setDescription('')
      setCategory('custom')
      setTags([])
      setEstimatedDuration(1)
      setDurationUnit('days')
      setPhase(undefined)
      setDependencies([])
      setItems([])
    }
  }, [assembly])

  // Calculate total cost
  const totalCost = useMemo(() => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0)
  }, [items])

  // Add a new item
  const addItem = useCallback(() => {
    const newItem: AssemblyItem = {
      id: generateId(),
      description: '',
      division: '03',
      type: 'material',
      quantity: 1,
      unit: 'EA',
      unitCost: 0,
    }
    setItems(prev => [...prev, newItem])
  }, [])

  // Update an item
  const updateItem = useCallback((index: number, updates: Partial<AssemblyItem>) => {
    setItems(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], ...updates }
      return updated
    })
  }, [])

  // Remove an item
  const removeItem = useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }, [])

  // Add a tag
  const addTag = useCallback(() => {
    const trimmedTag = tagInput.trim().toLowerCase()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags(prev => [...prev, trimmedTag])
      setTagInput('')
    }
  }, [tagInput, tags])

  // Remove a tag
  const removeTag = useCallback((tag: string) => {
    setTags(prev => prev.filter(t => t !== tag))
  }, [])

  // Toggle dependency
  const toggleDependency = useCallback((dep: AssemblyCategory) => {
    setDependencies(prev => {
      if (prev.includes(dep)) {
        return prev.filter(d => d !== dep)
      } else {
        return [...prev, dep]
      }
    })
  }, [])

  // Get suggested dependencies based on category
  const suggestedDeps = useMemo(() => {
    const categoryInfo = getCategoryInfo(category)
    return categoryInfo?.suggestedDependencies || []
  }, [category])

  // Handle save
  const handleSave = useCallback(async () => {
    if (!user) return
    if (!name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Name required',
        description: 'Please enter a name for the assembly',
      })
      return
    }

    if (items.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Items required',
        description: 'Please add at least one item to the assembly',
      })
      return
    }

    setIsLoading(true)
    try {
      const assemblyData = {
        userId: user.uid,
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        tags: tags.length > 0 ? tags : undefined,
        items: items.map(item => ({
          ...item,
          id: item.id || generateId(),
        })),
        totalCost,
        estimatedDuration,
        durationUnit,
        phase,
        dependencies: dependencies.length > 0 ? dependencies : undefined,
        isDefault: false,
        isShared: false,
        usageCount: assembly?.usageCount || 0,
      }

      let savedAssembly: Assembly

      if (mode === 'edit' && assembly) {
        await updateAssembly(assembly.id, assemblyData)
        savedAssembly = {
          ...assembly,
          ...assemblyData,
          updatedAt: Date.now(),
        }
      } else {
        // Create new assembly
        const newId = await createAssembly(assemblyData as Omit<Assembly, 'id' | 'createdAt' | 'updatedAt'>)
        savedAssembly = {
          ...assemblyData,
          id: newId,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        } as Assembly
      }

      toast({
        title: mode === 'edit' ? 'Assembly updated' : 'Assembly created',
        description: `"${name}" has been saved`,
      })

      onSave?.(savedAssembly)
      onOpenChange(false)
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Error saving assembly',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    } finally {
      setIsLoading(false)
    }
  }, [
    user,
    name,
    description,
    category,
    tags,
    items,
    totalCost,
    estimatedDuration,
    durationUnit,
    phase,
    dependencies,
    assembly,
    mode,
    toast,
    onSave,
    onOpenChange,
  ])

  // Handle Save as New
  const handleSaveAsNew = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const assemblyData = {
        userId: user.uid,
        name: `${name.trim()} (Copy)`,
        description: description.trim() || undefined,
        category,
        tags: tags.length > 0 ? tags : undefined,
        items: items.map(item => ({
          ...item,
          id: generateId(), // Generate new IDs for items
        })),
        totalCost,
        estimatedDuration,
        durationUnit,
        phase,
        dependencies: dependencies.length > 0 ? dependencies : undefined,
        isDefault: false,
        isShared: false,
        usageCount: 0,
        forkedFrom: assembly?.id,
      }

      const newId = await createAssembly(assemblyData as Omit<Assembly, 'id' | 'createdAt' | 'updatedAt'>)
      const savedAssembly = {
        ...assemblyData,
        id: newId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as Assembly

      toast({
        title: 'Assembly created',
        description: `"${assemblyData.name}" has been saved as a new assembly`,
      })

      onSave?.(savedAssembly)
      onOpenChange(false)
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Error creating assembly',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    } finally {
      setIsLoading(false)
    }
  }, [
    user,
    name,
    description,
    category,
    tags,
    items,
    totalCost,
    estimatedDuration,
    durationUnit,
    phase,
    dependencies,
    assembly,
    toast,
    onSave,
    onOpenChange,
  ])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? `Edit: ${assembly?.name}` : 'Create New Assembly'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Bathroom Rough-In"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Optional description"
              />
            </div>
          </div>

          {/* Category and Scheduling */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                id="category"
                value={category}
                onChange={e => setCategory(e.target.value as AssemblyCategory)}
              >
                {ASSEMBLY_CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Duration *
              </Label>
              <div className="flex gap-2">
                <Input
                  id="duration"
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={estimatedDuration}
                  onChange={e => setEstimatedDuration(parseFloat(e.target.value) || 1)}
                  className="w-20"
                />
                <Select
                  value={durationUnit}
                  onChange={e => setDurationUnit(e.target.value as 'hours' | 'days' | 'weeks')}
                >
                  {DURATION_UNITS.map(unit => (
                    <option key={unit.value} value={unit.value}>
                      {unit.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
            <div className="space-y-2 col-span-2 md:col-span-2">
              <Label htmlFor="phase">Project Phase</Label>
              <Select
                id="phase"
                value={phase || ''}
                onChange={e => setPhase(e.target.value as ProjectPhase || undefined)}
              >
                <option value="">Select phase...</option>
                {PROJECT_PHASES.map(p => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Tags
            </Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary text-sm"
                >
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                placeholder="Add a tag..."
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="w-40"
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Dependencies */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Link2 className="w-3 h-3" />
              Dependencies (categories that should complete first)
            </Label>
            {suggestedDeps.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Suggested for {getCategoryInfo(category)?.name}:{' '}
                {suggestedDeps.map(d => getCategoryInfo(d)?.name).join(', ')}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {ASSEMBLY_CATEGORIES.filter(cat => cat.id !== 'custom' && cat.id !== category).map(cat => {
                const isSelected = dependencies.includes(cat.id)
                const isSuggested = suggestedDeps.includes(cat.id)

                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleDependency(cat.id)}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground'
                        : isSuggested
                        ? 'bg-amber-500/20 border border-amber-500/50 hover:bg-amber-500/30'
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                  >
                    {cat.name}
                  </button>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Items ({items.length})</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="w-4 h-4 mr-1" />
                Add Item
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                No items yet. Click "Add Item" to start.
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {/* Header */}
                <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground px-2">
                  <div className="col-span-1"></div>
                  <div className="col-span-1">Div</div>
                  <div className="col-span-3">Description</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-1">Qty</div>
                  <div className="col-span-1">Unit</div>
                  <div className="col-span-2">Unit Cost</div>
                  <div className="col-span-1"></div>
                </div>

                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg bg-muted/30 hover:bg-muted/50"
                  >
                    <div className="col-span-1 flex items-center justify-center cursor-grab">
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="col-span-1">
                      <Select
                        value={item.division}
                        onChange={e => updateItem(index, { division: e.target.value })}
                        className="text-xs"
                      >
                        {DIVISIONS_ALL.map(div => (
                          <option key={div.code} value={div.code}>
                            {div.code}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Input
                        value={item.description}
                        onChange={e => updateItem(index, { description: e.target.value })}
                        placeholder="Description"
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Select
                        value={item.type}
                        onChange={e => updateItem(index, { type: e.target.value as LineItem['type'] })}
                        className="text-xs"
                      >
                        {ITEM_TYPES.map(t => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={e => updateItem(index, { quantity: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.01"
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-1">
                      <Input
                        value={item.unit}
                        onChange={e => updateItem(index, { unit: e.target.value })}
                        placeholder="EA"
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={item.unitCost}
                        onChange={e => updateItem(index, { unitCost: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.01"
                        className="text-sm"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {items.length > 0 && (
              <div className="flex justify-end text-sm font-semibold">
                Total: {formatCurrency(totalCost)}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <Separator className="my-4" />
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {items.length} items | {formatCurrency(totalCost)} | {estimatedDuration} {durationUnit}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            {mode === 'edit' && (
              <Button variant="outline" onClick={handleSaveAsNew} disabled={isLoading}>
                Save as New
              </Button>
            )}
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
