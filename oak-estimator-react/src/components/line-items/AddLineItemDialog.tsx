import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { useProject } from "@/contexts/ProjectContext"
import { Plus } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { LineItem } from "@/types"

const ALL_DIVISIONS = [
  { code: '01', name: 'General Requirements' },
  { code: '02', name: 'Existing Conditions' },
  { code: '03', name: 'Concrete' },
  { code: '04', name: 'Masonry' },
  { code: '05', name: 'Metals' },
  { code: '06', name: 'Wood, Plastics & Composites' },
  { code: '07', name: 'Thermal & Moisture Protection' },
  { code: '08', name: 'Openings' },
  { code: '09', name: 'Finishes' },
  { code: '10', name: 'Specialties' },
  { code: '11', name: 'Equipment' },
  { code: '12', name: 'Furnishings' },
  { code: '13', name: 'Special Construction' },
  { code: '14', name: 'Conveying Equipment' },
  { code: '21', name: 'Fire Suppression' },
  { code: '22', name: 'Plumbing' },
  { code: '23', name: 'HVAC' },
  { code: '26', name: 'Electrical' },
  { code: '27', name: 'Communications' },
  { code: '28', name: 'Electronic Safety & Security' },
  { code: '31', name: 'Earthwork' },
]

const ITEM_TYPES: Array<{ value: LineItem['type']; label: string }> = [
  { value: 'material', label: 'Material' },
  { value: 'labor', label: 'Labor' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'subcontractor', label: 'Subcontractor' },
  { value: 'misc', label: 'Miscellaneous' },
]

export function AddLineItemDialog() {
  const { addLineItem } = useProject()
  const [open, setOpen] = useState(false)
  const [division, setDivision] = useState('03')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<LineItem['type']>('material')
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState('EA')
  const [unitCost, setUnitCost] = useState(0)

  const handleCreate = async () => {
    if (!description.trim()) {
      toast({
        variant: "destructive",
        title: "Description required",
        description: "Please enter a description for the line item",
      })
      return
    }

    try {
      await addLineItem({
        division,
        description: description.trim(),
        type,
        quantity,
        unit,
        unitCost,
        totalCost: quantity * unitCost,
      })

      toast({
        title: "Line item added",
        description: "Your line item has been added successfully",
      })

      // Reset form
      setOpen(false)
      setDivision('03')
      setDescription('')
      setType('material')
      setQuantity(1)
      setUnit('EA')
      setUnitCost(0)
    } catch (error: any) {
      console.error('Failed to add line item:', error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) {
        // Reset on close
        setDivision('03')
        setDescription('')
        setType('material')
        setQuantity(1)
        setUnit('EA')
        setUnitCost(0)
      }
    }}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Line Item</DialogTitle>
          <DialogDescription>
            Enter the details for your new line item
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="division">Division</Label>
            <Select
              id="division"
              value={division}
              onChange={(e) => setDivision(e.target.value)}
            >
              {ALL_DIVISIONS.map((div) => (
                <option key={div.code} value={div.code}>
                  {div.code} - {div.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              placeholder="e.g., Concrete Slab on Grade, 4 inch"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as LineItem['type'])}
              >
                {ITEM_TYPES.map((itemType) => (
                  <option key={itemType.value} value={itemType.value}>
                    {itemType.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                placeholder="EA, SF, CY, etc."
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitCost">Unit Cost ($)</Label>
              <Input
                id="unitCost"
                type="number"
                min="0"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-semibold text-foreground">
              Total Cost: ${(quantity * unitCost).toFixed(2)}
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={handleCreate}
              disabled={!description.trim()}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Line Item
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
