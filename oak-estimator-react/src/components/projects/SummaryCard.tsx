import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { useProject } from "@/contexts/ProjectContext"
import { formatCurrency } from "@/lib/utils"
import { DollarSign, TrendingUp, Calculator, Percent, Edit2 } from "lucide-react"
import { motion } from "framer-motion"

export function SummaryCard() {
  const { summary, currentProject, updateProjectSettings } = useProject()
  const [editingMarkup, setEditingMarkup] = useState(false)
  const [editingTax, setEditingTax] = useState(false)
  const [markupValue, setMarkupValue] = useState(summary.markupPercentage.toString())
  const [taxValue, setTaxValue] = useState(summary.taxPercentage.toString())
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync local state with summary when it changes
  useEffect(() => {
    if (!editingMarkup) {
      setMarkupValue(summary.markupPercentage.toString())
    }
    if (!editingTax) {
      setTaxValue(summary.taxPercentage.toString())
    }
  }, [summary.markupPercentage, summary.taxPercentage, editingMarkup, editingTax])

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

  if (!currentProject) {
    return null
  }

  const summaryItems = [
    { label: "Materials", value: summary.materialsCost, icon: "📦" },
    { label: "Labor", value: summary.laborCost, icon: "👷" },
    { label: "Equipment", value: summary.equipmentCost, icon: "🚜" },
    { label: "Subcontractor", value: summary.subcontractorCost, icon: "🤝" },
    { label: "Miscellaneous", value: summary.miscCost, icon: "📋" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
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
          {/* Cost Breakdown */}
          <div className="space-y-3">
            {summaryItems.map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="flex items-center justify-between"
              >
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <span>{item.icon}</span>
                  {item.label}
                </span>
                <span className="text-sm font-medium">
                  {formatCurrency(item.value)}
                </span>
              </motion.div>
            ))}
          </div>

          <Separator />

          {/* Subtotal */}
          <div className="flex items-center justify-between">
            <span className="font-medium">Subtotal</span>
            <span className="font-semibold">
              {formatCurrency(summary.subtotal)}
            </span>
          </div>

          {/* Markup */}
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>Markup</span>
              {editingMarkup ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={markupValue}
                    onChange={(e) => handleMarkupChange(e.target.value)}
                    onBlur={() => setEditingMarkup(false)}
                    autoFocus
                    className="w-16 h-6 text-xs text-center"
                    step="0.5"
                    min="0"
                    max="100"
                  />
                  <Percent className="w-3 h-3" />
                </div>
              ) : (
                <button
                  onClick={() => setEditingMarkup(true)}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-muted transition-colors"
                >
                  <span>({summary.markupPercentage}%)</span>
                  <Edit2 className="w-3 h-3 opacity-50" />
                </button>
              )}
            </div>
            <span className="font-medium text-green-500">
              +{formatCurrency(summary.markup)}
            </span>
          </div>

          {/* Tax */}
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground flex items-center gap-2">
              <span>Tax</span>
              {editingTax ? (
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={taxValue}
                    onChange={(e) => handleTaxChange(e.target.value)}
                    onBlur={() => setEditingTax(false)}
                    autoFocus
                    className="w-16 h-6 text-xs text-center"
                    step="0.5"
                    min="0"
                    max="100"
                  />
                  <Percent className="w-3 h-3" />
                </div>
              ) : (
                <button
                  onClick={() => setEditingTax(true)}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-muted transition-colors"
                >
                  <span>({summary.taxPercentage}%)</span>
                  <Edit2 className="w-3 h-3 opacity-50" />
                </button>
              )}
            </div>
            <span className="font-medium">
              {formatCurrency(summary.tax)}
            </span>
          </div>

          <Separator />

          {/* Total */}
          <motion.div
            className="flex items-center justify-between p-4 rounded-lg bg-primary/5"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="text-lg font-bold">Total Cost</span>
            </div>
            <span className="text-2xl font-bold text-primary">
              {formatCurrency(summary.totalCost)}
            </span>
          </motion.div>

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
    </motion.div>
  )
}
