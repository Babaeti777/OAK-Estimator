import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useProject } from "@/contexts/ProjectContext"
import { Plus, Zap } from "lucide-react"
import type { LineItem } from "@/types"
import { toast } from "@/hooks/use-toast"
import { DIVISIONS_ALL } from "@/data/divisions"

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
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    division: '01',
    description: '',
    type: 'material' as LineItem['type'],
    quantity: 1,
    unit: 'EA',
    unitCost: 0,
  })
  const descriptionRef = useRef<HTMLInputElement>(null)

  // Focus description when adding starts
  useEffect(() => {
    if (isAdding && descriptionRef.current) {
      descriptionRef.current.focus()
    }
  }, [isAdding])

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

      // Keep focus on description for rapid entry
      if (descriptionRef.current) {
        descriptionRef.current.focus()
      }
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
      setIsAdding(false)
      resetForm()
    }
  }

  if (!isAdding) {
    return (
      <tr className="border-t border-dashed border-muted">
        <td colSpan={9} className="px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="w-full justify-center text-muted-foreground hover:text-foreground"
          >
            <Zap className="w-4 h-4 mr-2" />
            Quick Add Row (Press Enter to add, Escape to cancel)
          </Button>
        </td>
      </tr>
    )
  }

  return (
    <tr className="bg-primary/5 border-t-2 border-primary" onKeyDown={handleKeyDown}>
      {/* Empty cell for checkbox column */}
      <td className="px-2 py-2"></td>

      {/* Division */}
      <td className="px-4 py-2">
        <Select
          value={formData.division}
          onChange={(e) => setFormData({ ...formData, division: e.target.value })}
          className="h-8 text-sm"
        >
          {DIVISIONS_ALL.map(div => (
            <option key={div.code} value={div.code}>
              {div.code} - {div.name}
            </option>
          ))}
        </Select>
      </td>

      {/* Description */}
      <td className="px-4 py-2">
        <Input
          ref={descriptionRef}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter description..."
          className="h-8 text-sm"
        />
      </td>

      {/* Type */}
      <td className="px-4 py-2">
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

      {/* Quantity */}
      <td className="px-4 py-2">
        <Input
          type="number"
          value={formData.quantity}
          onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
          className="h-8 text-sm text-right"
          step="0.01"
        />
      </td>

      {/* Unit */}
      <td className="px-4 py-2">
        <Input
          value={formData.unit}
          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          className="h-8 text-sm w-20"
          placeholder="EA"
        />
      </td>

      {/* Unit Cost */}
      <td className="px-4 py-2">
        <Input
          type="number"
          value={formData.unitCost}
          onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
          className="h-8 text-sm text-right"
          step="0.01"
        />
      </td>

      {/* Total (calculated) */}
      <td className="px-4 py-2 text-right text-sm font-medium">
        ${(formData.quantity * formData.unitCost).toFixed(2)}
      </td>

      {/* Actions */}
      <td className="px-4 py-2">
        <Button
          size="sm"
          onClick={handleSubmit}
          className="h-8"
        >
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </td>
    </tr>
  )
}
