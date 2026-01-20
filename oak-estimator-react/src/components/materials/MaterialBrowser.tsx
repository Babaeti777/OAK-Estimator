import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { useProject } from "@/contexts/ProjectContext"
import { Package, Search, Plus } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

// Mock materials data - In production, this would come from the materials database
const MOCK_MATERIALS = [
  {
    id: "01-001",
    division: "01",
    divisionName: "General Requirements",
    category: "Project Staff",
    description: "Project Manager - Senior",
    unit: "hr",
    unitCost: 125.00,
    notes: "Experienced PM with 10+ years"
  },
  {
    id: "03-001",
    division: "03",
    divisionName: "Concrete",
    category: "Concrete Materials",
    description: "Concrete, 3000 PSI",
    unit: "CY",
    unitCost: 165.00,
    notes: "Ready-mix concrete"
  },
  {
    id: "03-002",
    division: "03",
    divisionName: "Concrete",
    category: "Concrete Accessories",
    description: "Rebar, #4 Grade 60",
    unit: "Ton",
    unitCost: 850.00,
    notes: "Deformed steel rebar"
  },
  {
    id: "09-001",
    division: "09",
    divisionName: "Finishes",
    category: "Painting",
    description: "Interior Paint, Premium",
    unit: "GAL",
    unitCost: 45.00,
    notes: "Low-VOC latex paint"
  },
]

const DIVISIONS = [
  { code: '', name: 'All Divisions' },
  { code: '01', name: '01 - General Requirements' },
  { code: '02', name: '02 - Existing Conditions' },
  { code: '03', name: '03 - Concrete' },
  { code: '04', name: '04 - Masonry' },
  { code: '05', name: '05 - Metals' },
  { code: '06', name: '06 - Wood, Plastics & Composites' },
  { code: '07', name: '07 - Thermal & Moisture Protection' },
  { code: '08', name: '08 - Openings' },
  { code: '09', name: '09 - Finishes' },
  { code: '10', name: '10 - Specialties' },
]

interface MaterialBrowserProps {
  trigger?: React.ReactNode
}

export function MaterialBrowser({ trigger }: MaterialBrowserProps) {
  const { addLineItem } = useProject()
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDivision, setSelectedDivision] = useState("")

  const filteredMaterials = MOCK_MATERIALS.filter(material => {
    const matchesSearch = material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDivision = !selectedDivision || material.division === selectedDivision
    return matchesSearch && matchesDivision
  })

  const handleAddToProject = async (material: typeof MOCK_MATERIALS[0]) => {
    try {
      await addLineItem({
        division: material.division,
        description: material.description,
        type: 'material',
        quantity: 1,
        unit: material.unit,
        unitCost: material.unitCost,
        totalCost: material.unitCost,
        materialId: material.id,
        notes: material.notes,
      })

      toast({
        title: "Material added",
        description: `${material.description} has been added to your project`,
      })

      setOpen(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to add material",
        description: error.message,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Package className="w-4 h-4 mr-2" />
            Browse Materials
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Material Database
          </DialogTitle>
          <DialogDescription>
            Browse and add materials to your project. Database contains 2,953 items.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
            >
              {DIVISIONS.map(div => (
                <option key={div.code} value={div.code}>
                  {div.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Materials List */}
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-muted/50 sticky top-0">
                  <tr className="border-b">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Code
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                      Category
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">
                      Unit Cost
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredMaterials.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        No materials found. Try adjusting your search.
                      </td>
                    </tr>
                  ) : (
                    filteredMaterials.map((material) => (
                      <tr key={material.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {material.id}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm">{material.description}</div>
                          {material.notes && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {material.notes}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">
                          {material.category}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="font-medium text-sm">
                            {formatCurrency(material.unitCost)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            per {material.unit}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            size="sm"
                            onClick={() => handleAddToProject(material)}
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="text-sm text-muted-foreground text-center">
            Showing {filteredMaterials.length} materials
            <div className="text-xs mt-1">
              💡 Tip: Use the full materials-database.js file for access to all 2,953 items
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
