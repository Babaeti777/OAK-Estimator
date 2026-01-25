import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useProject } from "@/contexts/ProjectContext"
import { formatCurrency } from "@/lib/utils"
import { Calculator, ChevronRight } from "lucide-react"

interface ProjectTotalBadgeProps {
  showSummary: boolean
  onToggleSummary: () => void
}

export function ProjectTotalBadge({ showSummary, onToggleSummary }: ProjectTotalBadgeProps) {
  const { summary, currentProject } = useProject()

  if (!currentProject) {
    return null
  }

  return (
    <Card className="border-primary/30 bg-background/95 shadow-sm">
      <CardContent className="flex items-center gap-3 px-3 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Calculator className="h-4 w-4 text-primary" />
          </div>
          <div className="leading-tight">
            <p className="text-xs text-muted-foreground">Project Total</p>
            <p className="text-lg font-semibold text-primary">
              {formatCurrency(summary.totalCost)}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSummary}
          className="text-xs"
        >
          {showSummary ? "Hide" : "Details"}
          <ChevronRight className="ml-1 h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  )
}
