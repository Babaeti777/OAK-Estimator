import { useState, useRef, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CalculatorInput } from "@/components/ui/calculator-input"
import { DescriptionSearchInput } from "@/components/line-items/DescriptionSearchInput"
import { useProject } from "@/contexts/ProjectContext"
import { Plus, ChevronUp, ChevronDown } from "lucide-react"
import type { LineItem } from "@/types"
import { toast } from "@/hooks/use-toast"
import { DIVISIONS_ALL, getDivisionLabel } from "@/data/divisions"
import type { DivisionItem } from "@/data/division-items"

const ITEM_TYPES: Array<{ value: LineItem['type']; label: string }> = [
  { value: 'material', label: 'Material' },
  { value: 'labor', label: 'Labor' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'subcontractor', label: 'Subcontractor' },
  { value: 'misc', label: 'Misc' },
]

interface QuickAddRowProps {
  onAdd?: () => void
}

export function QuickAddRow({ onAdd }: QuickAddRowProps) {
  const { addLineItem } = useProject()
  // Always visible by default (P1 #5)
  const [isExpanded, setIsExpanded] = useState(true)
  const [formData, setFormData] = useState({
    division: '01',
    description: '',
    type: 'material' as LineItem['type'],
    quantity: 1,
    unit: 'EA',
    unitCost: 0,
  })
  const descriptionRef = useRef<HTMLInputElement>(null)

  // When a description item is selected from the dropdown, auto-fill type, unit, and unitCost
  const handleDescriptionSelect = useCallback((selectedItem: DivisionItem) => {
    setFormData((prev) => ({
      ...prev,
      description: selectedItem.description,
      type: selectedItem.type,
      unit: selectedItem.unit,
      unitCost: selectedItem.unitCost,
    }))
  }, [])

  // Auto-focus description field on initial mount since we start expanded
  useEffect(() => {
    if (isExpanded && descriptionRef.current) {
      descriptionRef.current.focus()
    }
  }, [isExpanded])

  const resetForm = () => {
    setFormData({
      division: '01',
      description: '',
      type: 'material',
      quantity: 1,
      unit: 'EA',
      unitCost: 0,
    })
  }

  const handleSubmit = async () => {
    if (!formData.description.trim()) {
      toast({
        variant: "destructive",
        title: "Description required",
        description: "Please enter a description for the line item",
      })
      return
    }

    try {
      await addLineItem({
        division: formData.division,
        description: formData.description,
        type: formData.type,
        quantity: formData.quantity,
        unit: formData.unit,
        unitCost: formData.unitCost,
        totalCost: formData.quantity * formData.unitCost,
      })

      toast({
        title: "Item added",
        description: "Line item added successfully",
      })

      resetForm()
      onAdd?.()

      // Auto-focus description field for rapid sequential entry
      requestAnimationFrame(() => {
        if (descriptionRef.current) {
          descriptionRef.current.focus()
        }
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to add item",
        description: error.message,
      })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === 'Escape') {
      resetForm()
      // Re-focus description after clearing so user can start fresh
      requestAnimationFrame(() => {
        if (descriptionRef.current) {
          descriptionRef.current.focus()
        }
      })
    }
  }

  // Collapsed state: show a toggle button to re-expand the form
  if (!isExpanded) {
    return (
      <tr className="border-t border-dashed border-muted">
        <td colSpan={10} className="px-4 py-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="w-full justify-center text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className="w-4 h-4 mr-2" />
            Show Quick Add Row
          </Button>
        </td>
      </tr>
    )
  }

  return (
    <>
      <tr
        className="bg-primary/5 border-t-2 border-primary shadow-[inset_0_1px_4px_0_rgba(0,0,0,0.04)]"
        onKeyDown={handleKeyDown}
      >
        {/* Empty cell for checkbox column */}
        <td className="px-2 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
            title="Collapse Quick Add Row"
          >
            <ChevronUp className="w-3 h-3" />
          </Button>
        </td>

        {/* Empty cell for row number column */}
        <td className="px-1 py-2" />

        {/* Division */}
        <td className="px-3 py-2">
          <Select
            value={formData.division}
            onChange={(e) => setFormData({ ...formData, division: e.target.value })}
            className="h-8 text-sm w-full"
            title={getDivisionLabel(formData.division)}
          >
            {DIVISIONS_ALL.map(div => (
              <option key={div.code} value={div.code}>
                {div.code}
              </option>
            ))}
          </Select>
        </td>

        {/* Description - search dropdown linked to division */}
        <td className="px-3 py-2 min-w-0">
          <DescriptionSearchInput
            value={formData.description}
            division={formData.division}
            onChange={(value) => setFormData({ ...formData, description: value })}
            onSelectItem={handleDescriptionSelect}
            className="h-8 text-sm"
            placeholder="Search or type description..."
          />
        </td>

        {/* Type */}
        <td className="px-3 py-2">
          <Select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as LineItem['type'] })}
            className="h-8 text-sm"
          >
            {ITEM_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
        </td>

        {/* Quantity - supports calculator expressions */}
        <td className="px-3 py-2">
          <CalculatorInput
            value={formData.quantity}
            onChange={(value) => setFormData({ ...formData, quantity: value })}
            className="h-8 text-sm text-right w-full"
            placeholder="e.g. 2+3"
          />
        </td>

        {/* Unit */}
        <td className="px-3 py-2">
          <Input
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            className="h-8 text-sm w-full"
            placeholder="EA"
          />
        </td>

        {/* Unit Cost - supports calculator expressions */}
        <td className="px-3 py-2">
          <CalculatorInput
            value={formData.unitCost}
            onChange={(value) => setFormData({ ...formData, unitCost: value })}
            className="h-8 text-sm text-right w-full"
            placeholder="e.g. 100*1.1"
          />
        </td>

        {/* Total (calculated) */}
        <td className="px-3 py-2 text-right text-sm font-medium">
          ${(formData.quantity * formData.unitCost).toFixed(2)}
        </td>

        {/* Actions */}
        <td className="px-3 py-2">
          <div className="flex flex-col items-start gap-1">
            <Button
              size="sm"
              onClick={handleSubmit}
              className="h-8"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add
            </Button>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
              Enter to add, Esc to clear
            </span>
          </div>
        </td>
      </tr>
    </>
  )
}
