import { useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useProject } from '@/contexts/ProjectContext'
import { calculateProfitAnalysis } from '@/lib/dashboard-utils'
import { formatCurrency } from '@/lib/utils'
import type { ProfitAnalysis } from '@/types'
import {
  TrendingUp,
  PieChart,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'

const TYPE_LABELS: Record<string, string> = {
  material: 'Materials',
  labor: 'Labor',
  equipment: 'Equipment',
  subcontractor: 'Subcontractor',
  misc: 'Miscellaneous',
}

const TYPE_COLORS: Record<string, string> = {
  material: 'bg-blue-500',
  labor: 'bg-green-500',
  equipment: 'bg-yellow-500',
  subcontractor: 'bg-purple-500',
  misc: 'bg-gray-500',
}

export function ProfitMarginChart() {
  const { currentProject } = useProject()

  const analysis = useMemo<ProfitAnalysis | null>(() => {
    if (!currentProject || currentProject.lineItems.length === 0) return null
    return calculateProfitAnalysis(currentProject)
  }, [currentProject])

  if (!analysis) {
    return (
      <Button variant="outline" size="sm" disabled>
        <PieChart className="w-4 h-4 mr-2" />
        Profit Analysis
      </Button>
    )
  }

  const marginStatus = analysis.grossMarginPercentage >= 20
    ? 'healthy'
    : analysis.grossMarginPercentage >= 10
      ? 'moderate'
      : 'low'

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <PieChart className="w-4 h-4 mr-2" />
          Profit Analysis
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Profit Margin Analysis
          </DialogTitle>
          <DialogDescription>
            Detailed breakdown of costs, revenue, and margins
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">Total Cost</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold">{formatCurrency(analysis.totalCost)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-primary">{formatCurrency(analysis.totalRevenue)}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">Gross Profit</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-green-500 flex items-center gap-1">
                  <ArrowUp className="w-4 h-4" />
                  {formatCurrency(analysis.grossProfit)}
                </div>
              </CardContent>
            </Card>

            <Card className={marginStatus === 'low' ? 'border-red-500' : marginStatus === 'moderate' ? 'border-yellow-500' : 'border-green-500'}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs text-muted-foreground">Gross Margin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-xl font-bold flex items-center gap-2 ${marginStatus === 'low' ? 'text-red-500' : marginStatus === 'moderate' ? 'text-yellow-500' : 'text-green-500'}`}>
                  {analysis.grossMarginPercentage.toFixed(1)}%
                  {marginStatus === 'healthy' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Margin by Type */}
          <div>
            <h3 className="font-semibold mb-3">Margin by Cost Type</h3>
            <div className="space-y-3">
              {analysis.byType.map((type) => (
                <div key={type.type} className="flex items-center gap-4">
                  <div className="w-24 flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${TYPE_COLORS[type.type]}`} />
                    <span className="text-sm">{TYPE_LABELS[type.type]}</span>
                  </div>
                  <div className="flex-1">
                    <div className="h-6 bg-muted rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-blue-500/30 flex items-center justify-center text-xs"
                        style={{ width: `${(type.cost / analysis.totalRevenue) * 100}%` }}
                      >
                        {type.cost > 0 && formatCurrency(type.cost)}
                      </div>
                      <div
                        className="h-full bg-green-500/30 flex items-center justify-center text-xs"
                        style={{ width: `${(type.profit / analysis.totalRevenue) * 100}%` }}
                      >
                        {type.profit > 0 && formatCurrency(type.profit)}
                      </div>
                    </div>
                  </div>
                  <div className="w-16 text-right text-sm font-medium">
                    {type.marginPercentage.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Margin by Division */}
          <div>
            <h3 className="font-semibold mb-3">Margin by Division (Top 10)</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted">
                    <th className="text-left p-2">Division</th>
                    <th className="text-right p-2">Cost</th>
                    <th className="text-right p-2">Revenue</th>
                    <th className="text-right p-2">Profit</th>
                    <th className="text-right p-2">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.byDivision.slice(0, 10).map((div) => (
                    <tr key={div.division} className="border-t hover:bg-muted/50">
                      <td className="p-2">
                        <span className="font-medium">{div.division}</span>
                        <span className="text-muted-foreground ml-1">- {div.divisionName}</span>
                      </td>
                      <td className="text-right p-2">{formatCurrency(div.cost)}</td>
                      <td className="text-right p-2">{formatCurrency(div.revenue)}</td>
                      <td className="text-right p-2 text-green-500">{formatCurrency(div.profit)}</td>
                      <td className={`text-right p-2 font-medium ${div.marginPercentage < 10 ? 'text-red-500' : div.marginPercentage < 15 ? 'text-yellow-500' : 'text-green-500'}`}>
                        {div.marginPercentage.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Recommendations
                </h3>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm p-2 bg-yellow-500/10 rounded-lg">
                      <ArrowDown className="w-4 h-4 text-yellow-500 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
