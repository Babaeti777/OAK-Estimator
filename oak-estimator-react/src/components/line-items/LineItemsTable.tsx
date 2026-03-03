import { useState, useCallback, useRef, useEffect, useMemo, memo } from "react"
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
import { DescriptionSearchInput } from "@/components/line-items/DescriptionSearchInput"
import type { LineItem } from "@/types"
import { Trash2, Table, Search, CheckSquare, Square, X, Calculator, ChevronDown, ChevronRight, Layers } from "lucide-react"
import { formatCurrency, getErrorMessage } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { getDivisionLabel, DIVISIONS_ALL } from "@/data/divisions"
import type { DivisionItem } from "@/data/division-items"
import { useVirtualizer } from "@tanstack/react-virtual"
import { useConfirmDialog } from "@/components/ui/confirm-dialog"

const ITEM_TYPES: Array<{ value: LineItem['type']; label: string }> = [
  { value: 'material', label: 'Material' },
  { value: 'labor', label: 'Labor' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'subcontractor', label: 'Subcontractor' },
  { value: 'misc', label: 'Misc' },
]

const TYPE_LABELS: Record<LineItem['type'], { letter: string; color: string }> = {
  material:      { letter: 'M', color: 'bg-blue-500/15 text-blue-700 dark:text-blue-400' },
  labor:         { letter: 'L', color: 'bg-amber-500/15 text-amber-700 dark:text-amber-400' },
  equipment:     { letter: 'E', color: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400' },
  subcontractor: { letter: 'S', color: 'bg-purple-500/15 text-purple-700 dark:text-purple-400' },
  misc:          { letter: 'X', color: 'bg-slate-500/15 text-slate-700 dark:text-slate-400' },
}

const ROW_HEIGHT = 48

interface LineItemsTableProps {
  selectedDivision: string
  onClearDivision: () => void
}

export function LineItemsTable({ selectedDivision, onClearDivision }: LineItemsTableProps) {
  const { currentProject, updateLineItem, deleteLineItem, deleteLineItems } = useProject()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set())
  const showQuickAdd = true
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const confirm = useConfirmDialog()

  const toggleGroupCollapse = useCallback((groupId: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      return next
    })
  }, [])

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
      } catch (error: unknown) {
        console.error('Failed to update line item:', error)
        toast({
          variant: "destructive",
          title: "Failed to update line item",
          description: getErrorMessage(error) || "An error occurred while saving changes",
        })
      }
    }, 500)

    debounceTimers.current.set(key, timer)
  }, [currentProject, updateLineItem])

  const filteredItems = useMemo(() => {
    if (!currentProject) return []

    const allItems = currentProject.lineItems
    const query = searchTerm.toLowerCase()

    // Build ordered list: standalone items, then groups with children underneath
    const standaloneItems = allItems.filter(i => !i.isGroup && !i.parentId)
    const groups = allItems.filter(i => i.isGroup)

    const ordered: LineItem[] = []

    // Insert standalone items and groups in order
    const combined = [...standaloneItems, ...groups].sort((a, b) => a.order - b.order)

    for (const item of combined) {
      if (item.isGroup) {
        // Get children for this group
        const children = allItems
          .filter(c => c.parentId === item.id)
          .sort((a, b) => a.order - b.order)

        // Check if group or any child matches filters
        const groupMatches =
          item.description.toLowerCase().includes(query) ||
          item.division.toLowerCase().includes(query)
        const childMatches = children.some(c =>
          c.description.toLowerCase().includes(query) ||
          c.division.toLowerCase().includes(query)
        )
        const matchesDivision = !selectedDivision ||
          item.division === selectedDivision ||
          children.some(c => c.division === selectedDivision)

        if ((groupMatches || childMatches || !query) && matchesDivision) {
          ordered.push(item)
          // Add children if not collapsed
          if (!collapsedGroups.has(item.id)) {
            for (const child of children) {
              const childMatchesSearch = !query ||
                child.description.toLowerCase().includes(query) ||
                child.division.toLowerCase().includes(query)
              const childMatchesDivision = !selectedDivision || child.division === selectedDivision
              if (childMatchesSearch && childMatchesDivision) {
                ordered.push(child)
              }
            }
          }
        }
      } else {
        // Standalone item — normal filtering
        const matchesSearch = !query ||
          item.description.toLowerCase().includes(query) ||
          item.division.toLowerCase().includes(query)
        const matchesDivision = !selectedDivision || item.division === selectedDivision
        if (matchesSearch && matchesDivision) {
          ordered.push(item)
        }
      }
    }

    return ordered
  }, [currentProject, searchTerm, selectedDivision, collapsedGroups])

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
      // If deleting a group, also delete all children
      const item = currentProject.lineItems.find(i => i.id === itemId)
      if (item?.isGroup) {
        const childIds = currentProject.lineItems
          .filter(c => c.parentId === itemId)
          .map(c => c.id)
        if (childIds.length > 0) {
          await deleteLineItems([itemId, ...childIds])
        } else {
          await deleteLineItem(itemId)
        }
      } else {
        await deleteLineItem(itemId)
      }
      setSelectedIds(prev => {
        const next = new Set(prev)
        next.delete(itemId)
        return next
      })
    } catch (error: unknown) {
      console.error('Failed to delete line item:', error)
      toast({
        variant: "destructive",
        title: "Failed to delete line item",
        description: getErrorMessage(error) || "An error occurred while deleting the item",
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

    const confirmed = await confirm({
      title: "Delete Items",
      description: `Delete ${selectedIds.size} selected item(s)? This cannot be undone.`,
      confirmText: "Delete",
      variant: "destructive",
    })

    if (!confirmed) return

    try {
      const idsToDelete = new Set<string>(selectedIds)
      for (const itemId of selectedIds) {
        const item = currentProject.lineItems.find(i => i.id === itemId)
        if (item?.isGroup) {
          currentProject.lineItems
            .filter(c => c.parentId === itemId)
            .forEach(c => idsToDelete.add(c.id))
        }
      }
      await deleteLineItems(Array.from(idsToDelete))
      setSelectedIds(new Set())
      toast({
        title: "Items deleted",
        description: `${idsToDelete.size} items have been deleted`,
      })
    } catch (error: unknown) {
      toast({
        variant: "destructive",
        title: "Failed to delete items",
        description: getErrorMessage(error),
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
              <table className="w-full table-fixed">
                <thead className="bg-muted/50 sticky top-0 z-10">
                  <tr className="border-b">
                    <th className="px-2 py-2 w-10">
                      <button
                        onClick={toggleSelectAll}
                        className="p-1 hover:bg-muted rounded min-w-[36px] min-h-[36px] flex items-center justify-center"
                        aria-label={selectedIds.size === filteredItems.length ? "Deselect all" : "Select all"}
                      >
                        {selectedIds.size === filteredItems.length && filteredItems.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-primary" />
                        ) : (
                          <Square className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    </th>
                    <th className="px-1 py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-10">
                      #
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">
                      Division
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-14">
                      Type
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-28">
                      Quantity
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider w-20">
                      Unit
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-28">
                      Unit Cost
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider w-28">
                      Total
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider w-14">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-3 py-6 text-center text-muted-foreground">
                        No line items yet. Click &quot;Add Item&quot; to get started.
                      </td>
                    </tr>
                  ) : useVirtual ? (
                    /* Fix #1: Virtualized rows for large lists */
                    <>
                      {rowVirtualizer.getVirtualItems().length > 0 && (
                        <tr style={{ height: `${rowVirtualizer.getVirtualItems()[0].start}px` }}>
                          <td colSpan={10} />
                        </tr>
                      )}
                      {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                        const item = filteredItems[virtualRow.index]
                        if (item.isGroup) {
                          return (
                            <GroupHeaderRow
                              key={item.id}
                              item={item}
                              isCollapsed={collapsedGroups.has(item.id)}
                              onToggleCollapse={toggleGroupCollapse}
                              childCount={currentProject.lineItems.filter(c => c.parentId === item.id).length}
                              childTotal={currentProject.lineItems.filter(c => c.parentId === item.id).reduce((s, c) => s + c.totalCost, 0)}
                              onUpdate={handleUpdateItem}
                              onDelete={handleDeleteItem}
                            />
                          )
                        }
                        return (
                          <LineItemRow
                            key={item.id}
                            item={item}
                            rowIndex={virtualRow.index + 1}
                            isSelected={selectedIds.has(item.id)}
                            isChild={!!item.parentId}
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
                          <td colSpan={10} />
                        </tr>
                      )}
                    </>
                  ) : (
                    /* Fix #8: Regular rows — group headers + child items */
                    filteredItems.map((item, index) => (
                      item.isGroup ? (
                        <GroupHeaderRow
                          key={item.id}
                          item={item}
                          isCollapsed={collapsedGroups.has(item.id)}
                          onToggleCollapse={toggleGroupCollapse}
                          childCount={currentProject.lineItems.filter(c => c.parentId === item.id).length}
                          childTotal={currentProject.lineItems.filter(c => c.parentId === item.id).reduce((s, c) => s + c.totalCost, 0)}
                          onUpdate={handleUpdateItem}
                          onDelete={handleDeleteItem}
                        />
                      ) : (
                        <LineItemRow
                          key={item.id}
                          item={item}
                          rowIndex={index + 1}
                          isSelected={selectedIds.has(item.id)}
                          isChild={!!item.parentId}
                          onToggleSelect={toggleSelectItem}
                          onUpdate={handleUpdateItem}
                          onDelete={handleDeleteItem}
                        />
                      )
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
                item.isGroup ? (
                  <MobileGroupCard
                    key={item.id}
                    item={item}
                    isCollapsed={collapsedGroups.has(item.id)}
                    onToggleCollapse={toggleGroupCollapse}
                    childCount={currentProject.lineItems.filter(c => c.parentId === item.id).length}
                    childTotal={currentProject.lineItems.filter(c => c.parentId === item.id).reduce((s, c) => s + c.totalCost, 0)}
                    onDelete={handleDeleteItem}
                    onUpdate={handleUpdateItem}
                  />
                ) : (
                  <div
                    key={item.id}
                    className={`p-3 space-y-2 ${selectedIds.has(item.id) ? 'bg-primary/5' : ''} ${item.parentId ? 'pl-8 bg-muted/20' : ''}`}
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
                )
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
const LineItemRow = memo(function LineItemRow({
  item,
  rowIndex,
  isSelected,
  isChild,
  onToggleSelect,
  onUpdate,
  onDelete,
}: {
  item: LineItem
  rowIndex: number
  isSelected: boolean
  isChild?: boolean
  onToggleSelect: (id: string) => void
  onUpdate: (id: string, updates: Partial<LineItem>) => void
  onDelete: (id: string) => void
}) {
  // When a description item is selected from the dropdown, auto-fill type, unit, and unitCost
  const handleDescriptionSelect = useCallback((selectedItem: DivisionItem) => {
    onUpdate(item.id, {
      description: selectedItem.description,
      type: selectedItem.type,
      unit: selectedItem.unit,
      unitCost: selectedItem.unitCost,
    })
  }, [item.id, onUpdate])

  return (
    <tr className={`hover:bg-muted/30 transition-colors ${isSelected ? 'bg-primary/5' : ''} ${isChild ? 'bg-muted/10' : ''}`}>
      {/* Selection */}
      <td className="px-2 py-2">
        <button
          onClick={() => onToggleSelect(item.id)}
          className="p-1 hover:bg-muted rounded min-w-[32px] min-h-[32px] flex items-center justify-center"
          aria-label={isSelected ? `Deselect ${item.description}` : `Select ${item.description}`}
        >
          {isSelected ? (
            <CheckSquare className="w-4 h-4 text-primary" />
          ) : (
            <Square className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </td>

      {/* Row number */}
      <td className="px-1 py-2 text-center text-xs text-muted-foreground tabular-nums">
        {rowIndex}
      </td>

      {/* Division - editable dropdown, shows code only with full name as tooltip */}
      <td className="px-3 py-2">
        <Select
          value={item.division}
          onChange={(e) => onUpdate(item.id, { division: e.target.value })}
          className="h-8 text-sm w-full"
          title={getDivisionLabel(item.division)}
          aria-label="Division"
        >
          {DIVISIONS_ALL.map((div) => (
            <option key={div.code} value={div.code}>
              {div.code}
            </option>
          ))}
        </Select>
      </td>

      {/* Description - search dropdown linked to division */}
      <td className="px-3 py-2 min-w-0">
        {isChild && <span className="inline-block w-4 border-l-2 border-b-2 border-border h-3 mr-1 align-middle mb-1" />}
        <DescriptionSearchInput
          value={item.description}
          division={item.division}
          onChange={(value) => onUpdate(item.id, { description: value })}
          onSelectItem={handleDescriptionSelect}
          className="h-8 text-sm"
          placeholder="Search description..."
        />
      </td>

      {/* Type - color-coded dot with tooltip, click to cycle type */}
      <td className="px-3 py-2 text-center">
        <button
          onClick={() => {
            const currentIndex = ITEM_TYPES.findIndex(t => t.value === item.type)
            const nextIndex = (currentIndex + 1) % ITEM_TYPES.length
            onUpdate(item.id, { type: ITEM_TYPES[nextIndex].value })
          }}
          title={ITEM_TYPES.find(t => t.value === item.type)?.label ?? item.type}
          aria-label={`Type: ${ITEM_TYPES.find(t => t.value === item.type)?.label ?? item.type}. Click to change.`}
          className="inline-flex items-center justify-center w-8 h-8 rounded hover:bg-muted transition-colors"
        >
          <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold ${TYPE_LABELS[item.type]?.color ?? 'bg-slate-500/15 text-slate-700 dark:text-slate-400'}`}>
            {TYPE_LABELS[item.type]?.letter ?? '?'}
          </span>
        </button>
      </td>

      {/* Quantity */}
      <td className="px-3 py-2">
        <CalculatorInput
          value={item.quantity}
          onChange={(value) => onUpdate(item.id, { quantity: value })}
          className="h-8 text-sm text-right w-full"
          placeholder="e.g. 2+3"
        />
      </td>

      {/* Unit */}
      <td className="px-3 py-2">
        <Input
          value={item.unit}
          onChange={(e) => onUpdate(item.id, { unit: e.target.value })}
          className="h-8 text-sm w-full"
          placeholder="EA"
          aria-label="Unit"
        />
      </td>

      {/* Unit Cost */}
      <td className="px-3 py-2">
        <CalculatorInput
          value={item.unitCost}
          onChange={(value) => onUpdate(item.id, { unitCost: value })}
          className="h-8 text-sm text-right w-full"
          placeholder="e.g. 100*1.1"
        />
      </td>

      {/* Total */}
      <td className="px-3 py-2 text-right font-semibold text-primary text-sm leading-relaxed">
        {formatCurrency(item.totalCost)}
      </td>

      {/* Actions */}
      <td className="px-3 py-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(item.id)}
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          aria-label={`Delete ${item.description}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </td>
    </tr>
  )
})

// Assembly group header row (collapsible)
const GroupHeaderRow = memo(function GroupHeaderRow({
  item,
  isCollapsed,
  onToggleCollapse,
  childCount,
  childTotal,
  onUpdate,
  onDelete,
}: {
  item: LineItem
  isCollapsed: boolean
  onToggleCollapse: (id: string) => void
  childCount: number
  childTotal: number
  onUpdate: (id: string, updates: Partial<LineItem>) => void
  onDelete: (id: string) => void
}) {
  const multiplier = item.assemblyMultiplier ?? 1
  const scaledTotal = childTotal * multiplier

  return (
    <tr className="bg-primary/5 hover:bg-primary/10 transition-colors border-t-2 border-primary/20">
      {/* Collapse toggle */}
      <td className="px-2 py-2">
        <button
          onClick={() => onToggleCollapse(item.id)}
          className="p-1 hover:bg-muted rounded min-w-[32px] min-h-[32px] flex items-center justify-center"
          aria-label={isCollapsed ? 'Expand group' : 'Collapse group'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-primary" />
          ) : (
            <ChevronDown className="w-4 h-4 text-primary" />
          )}
        </button>
      </td>

      {/* Icon */}
      <td className="px-1 py-2 text-center">
        <Layers className="w-4 h-4 text-primary mx-auto" />
      </td>

      {/* Blank division for group */}
      <td className="px-3 py-2" />

      {/* Assembly name */}
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <Input
            value={item.description}
            onChange={(e) => onUpdate(item.id, { description: e.target.value })}
            className="h-8 text-sm font-semibold"
          />
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {childCount} item{childCount !== 1 ? 's' : ''}
          </span>
        </div>
      </td>

      {/* Type - show "Assembly" badge */}
      <td className="px-3 py-2 text-center">
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/10 text-primary">
          ASM
        </span>
      </td>

      {/* Multiplier as quantity */}
      <td className="px-3 py-2">
        <CalculatorInput
          value={multiplier}
          onChange={(value) => onUpdate(item.id, { assemblyMultiplier: value })}
          className="h-8 text-sm text-right w-full"
          placeholder="1"
        />
      </td>

      {/* Unit */}
      <td className="px-3 py-2 text-sm text-muted-foreground">
        x
      </td>

      {/* Child total (base) */}
      <td className="px-3 py-2 text-right text-sm text-muted-foreground">
        {formatCurrency(childTotal)}
      </td>

      {/* Scaled total */}
      <td className="px-3 py-2 text-right font-bold text-primary text-sm">
        {formatCurrency(scaledTotal)}
      </td>

      {/* Delete group */}
      <td className="px-3 py-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(item.id)}
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          aria-label={`Delete assembly ${item.description}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </td>
    </tr>
  )
})

// Mobile assembly group card
function MobileGroupCard({
  item,
  isCollapsed,
  onToggleCollapse,
  childCount,
  childTotal,
  onDelete,
  onUpdate,
}: {
  item: LineItem
  isCollapsed: boolean
  onToggleCollapse: (id: string) => void
  childCount: number
  childTotal: number
  onDelete: (id: string) => void
  onUpdate: (id: string, updates: Partial<LineItem>) => void
}) {
  const multiplier = item.assemblyMultiplier ?? 1

  return (
    <div className="p-3 bg-primary/5 border-t-2 border-primary/20 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => onToggleCollapse(item.id)}
          className="flex items-center gap-2 flex-1 min-w-0"
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-primary flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-primary flex-shrink-0" />
          )}
          <Layers className="w-4 h-4 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0 text-left">
            <div className="font-semibold text-sm truncate">{item.description}</div>
            <div className="text-xs text-muted-foreground">
              {childCount} items &middot; {item.notes || ''}
            </div>
          </div>
        </button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(item.id)}
          className="h-11 w-11 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
          aria-label={`Delete assembly ${item.description}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex items-center gap-3 pl-11 text-sm">
        <div>
          <span className="text-xs text-muted-foreground block">Qty</span>
          <CalculatorInput
            value={multiplier}
            onChange={(value) => onUpdate(item.id, { assemblyMultiplier: value })}
            className="h-8 text-sm w-16"
            placeholder="1"
          />
        </div>
        <div className="text-muted-foreground">x</div>
        <div>
          <span className="text-xs text-muted-foreground block">Base</span>
          <div className="h-8 flex items-center text-sm">{formatCurrency(childTotal)}</div>
        </div>
        <div className="ml-auto">
          <span className="text-xs text-muted-foreground block">Total</span>
          <div className="h-8 flex items-center font-bold text-primary text-sm">
            {formatCurrency(childTotal * multiplier)}
          </div>
        </div>
      </div>
    </div>
  )
}
