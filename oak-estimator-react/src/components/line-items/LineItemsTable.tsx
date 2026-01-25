import { useState, useCallback, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { useProject } from "@/contexts/ProjectContext"
import { MaterialBrowser } from "@/components/materials/MaterialBrowser"
import { AddLineItemDialog } from "@/components/line-items/AddLineItemDialog"
import { QuickAddRow } from "@/components/line-items/QuickAddRow"
import { TemplatesManager } from "@/components/line-items/TemplatesManager"
import type { LineItem } from "@/types"
import { Trash2, Table, Search, CheckSquare, Square, X } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "@/hooks/use-toast"
import { DIVISIONS_ALL, getDivisionLabel } from "@/data/divisions"

const ITEM_TYPES: Array<{ value: LineItem['type']; label: string }> = [
  { value: 'material', label: 'Material' },
  { value: 'labor', label: 'Labor' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'subcontractor', label: 'Subcontractor' },
  { value: 'misc', label: 'Miscellaneous' },
]

interface LineItemsTableProps {
  selectedDivision: string
  onClearDivision: () => void
}

export function LineItemsTable({ selectedDivision, onClearDivision }: LineItemsTableProps) {
  const { currentProject, updateLineItem, deleteLineItem } = useProject()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const showQuickAdd = true

  // Debounce timers for each item's fields
  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // Debounced update function to prevent excessive Firestore writes
  const debouncedUpdate = useCallback((itemId: string, updates: Partial<LineItem>) => {
    const key = `${itemId}-${Object.keys(updates).join('-')}`

    // Clear existing timer for this item/field combination
    const existingTimer = debounceTimers.current.get(key)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }

    // Set new timer
    const timer = setTimeout(async () => {
      debounceTimers.current.delete(key)

      if (!currentProject) return

      try {
        // Recalculate total if quantity or unit cost changed
        const item = currentProject.lineItems.find(i => i.id === itemId)
        if (item) {
          const quantity = updates.quantity ?? item.quantity
          const unitCost = updates.unitCost ?? item.unitCost
          const totalCost = quantity * unitCost

          await updateLineItem(itemId, { ...updates, totalCost })
        }
      } catch (error: any) {
        console.error('Failed to update line item:', error)
        toast({
          variant: "destructive",
          title: "Failed to update line item",
          description: error.message || "An error occurred while saving changes",
        })
      }
    }, 500) // 500ms debounce delay

    debounceTimers.current.set(key, timer)
  }, [currentProject, updateLineItem])

  if (!currentProject) {
    return null
  }

  const filteredItems = currentProject.lineItems.filter(item => {
    const matchesSearch =
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.division.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDivision = !selectedDivision || item.division === selectedDivision

    return matchesSearch && matchesDivision
  })

  const handleUpdateItem = (itemId: string, updates: Partial<LineItem>) => {
    debouncedUpdate(itemId, updates)
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteLineItem(itemId)
      setSelectedIds(prev => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    } catch (error: any) {
      console.error('Failed to delete line item:', error)
      toast({
        variant: "destructive",
        title: "Failed to delete line item",
        description: error.message || "An error occurred while deleting the item",
      })
    }
  }

  // Bulk selection handlers
  const toggleSelectItem = (itemId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredItems.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredItems.map(item => item.id)))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return

    if (!confirm(`Delete ${selectedIds.size} selected item(s)? This cannot be undone.`)) return

    try {
      for (const itemId of selectedIds) {
        await deleteLineItem(itemId)
      }
      setSelectedIds(new Set())
      toast({
        title: "Items deleted",
        description: `${selectedIds.size} items have been deleted`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to delete items",
        description: error.message,
      })
    }
  }

  const clearSelection = () => {
    setSelectedIds(new Set())
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Table className="w-5 h-5 text-primary" />
              <div>
                <CardTitle>Line Items</CardTitle>
                <CardDescription>
                  Manage project costs and materials
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TemplatesManager />
              <MaterialBrowser initialDivision={selectedDivision || undefined} />
              <AddLineItemDialog />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar and Bulk Actions */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search line items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Division Filter */}
            {selectedDivision && (
              <div className="flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground">
                <span>{getDivisionLabel(selectedDivision)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearDivision}
                  className="h-6 px-2 text-xs"
                >
                  Clear
                </Button>
              </div>
            )}

            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                <span className="text-sm font-medium">{selectedIds.size} selected</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={clearSelection}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr className="border-b">
                    <th className="px-2 py-3 w-10">
                      <button
                        onClick={toggleSelectAll}
                        className="p-1 hover:bg-muted rounded"
                        title={selectedIds.size === filteredItems.length ? "Deselect all" : "Select all"}
                      >
                        {selectedIds.size === filteredItems.length && filteredItems.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-primary" />
                        ) : (
                          <Square className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Division
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Unit
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Unit Cost
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-20">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  <AnimatePresence>
                    {filteredItems.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                          No line items yet. Click "Add Item" to get started.
                        </td>
                      </tr>
                    ) : (
                      filteredItems.map((item, index) => (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`hover:bg-muted/30 transition-colors ${selectedIds.has(item.id) ? 'bg-primary/5' : ''}`}
                        >
                          {/* Selection */}
                          <td className="px-2 py-3">
                            <button
                              onClick={() => toggleSelectItem(item.id)}
                              className="p-1 hover:bg-muted rounded"
                            >
                              {selectedIds.has(item.id) ? (
                                <CheckSquare className="w-4 h-4 text-primary" />
                              ) : (
                                <Square className="w-4 h-4 text-muted-foreground" />
                              )}
                            </button>
                          </td>
                          {/* Division */}
                          <td className="px-4 py-3">
                            <Select
                              value={item.division}
                              onChange={(e) => handleUpdateItem(item.id, { division: e.target.value })}
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
                          <td className="px-4 py-3">
                            <Input
                              value={item.description}
                              onChange={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                              className="h-8 text-sm"
                              placeholder="Item description"
                            />
                          </td>

                          {/* Type */}
                          <td className="px-4 py-3">
                            <Select
                              value={item.type}
                              onChange={(e) => handleUpdateItem(item.id, { type: e.target.value as LineItem['type'] })}
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
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleUpdateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                              className="h-8 text-sm text-right"
                              step="0.01"
                            />
                          </td>

                          {/* Unit */}
                          <td className="px-4 py-3">
                            <Input
                              value={item.unit}
                              onChange={(e) => handleUpdateItem(item.id, { unit: e.target.value })}
                              className="h-8 text-sm w-20"
                              placeholder="EA"
                            />
                          </td>

                          {/* Unit Cost */}
                          <td className="px-4 py-3">
                            <Input
                              type="number"
                              value={item.unitCost}
                              onChange={(e) => handleUpdateItem(item.id, { unitCost: parseFloat(e.target.value) || 0 })}
                              className="h-8 text-sm text-right"
                              step="0.01"
                            />
                          </td>

                          {/* Total */}
                          <td className="px-4 py-3 text-right font-medium text-sm">
                            {formatCurrency(item.totalCost)}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteItem(item.id)}
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </AnimatePresence>

                  {/* Quick Add Row */}
                  {showQuickAdd && <QuickAddRow />}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filteredItems.length > 0 && (
                `Showing ${filteredItems.length} of ${currentProject.lineItems.length} items`
              )}
            </span>
            <span className="text-xs">
              Press Enter in Quick Add row to add items rapidly
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
