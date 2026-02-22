/**
 * Smart Assembly Wizard
 *
 * A multi-step wizard that guides users through creating assemblies
 * by answering category-specific questions. Generates line items
 * from form configs and adds them to the project.
 *
 * Steps:
 *  1. Pick a category
 *  2. Fill in category-specific form fields
 *  3. Review generated items (editable) and confirm
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useProject } from '@/contexts/ProjectContext'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency } from '@/lib/utils'
import type { AssemblyCategory, AssemblyItem } from '@/types'
import { ASSEMBLY_CATEGORIES } from '@/data/default-assemblies'
import {
  ASSEMBLY_FORM_CONFIGS,
  generateItemsFromConfig,
  type FormField,
  type CategoryFormConfig,
} from '@/data/assembly-configs'
import {
  Wand2,
  ChevronLeft,
  ChevronRight,
  Check,
  Trash2,
  Plus,
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
  Info,
  Pencil,
  PenTool,
  Cpu,
} from 'lucide-react'

// ============================================
// Icon lookup (same as AssemblyLibrary)
// ============================================

const CATEGORY_ICONS: Record<AssemblyCategory, React.ComponentType<{ className?: string }>> = {
  design: PenTool,
  'mep-engineering': Cpu,
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

// ============================================
// Types
// ============================================

type WizardStep = 'category' | 'configure' | 'review'

interface SmartAssemblyWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// ============================================
// Component
// ============================================

export function SmartAssemblyWizard({ open, onOpenChange }: SmartAssemblyWizardProps) {
  const { addAssemblyToProject, currentProject } = useProject()
  const { toast } = useToast()

  // Wizard state
  const [step, setStep] = useState<WizardStep>('category')
  const [selectedCategory, setSelectedCategory] = useState<AssemblyCategory | null>(null)
  const [formAnswers, setFormAnswers] = useState<Record<string, string | number | boolean>>({})
  const [assemblyName, setAssemblyName] = useState('')
  const [reviewItems, setReviewItems] = useState<AssemblyItem[]>([])
  const [estimatedDuration, setEstimatedDuration] = useState(1)
  const [multiplier, setMultiplier] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)

  // Get current config
  const config = useMemo<CategoryFormConfig | null>(() => {
    if (!selectedCategory) return null
    return ASSEMBLY_FORM_CONFIGS[selectedCategory]
  }, [selectedCategory])

  // Reset wizard
  const resetWizard = useCallback(() => {
    setStep('category')
    setSelectedCategory(null)
    setFormAnswers({})
    setAssemblyName('')
    setReviewItems([])
    setEstimatedDuration(1)
    setMultiplier(1)
    setEditingItemIndex(null)
  }, [])

  // Handle dialog close
  const handleOpenChange = useCallback((isOpen: boolean) => {
    if (!isOpen) resetWizard()
    onOpenChange(isOpen)
  }, [onOpenChange, resetWizard])

  // Initialize form defaults when category is selected
  const selectCategory = useCallback((category: AssemblyCategory) => {
    setSelectedCategory(category)
    const cfg = ASSEMBLY_FORM_CONFIGS[category]
    const defaults: Record<string, string | number | boolean> = {}
    for (const field of cfg.fields) {
      if (field.defaultValue !== undefined) {
        defaults[field.id] = field.defaultValue
      }
    }
    setFormAnswers(defaults)
    const catInfo = ASSEMBLY_CATEGORIES.find(c => c.id === category)
    setAssemblyName(catInfo?.name || category)
    setStep('configure')
  }, [])

  // Update a form answer
  const updateAnswer = useCallback((fieldId: string, value: string | number | boolean) => {
    setFormAnswers(prev => ({ ...prev, [fieldId]: value }))
  }, [])

  // Generate items from config + answers
  const generateItems = useCallback(() => {
    if (!config) return
    const result = generateItemsFromConfig(config, formAnswers)
    setReviewItems(result.items)
    setEstimatedDuration(result.estimatedDuration)
    setStep('review')
  }, [config, formAnswers])

  // Calculate review totals
  const reviewTotals = useMemo(() => {
    const material = reviewItems.filter(i => i.type === 'material').reduce((s, i) => s + i.quantity * i.unitCost, 0)
    const labor = reviewItems.filter(i => i.type === 'labor').reduce((s, i) => s + i.quantity * i.unitCost, 0)
    const equipment = reviewItems.filter(i => i.type === 'equipment').reduce((s, i) => s + i.quantity * i.unitCost, 0)
    const sub = reviewItems.filter(i => i.type === 'subcontractor').reduce((s, i) => s + i.quantity * i.unitCost, 0)
    const misc = reviewItems.filter(i => i.type === 'misc').reduce((s, i) => s + i.quantity * i.unitCost, 0)
    return { material, labor, equipment, sub, misc, total: material + labor + equipment + sub + misc }
  }, [reviewItems])

  // Update a review item in-place
  const updateReviewItem = useCallback((index: number, field: keyof AssemblyItem, value: string | number) => {
    setReviewItems(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }, [])

  // Remove a review item
  const removeReviewItem = useCallback((index: number) => {
    setReviewItems(prev => prev.filter((_, i) => i !== index))
    setEditingItemIndex(null)
  }, [])

  // Add assembly as parent group + child sub-tasks
  const handleAddToProject = useCallback(async () => {
    if (!currentProject || reviewItems.length === 0) return
    setIsAdding(true)
    try {
      await addAssemblyToProject({
        name: assemblyName,
        category: selectedCategory || undefined,
        items: reviewItems.map(item => ({
          division: item.division,
          description: item.description,
          type: item.type,
          quantity: item.quantity,
          unit: item.unit,
          unitCost: item.unitCost,
          totalCost: item.quantity * item.unitCost,
          notes: item.notes,
        })),
        multiplier,
        estimatedDuration,
        schedule: `Duration: ${estimatedDuration} day${estimatedDuration !== 1 ? 's' : ''}`,
      })
      toast({
        title: 'Assembly added',
        description: `Added "${assemblyName}" with ${reviewItems.length} sub-items${multiplier > 1 ? ` (x${multiplier})` : ''} — ${formatCurrency(reviewTotals.total * multiplier)}`,
      })
      resetWizard()
      onOpenChange(false)
    } catch (error: unknown) {
      toast({
        variant: 'destructive',
        title: 'Failed to add assembly',
        description: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsAdding(false)
    }
  }, [currentProject, reviewItems, assemblyName, selectedCategory, estimatedDuration, multiplier, addAssemblyToProject, toast, onOpenChange, resetWizard, reviewTotals.total])

  // Check if a field should be visible
  const isFieldVisible = useCallback((field: FormField): boolean => {
    if (!field.showWhen) return true
    return formAnswers[field.showWhen.field] === field.showWhen.value
  }, [formAnswers])

  // ============================================
  // Render helpers
  // ============================================

  const renderCategoryStep = () => (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-primary" />
          Smart Assembly Wizard
        </DialogTitle>
        <DialogDescription>
          Choose a category to get started. The wizard will ask you a few questions and generate a complete assembly.
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[400px] overflow-y-auto py-2">
        {ASSEMBLY_CATEGORIES.map(cat => {
          const Icon = CATEGORY_ICONS[cat.id]
          return (
            <button
              key={cat.id}
              onClick={() => selectCategory(cat.id)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-colors text-center group"
            >
              <Icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-xs font-medium">{cat.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )

  const renderConfigureStep = () => {
    if (!config) return null

    return (
      <div className="space-y-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedCategory && (() => {
              const Icon = CATEGORY_ICONS[selectedCategory]
              return <Icon className="w-5 h-5 text-primary" />
            })()}
            {config.title}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        {/* Assembly name */}
        <div className="space-y-1.5">
          <Label htmlFor="wizard-name" className="text-xs font-medium">Assembly Name</Label>
          <Input
            id="wizard-name"
            value={assemblyName}
            onChange={e => setAssemblyName(e.target.value)}
            placeholder="e.g., Master Bath Plumbing"
            className="h-9"
          />
        </div>

        <Separator />

        {/* Dynamic form fields */}
        <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
          {config.fields.map(field => {
            if (!isFieldVisible(field)) return null

            return (
              <div key={field.id} className="space-y-1.5">
                <Label htmlFor={`wizard-${field.id}`} className="text-xs font-medium flex items-center gap-1.5">
                  {field.label}
                  {field.unit && <span className="text-muted-foreground font-normal">({field.unit})</span>}
                </Label>

                {field.type === 'select' && field.options && (
                  <Select
                    id={`wizard-${field.id}`}
                    value={String(formAnswers[field.id] ?? '')}
                    onChange={e => updateAnswer(field.id, e.target.value)}
                  >
                    <option value="" disabled>Select...</option>
                    {field.options.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </Select>
                )}

                {field.type === 'number' && (
                  <Input
                    id={`wizard-${field.id}`}
                    type="number"
                    value={String(formAnswers[field.id] ?? '')}
                    onChange={e => updateAnswer(field.id, Number(e.target.value))}
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    placeholder={field.placeholder}
                    className="h-9"
                  />
                )}

                {field.type === 'text' && (
                  <Input
                    id={`wizard-${field.id}`}
                    value={String(formAnswers[field.id] ?? '')}
                    onChange={e => updateAnswer(field.id, e.target.value)}
                    placeholder={field.placeholder}
                    className="h-9"
                  />
                )}

                {field.type === 'toggle' && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(formAnswers[field.id])}
                      onChange={e => updateAnswer(field.id, e.target.checked)}
                      className="w-4 h-4 rounded border-border accent-primary"
                    />
                    <span className="text-sm text-muted-foreground">{field.helpText || 'Yes'}</span>
                  </label>
                )}

                {field.helpText && field.type !== 'toggle' && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {field.helpText}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <DialogFooter className="flex !flex-row !justify-between pt-2">
          <Button variant="ghost" size="sm" onClick={() => setStep('category')}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button size="sm" onClick={generateItems}>
            Generate Items
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </DialogFooter>
      </div>
    )
  }

  const renderReviewStep = () => (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Check className="w-5 h-5 text-primary" />
          Review: {assemblyName}
        </DialogTitle>
        <DialogDescription>
          {reviewItems.length} items &middot; Est. {estimatedDuration} day{estimatedDuration !== 1 ? 's' : ''} &middot; {formatCurrency(reviewTotals.total * multiplier)}
        </DialogDescription>
      </DialogHeader>

      {/* Assembly quantity multiplier */}
      <div className="flex items-center gap-3 p-2 bg-muted/30 rounded-lg">
        <Label className="text-xs font-medium whitespace-nowrap">Assembly Qty:</Label>
        <Input
          type="number"
          value={multiplier}
          onChange={e => setMultiplier(Math.max(1, Number(e.target.value) || 1))}
          className="h-8 w-20 text-sm text-center"
          min={1}
          step={1}
        />
        {multiplier > 1 && (
          <span className="text-xs text-muted-foreground">
            Base {formatCurrency(reviewTotals.total)} x {multiplier} = <strong className="text-foreground">{formatCurrency(reviewTotals.total * multiplier)}</strong>
          </span>
        )}
      </div>

      {/* Cost summary bar */}
      <div className="flex flex-wrap gap-3 text-xs">
        {reviewTotals.material > 0 && (
          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">
            Material: {formatCurrency(reviewTotals.material)}
          </span>
        )}
        {reviewTotals.labor > 0 && (
          <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400">
            Labor: {formatCurrency(reviewTotals.labor)}
          </span>
        )}
        {reviewTotals.equipment > 0 && (
          <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400">
            Equipment: {formatCurrency(reviewTotals.equipment)}
          </span>
        )}
        {reviewTotals.sub > 0 && (
          <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400">
            Sub: {formatCurrency(reviewTotals.sub)}
          </span>
        )}
        {reviewTotals.misc > 0 && (
          <span className="px-2 py-0.5 rounded bg-gray-500/10 text-gray-400">
            Misc: {formatCurrency(reviewTotals.misc)}
          </span>
        )}
      </div>

      <Separator />

      {/* Editable items list */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {reviewItems.map((item, i) => (
          <div key={item.id} className="border border-border rounded-lg p-2.5 text-sm space-y-1">
            {editingItemIndex === i ? (
              /* Editing mode */
              <div className="space-y-2">
                <Input
                  value={item.description}
                  onChange={e => updateReviewItem(i, 'description', e.target.value)}
                  className="h-8 text-xs"
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-[10px]">Qty</Label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={e => updateReviewItem(i, 'quantity', Number(e.target.value))}
                      className="h-7 text-xs"
                      step="0.01"
                    />
                  </div>
                  <div className="w-16">
                    <Label className="text-[10px]">Unit</Label>
                    <Input
                      value={item.unit}
                      onChange={e => updateReviewItem(i, 'unit', e.target.value)}
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="flex-1">
                    <Label className="text-[10px]">Unit Cost</Label>
                    <Input
                      type="number"
                      value={item.unitCost}
                      onChange={e => updateReviewItem(i, 'unitCost', Number(e.target.value))}
                      className="h-7 text-xs"
                      step="0.01"
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-red-400" onClick={() => removeReviewItem(i)}>
                    <Trash2 className="w-3 h-3 mr-1" />
                    Remove
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditingItemIndex(null)}>
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              /* Display mode */
              <div
                className="flex items-start justify-between cursor-pointer hover:bg-muted/50 rounded -m-1 p-1 transition-colors"
                onClick={() => setEditingItemIndex(i)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                      item.type === 'material' ? 'bg-blue-400' :
                      item.type === 'labor' ? 'bg-green-400' :
                      item.type === 'equipment' ? 'bg-yellow-400' :
                      item.type === 'subcontractor' ? 'bg-purple-400' :
                      'bg-gray-400'
                    }`} />
                    <span className="truncate">{item.description}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 pl-3">
                    {item.quantity} {item.unit} @ {formatCurrency(item.unitCost)}
                    {item.notes && <span className="ml-1.5 italic">&middot; {item.notes}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <span className="font-medium text-xs">{formatCurrency(item.quantity * item.unitCost)}</span>
                  <Pencil className="w-3 h-3 text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {reviewItems.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No items generated. Go back and adjust your inputs.
        </div>
      )}

      <DialogFooter className="flex !flex-row !justify-between pt-2">
        <Button variant="ghost" size="sm" onClick={() => setStep('configure')}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
        <Button
          size="sm"
          onClick={handleAddToProject}
          disabled={isAdding || reviewItems.length === 0}
        >
          {isAdding ? 'Adding...' : (
            <>
              <Plus className="w-4 h-4 mr-1" />
              Add to Project ({formatCurrency(reviewTotals.total * multiplier)})
            </>
          )}
        </Button>
      </DialogFooter>
    </div>
  )

  // ============================================
  // Main render
  // ============================================

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        {step === 'category' && renderCategoryStep()}
        {step === 'configure' && renderConfigureStep()}
        {step === 'review' && renderReviewStep()}
      </DialogContent>
    </Dialog>
  )
}
