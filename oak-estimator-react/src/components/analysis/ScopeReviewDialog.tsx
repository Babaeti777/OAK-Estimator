import { useMemo } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useProject } from "@/contexts/ProjectContext"
import { DIVISIONS_ALL, getDivisionLabel } from "@/data/divisions"
import { CheckCircle2, AlertTriangle, ClipboardList } from "lucide-react"

export function ScopeReviewDialog() {
  const { currentProject } = useProject()

  const divisionSummary = useMemo(() => {
    if (!currentProject) return []
    const counts: Record<string, number> = {}
    currentProject.lineItems.forEach((item) => {
      counts[item.division] = (counts[item.division] || 0) + 1
    })

    return DIVISIONS_ALL.map((division) => ({
      code: division.code,
      label: getDivisionLabel(division.code),
      count: counts[division.code] || 0,
    }))
  }, [currentProject])

  if (!currentProject) {
    return null
  }

  const missingCount = divisionSummary.filter((item) => item.count === 0).length

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <ClipboardList className="w-4 h-4 mr-2" />
          Scope Review
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scope Coverage Review</DialogTitle>
          <DialogDescription>
            Highlight divisions without line items so you can fill scope gaps.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border p-4 bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Divisions with missing scope</p>
              <p className="text-xs text-muted-foreground">
                {missingCount} of {divisionSummary.length} divisions have no items.
              </p>
            </div>
            <div className="text-sm font-semibold">
              {divisionSummary.length - missingCount}/{divisionSummary.length} covered
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {divisionSummary.map((division) => (
            <div
              key={division.code}
              className="flex items-center justify-between rounded-lg border px-3 py-2"
            >
              <div className="flex items-center gap-3">
                {division.count > 0 ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                )}
                <div>
                  <p className="text-sm font-medium">{division.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {division.count > 0
                      ? `${division.count} line item(s)`
                      : "No line items yet"}
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                {division.count}
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
