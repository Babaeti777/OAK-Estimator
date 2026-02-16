import { useState, useEffect, useMemo, useCallback } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { useProject } from "@/contexts/ProjectContext"
import { Package, Search, Plus } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { MaterialsDatabase } from "@/data/materials-database"
import { DIVISION_FILTERS } from "@/data/divisions"

// Transform the database into a flat array for searching
interface MaterialItem {
  id: string
  division: string
  divisionName: string
  category: string
  description: string
  unit: string
  unitCost: number
  notes?: string
}

// Fix #2: Pre-flatten at module level so it's computed once on import, not per render
const FLAT_MATERIALS_LIST: MaterialItem[] = (() => {
  const materials: MaterialItem[] = []

  Object.entries(MaterialsDatabase).forEach(([key, value]) => {
    if (key === 'version' || key === 'lastUpdated' || key === 'currency' || key === 'totalItems' || key === 'buildDate') {
      return
    }

    const division = value as { name: string; items: any[] }
    if (division.items && Array.isArray(division.items)) {
      division.items.forEach((item: any) => {
        const unitCost = (item.material || 0) + (item.labor || 0) + (item.equipment || 0)

        materials.push({
          id: item.id,
          division: key,
          divisionName: division.name,
          category: item.category || 'General',
          description: item.description,
          unit: item.unit,
          unitCost: unitCost,
          notes: item.notes,
        })
      })
    }
  })

  return materials
})()

interface MaterialBrowserProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  initialDivision?: string
}

export function MaterialBrowser({ trigger, open: controlledOpen, onOpenChange, initialDivision }: MaterialBrowserProps) {
  const { addLineItem } = useProject()
  const [internalOpen, setInternalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDivision, setSelectedDivision] = useState(initialDivision || "")
  const [displayLimit, setDisplayLimit] = useState(50)

  // Fix #2: Use pre-flattened module-level data directly
  const allMaterials = FLAT_MATERIALS_LIST

  // Sync internal state with external control
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen)
    } else {
      setInternalOpen(newOpen)
    }
  }

  // Reset division filter when initialDivision changes
  useEffect(() => {
    if (initialDivision !== undefined) {
      setSelectedDivision(initialDivision)
    }
  }, [initialDivision])

  // Fix #7: Separate total filtered from displayed items for load-more
  const allFilteredMaterials = useMemo(() => {
    return allMaterials.filter(material => {
      const matchesSearch = !searchTerm ||
        material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.id.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDivision = !selectedDivision || material.division === selectedDivision
      return matchesSearch && matchesDivision
    })
  }, [allMaterials, searchTerm, selectedDivision])

  const filteredMaterials = useMemo(() => {
    return allFilteredMaterials.slice(0, displayLimit)
  }, [allFilteredMaterials, displayLimit])

  const hasMore = allFilteredMaterials.length > displayLimit

  const loadMore = useCallback(() => {
    setDisplayLimit(prev => prev + 50)
  }, [])

  // Reset display limit when filters change
  useEffect(() => {
    setDisplayLimit(50)
  }, [searchTerm, selectedDivision])

  const handleAddToProject = async (material: MaterialItem) => {
    try {
      // Build line item data, excluding undefined values (Firestore doesn't accept undefined)
      const lineItemData: Parameters<typeof addLineItem>[0] = {
        division: material.division,
        description: material.description,
        type: 'material',
        quantity: 1,
        unit: material.unit,
        unitCost: material.unitCost,
        totalCost: material.unitCost,
      }

      // Only add optional fields if they have values
      if (material.id) lineItemData.materialId = material.id
      if (material.notes) lineItemData.notes = material.notes

      await addLineItem(lineItemData)

      toast({
        title: "Material added",
        description: `${material.description} has been added to your project`,
      })

      setSearchTerm("")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to add material",
        description: error.message,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
            Browse and add materials to your project. Database contains {allMaterials.length.toLocaleString()} items.
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
              {DIVISION_FILTERS.map(div => (
                <option key={div.code} value={div.code}>
                  {div.code ? `${div.code} - ${div.name}` : div.name}
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

          <div className="text-sm text-muted-foreground text-center space-y-2">
            <div>
              Showing {filteredMaterials.length} of {allFilteredMaterials.length} materials
              {allFilteredMaterials.length < allMaterials.length && ` (${allMaterials.length} total)`}
            </div>
            {hasMore && (
              <Button
                variant="outline"
                size="sm"
                onClick={loadMore}
              >
                Load More ({allFilteredMaterials.length - displayLimit} remaining)
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
