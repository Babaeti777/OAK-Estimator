import { useState, useCallback, useRef, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { CalculatorInput } from "@/components/ui/calculator-input"
import { useProject } from "@/contexts/ProjectContext"
import { MaterialBrowser } from "@/components/materials/MaterialBrowser"
import { AddLineItemDialog } from "@/components/line-items/AddLineItemDialog"
import { QuickAddRow } from "@/components/line-items/QuickAddRow"
import { TemplatesManager } from "@/components/line-items/TemplatesManager"
import type { LineItem } from "@/types"
import { Trash2, Table, Search, CheckSquare, Square, X, Calculator } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { DIVISIONS_ALL, getDivisionLabel } from "@/data/divisions"
import { useVirtualizer } from "@tanstack/react-virtual"

const ITEM_TYPES: Array<{ value: LineItem['type']; label: string }> = [
  { value: 'material', label: 'Material' },
  { value: 'labor', label: 'Labor' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'subcontractor', label: 'Subcontractor' },
  { value: 'misc', label: 'Miscellaneous' },
]

const ROW_HEIGHT = 56

interface LineItemsTableProps {
  selectedDivision: string
  onClearDivision: () => void
}

export function LineItemsTable({ selectedDivision, onClearDivision }: LineItemsTableProps) {
  const { currentProject, updateLineItem, deleteLineItem } = useProject()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const showQuickAdd = true
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // Debounce timers for each item's fields
  const debounceTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  // Fix #4: Clean up all debounce timers on unmount
  useEffect(() => {
    const timers = debounceTimers.current
    return () => {
      timers.forEach((timer) => clearTimeout(timer))
      timers.clear()
    }
  }, [])

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
    }, 500)

    debounceTimers.current.set(key, timer)
  }, [currentProject, updateLineItem])

  const filteredItems = useMemo(() => {
    if (!currentProject) return []
    return currentProject.lineItems.filter(item => {
      const matchesSearch =
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.division.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDivision = !selectedDivision || item.division === selectedDivision
      return matchesSearch && matchesDivision
    })
  }, [currentProject, searchTerm, selectedDivision])

  // Fix #1: Virtual scrolling for large lists
  const rowVirtualizer = useVirtualizer({
    count: filteredItems.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
  })

  if (!currentProject) {
    return null
  }

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

  // Use virtualization only when list is large enough to benefit
  const useVirtual = filteredItems.length > 50

  return (
    <Card className="bg-card">
      <CardHeader className="bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
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
                aria-label="Clear division filter"
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
                aria-label={`Delete ${selectedIds.size} selected items`}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={clearSelection}
                aria-label="Clear selection"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Fix #15: Table with proper mobile overflow handling */}
        <div className="border rounded-lg overflow-hidden">
          {/* Desktop table view */}
          <div className="hidden md:block">
            <div
              ref={tableContainerRef}
              className="overflow-auto"
              style={useVirtual ? { maxHeight: '600px' } : undefined}
            >
              <table className="w-full">
                <thead className="bg-muted/50 sticky top-0 z-10">
                  <tr className="border-b">
                    <th className="px-2 py-3 w-10">
                      <button
                        onClick={toggleSelectAll}
                        className="p-1.5 hover:bg-muted rounded min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label={selectedIds.size === filteredItems.length ? "Deselect all" : "Select all"}
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
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                        No line items yet. Click &quot;Add Item&quot; to get started.
                      </td>
                    </tr>
                  ) : useVirtual ? (
                    /* Fix #1: Virtualized rows for large lists */
                    <>
                      {rowVirtualizer.getVirtualItems().length > 0 && (
                        <tr style={{ height: `${rowVirtualizer.getVirtualItems()[0].start}px` }}>
                          <td colSpan={9} />
                        </tr>
                      )}
                      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const item = filteredItems[virtualRow.index]
                        return (
                          <LineItemRow
                            key={item.id}
                            item={item}
                            isSelected={selectedIds.has(item.id)}
                            onToggleSelect={toggleSelectItem}
                            onUpdate={handleUpdateItem}
                            onDelete={handleDeleteItem}
                          />
                        )
                      })}
                      {rowVirtualizer.getVirtualItems().length > 0 && (
                        <tr style={{
                          height: `${rowVirtualizer.getTotalSize() -
                            (rowVirtualizer.getVirtualItems()[rowVirtualizer.getVirtualItems().length - 1].end)}px`
                        }}>
                          <td colSpan={9} />
                        </tr>
                      )}
                    </>
                  ) : (
                    /* Fix #8: Regular rows without Framer Motion animation */
                    filteredItems.map((item) => (
                      <LineItemRow
                        key={item.id}
                        item={item}
                        isSelected={selectedIds.has(item.id)}
                        onToggleSelect={toggleSelectItem}
                        onUpdate={handleUpdateItem}
                        onDelete={handleDeleteItem}
                      />
                    ))
                  )}

                  {/* Quick Add Row */}
                  {showQuickAdd && <QuickAddRow />}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fix #15: Mobile card layout */}
          <div className="md:hidden divide-y divide-border">
            {filteredItems.length === 0 ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                No line items yet. Tap &quot;Add Item&quot; to get started.
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 space-y-2 ${selectedIds.has(item.id) ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <button
                        onClick={() => toggleSelectItem(item.id)}
                        className="p-1.5 hover:bg-muted rounded mt-0.5 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label={selectedIds.has(item.id) ? `Deselect ${item.description}` : `Select ${item.description}`}
                      >
                        {selectedIds.has(item.id) ? (
                          <CheckSquare className="w-4 h-4 text-primary" />
                        ) : (
                          <Square className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{item.description}</div>
                        <div className="text-xs text-muted-foreground">
                          {getDivisionLabel(item.division)} &middot; {item.type}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteItem(item.id)}
                      className="h-11 w-11 text-destructive hover:text-destructive hover:bg-destructive/10"
                      aria-label={`Delete ${item.description}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 pl-12">
                    <div className="flex-1 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-xs text-muted-foreground block">Qty</span>
                        <CalculatorInput
                          value={item.quantity}
                          onChange={(value) => handleUpdateItem(item.id, { quantity: value })}
                          className="h-8 text-sm w-full"
                          placeholder="Qty"
                        />
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">Unit Cost</span>
                        <CalculatorInput
                          value={item.unitCost}
                          onChange={(value) => handleUpdateItem(item.id, { unitCost: value })}
                          className="h-8 text-sm w-full"
                          placeholder="Cost"
                        />
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">Total</span>
                        <div className="h-8 flex items-center font-medium text-sm">
                          {formatCurrency(item.totalCost)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            {showQuickAdd && (
              <div className="p-3">
                <QuickAddRow />
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filteredItems.length > 0 && (
              `Showing ${filteredItems.length} of ${currentProject.lineItems.length} items`
            )}
          </span>
          <div className="hidden sm:flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <Calculator className="w-3 h-3" />
              Quantity supports math: 2+3, 10*5, (4+2)*3
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Fix #8: Extracted row component without Framer Motion, using CSS transitions
function LineItemRow({
  item,
  isSelected,
  onToggleSelect,
  onUpdate,
  onDelete,
}: {
  item: LineItem
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onUpdate: (id: string, updates: Partial<LineItem>) => void
  onDelete: (id: string) => void
}) {
  return (
    <tr className={`hover:bg-muted/30 transition-colors ${isSelected ? 'bg-primary/5' : ''}`}>
      {/* Selection */}
      <td className="px-2 py-3">
        <button
          onClick={() => onToggleSelect(item.id)}
          className="p-1.5 hover:bg-muted rounded min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={isSelected ? `Deselect ${item.description}` : `Select ${item.description}`}
        >
          {isSelected ? (
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
          onChange={(e) => onUpdate(item.id, { division: e.target.value })}
          className="h-8 text-sm"
          aria-label="Division"
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
          onChange={(e) => onUpdate(item.id, { description: e.target.value })}
          className="h-8 text-sm"
          placeholder="Item description"
          aria-label="Description"
        />
      </td>

      {/* Type */}
      <td className="px-4 py-3">
        <Select
          value={item.type}
          onChange={(e) => onUpdate(item.id, { type: e.target.value as LineItem['type'] })}
          className="h-8 text-sm"
          aria-label="Type"
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
        <CalculatorInput
          value={item.quantity}
          onChange={(value) => onUpdate(item.id, { quantity: value })}
          className="h-8 text-sm text-right w-28"
          placeholder="e.g. 2+3"
        />
      </td>

      {/* Unit */}
      <td className="px-4 py-3">
        <Input
          value={item.unit}
          onChange={(e) => onUpdate(item.id, { unit: e.target.value })}
          className="h-8 text-sm w-20"
          placeholder="EA"
          aria-label="Unit"
        />
      </td>

      {/* Unit Cost */}
      <td className="px-4 py-3">
        <CalculatorInput
          value={item.unitCost}
          onChange={(value) => onUpdate(item.id, { unitCost: value })}
          className="h-8 text-sm text-right w-28"
          placeholder="e.g. 100*1.1"
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
          onClick={() => onDelete(item.id)}
          className="h-11 w-11 text-destructive hover:text-destructive hover:bg-destructive/10"
          aria-label={`Delete ${item.description}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </td>
    </tr>
  )
}
