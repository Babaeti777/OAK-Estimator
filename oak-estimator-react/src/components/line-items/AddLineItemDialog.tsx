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
import { Plus, Search, Package } from "lucide-react"
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
  const [step, setStep] = useState<'division' | 'method' | 'custom'>('division')
  const [selectedDivision, setSelectedDivision] = useState('')

  // Custom line item form state
  const [description, setDescription] = useState('')
  const [type, setType] = useState<LineItem['type']>('material')
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState('EA')
  const [unitCost, setUnitCost] = useState(0)

  const handleDivisionSelect = (divisionCode: string) => {
    setSelectedDivision(divisionCode)
    setStep('method')
  }

  const handleCustomCreate = async () => {
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
        division: selectedDivision,
        description: description.trim(),
        type,
        quantity,
        unit,
        unitCost,
        totalCost: quantity * unitCost,
      })

      toast({
        title: "Line item added",
        description: "Your custom line item has been added successfully",
      })

      // Reset form
      setOpen(false)
      setStep('division')
      setSelectedDivision('')
      setDescription('')
      setType('material')
      setQuantity(1)
      setUnit('EA')
      setUnitCost(0)
    } catch (error: any) {
      console.error('Failed to add line item:', error)
    }
  }

  const selectedDivisionName = ALL_DIVISIONS.find(d => d.code === selectedDivision)?.name

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen)
      if (!isOpen) {
        // Reset on close
        setStep('division')
        setSelectedDivision('')
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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'division' && 'Select Division'}
            {step === 'method' && `Add Item - Division ${selectedDivision}`}
            {step === 'custom' && 'Create Custom Line Item'}
          </DialogTitle>
          <DialogDescription>
            {step === 'division' && 'Choose the CSI MasterFormat division for this line item'}
            {step === 'method' && `${selectedDivisionName}`}
            {step === 'custom' && `Division ${selectedDivision} - ${selectedDivisionName}`}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Division Selection */}
        {step === 'division' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
            {ALL_DIVISIONS.map((division) => (
              <Button
                key={division.code}
                variant="outline"
                className="h-auto py-3 justify-start text-left"
                onClick={() => handleDivisionSelect(division.code)}
              >
                <div>
                  <div className="font-semibold">
                    {division.code} - {division.name}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        )}

        {/* Step 2: Method Selection */}
        {step === 'method' && (
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-24 flex-col gap-2"
              onClick={() => {
                // TODO: Open materials browser filtered by division
                toast({
                  title: "Materials browser",
                  description: "Browse materials from division " + selectedDivision,
                })
              }}
            >
              <Search className="w-6 h-6" />
              <div className="text-center">
                <p className="font-semibold">Browse Materials Database</p>
                <p className="text-xs text-muted-foreground">
                  Select from pre-defined materials in this division
                </p>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full h-24 flex-col gap-2"
              onClick={() => setStep('custom')}
            >
              <Package className="w-6 h-6" />
              <div className="text-center">
                <p className="font-semibold">Create Custom Line Item</p>
                <p className="text-xs text-muted-foreground">
                  Manually enter a custom item for this division
                </p>
              </div>
            </Button>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setStep('division')
                setSelectedDivision('')
              }}
            >
              ← Back to Division Selection
            </Button>
          </div>
        )}

        {/* Step 3: Custom Line Item Form */}
        {step === 'custom' && (
          <div className="space-y-4">
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

            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium">
                Total Cost: ${(quantity * unitCost).toFixed(2)}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep('method')}
              >
                ← Back
              </Button>
              <Button
                className="flex-1"
                onClick={handleCustomCreate}
                disabled={!description.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Line Item
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
