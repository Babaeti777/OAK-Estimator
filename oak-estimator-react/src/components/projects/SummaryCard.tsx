import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { useProject } from "@/contexts/ProjectContext"
import { formatCurrency } from "@/lib/utils"
import {
  DollarSign,
  TrendingUp,
  Calculator,
  Percent,
  Package,
  HardHat,
  Truck,
  Handshake,
  ClipboardList,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

// Category color palette for the proportion bar
const CATEGORY_COLORS = [
  "bg-blue-500",      // Materials
  "bg-amber-500",     // Labor
  "bg-emerald-500",   // Equipment
  "bg-purple-500",    // Subcontractor
  "bg-slate-400",     // Miscellaneous
] as const

// Fix #11: Move summary item config to module scope
const SUMMARY_LABELS: readonly {
  key: "materialsCost" | "laborCost" | "equipmentCost" | "subcontractorCost" | "miscCost"
  label: string
  Icon: LucideIcon
  color: string
  barColor: string
}[] = [
  { key: "materialsCost", label: "Materials", Icon: Package, color: "text-blue-500", barColor: CATEGORY_COLORS[0] },
  { key: "laborCost", label: "Labor", Icon: HardHat, color: "text-amber-500", barColor: CATEGORY_COLORS[1] },
  { key: "equipmentCost", label: "Equipment", Icon: Truck, color: "text-emerald-500", barColor: CATEGORY_COLORS[2] },
  { key: "subcontractorCost", label: "Subcontractor", Icon: Handshake, color: "text-purple-500", barColor: CATEGORY_COLORS[3] },
  { key: "miscCost", label: "Miscellaneous", Icon: ClipboardList, color: "text-slate-400", barColor: CATEGORY_COLORS[4] },
] as const

export function SummaryCard() {
  const { summary, currentProject, updateProjectSettings } = useProject()
  const [markupValue, setMarkupValue] = useState(summary.markupPercentage.toString())
  const [taxValue, setTaxValue] = useState(summary.taxPercentage.toString())
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fix #4: Clean up debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  // Fix #5: Sync local state with summary when external changes occur
  useEffect(() => {
    setMarkupValue(summary.markupPercentage.toString())
  }, [summary.markupPercentage])

  useEffect(() => {
    setTaxValue(summary.taxPercentage.toString())
  }, [summary.taxPercentage])

  // Debounced save function
  const debouncedSave = useCallback((field: 'markup' | 'tax', value: number) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(async () => {
      if (!currentProject) return
      const updates = field === 'markup'
        ? { ...currentProject.projectSettings, markupPercentage: value }
        : { ...currentProject.projectSettings, taxPercentage: value }
      await updateProjectSettings(updates)
    }, 500)
  }, [currentProject, updateProjectSettings])

  const handleMarkupChange = (value: string) => {
    setMarkupValue(value)
    const numValue = parseFloat(value) || 0
    debouncedSave('markup', numValue)
  }

  const handleTaxChange = (value: string) => {
    setTaxValue(value)
    const numValue = parseFloat(value) || 0
    debouncedSave('tax', numValue)
  }

  // Fix #5: Memoize summary items to avoid creating new arrays each render
  const summaryItems = useMemo(() =>
    SUMMARY_LABELS.map(({ key, label, Icon, color, barColor }) => ({
      label,
      Icon,
      color,
      barColor,
      value: summary[key],
    })),
    [summary]
  )

  // Calculate proportion percentages for the cost bar
  const proportions = useMemo(() => {
    const total = summary.subtotal
    if (total === 0) return summaryItems.map(() => 0)
    return summaryItems.map((item) => (item.value / total) * 100)
  }, [summary.subtotal, summaryItems])

  if (!currentProject) {
    return null
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          <CardTitle>Cost Summary</CardTitle>
        </div>
        <CardDescription>
          Real-time cost breakdown and totals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Cost Proportion Bar */}
        {summary.subtotal > 0 && (
          <div className="space-y-1.5">
            <div className="flex h-3 w-full rounded-full overflow-hidden bg-muted">
              {proportions.map((pct, idx) => {
                if (pct === 0) return null
                return (
                  <div
                    key={summaryItems[idx].label}
                    className={`${summaryItems[idx].barColor} transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                    title={`${summaryItems[idx].label}: ${pct.toFixed(1)}%`}
                  />
                )
              })}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {summaryItems.map((item, idx) => {
                if (proportions[idx] === 0) return null
                return (
                  <div key={item.label} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className={`inline-block w-2 h-2 rounded-full ${item.barColor}`} />
                    <span>{item.label} {proportions[idx].toFixed(0)}%</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Cost Breakdown */}
        <div className="space-y-3">
          {summaryItems.map((item) => {
            const IconComponent = item.Icon
            return (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <IconComponent className={`w-4 h-4 ${item.color}`} />
                  {item.label}
                </span>
                <span className="text-sm font-medium">
                  {formatCurrency(item.value)}
                </span>
              </div>
            )
          })}
        </div>

        <Separator />

        {/* Subtotal */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Subtotal</span>
          <span className="font-semibold">
            {formatCurrency(summary.subtotal)}
          </span>
        </div>

        {/* Markup - always-visible input */}
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span>Markup</span>
            <div className="relative flex items-center">
              <Input
                type="number"
                value={markupValue}
                onChange={(e) => handleMarkupChange(e.target.value)}
                className="w-20 h-7 text-xs pr-6 text-right"
                step="0.5"
                min="0"
                max="100"
                aria-label="Markup percentage"
              />
              <span className="absolute right-2 text-xs text-muted-foreground pointer-events-none">%</span>
            </div>
          </div>
          <span className="font-medium text-green-500">
            +{formatCurrency(summary.markup)}
          </span>
        </div>

        {/* Tax - always-visible input */}
        <div className="flex items-center justify-between text-sm">
          <div className="text-muted-foreground flex items-center gap-2">
            <Percent className="w-4 h-4" />
            <span>Tax</span>
            <div className="relative flex items-center">
              <Input
                type="number"
                value={taxValue}
                onChange={(e) => handleTaxChange(e.target.value)}
                className="w-20 h-7 text-xs pr-6 text-right"
                step="0.5"
                min="0"
                max="100"
                aria-label="Tax percentage"
              />
              <span className="absolute right-2 text-xs text-muted-foreground pointer-events-none">%</span>
            </div>
          </div>
          <span className="font-medium">
            {formatCurrency(summary.tax)}
          </span>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <span className="text-lg font-bold">Total Cost</span>
          </div>
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(summary.totalCost)}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <div className="text-xs text-muted-foreground mb-1">Line Items</div>
            <div className="text-xl font-semibold">
              {currentProject.lineItems.length}
            </div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/30">
            <div className="text-xs text-muted-foreground mb-1">Avg. Cost</div>
            <div className="text-xl font-semibold">
              {currentProject.lineItems.length > 0
                ? formatCurrency(summary.subtotal / currentProject.lineItems.length)
                : formatCurrency(0)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
