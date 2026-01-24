import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useProject } from "@/contexts/ProjectContext"
import { DIVISIONS_PRELIMINARY, getDivisionLabel } from "@/data/divisions"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

interface DivisionSidebarProps {
  selectedDivision: string
  onSelectDivision: (division: string) => void
  onClearDivision: () => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

export function DivisionSidebar({
  selectedDivision,
  onSelectDivision,
  onClearDivision,
  isCollapsed,
  onToggleCollapse,
}: DivisionSidebarProps) {
  const { currentProject } = useProject()

  const divisionCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    currentProject?.lineItems.forEach((item) => {
      counts[item.division] = (counts[item.division] || 0) + 1
    })
    return counts
  }, [currentProject?.lineItems])

  if (!currentProject) {
    return null
  }

  return (
    <aside
      className={`hidden lg:block transition-all duration-300 ${
        isCollapsed ? "w-14" : "w-64"
      }`}
    >
      <div className="sticky top-24">
        <Card className="h-[calc(100vh-7.5rem)]">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-base ${isCollapsed ? "sr-only" : ""}`}>
              Divisions
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              aria-label={isCollapsed ? "Expand divisions" : "Collapse divisions"}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          {!isCollapsed && (
            <CardContent className="space-y-2 overflow-y-auto pb-6">
              <Button
                variant={selectedDivision === "" ? "secondary" : "ghost"}
                className="w-full justify-between"
                onClick={onClearDivision}
              >
                <span>All Divisions</span>
                <span className="text-xs text-muted-foreground">
                  {currentProject.lineItems.length}
                </span>
              </Button>
              {DIVISIONS_PRELIMINARY.map((division) => (
                <Button
                  key={division.code}
                  variant={selectedDivision === division.code ? "secondary" : "ghost"}
                  className="w-full justify-between"
                  onClick={() => onSelectDivision(division.code)}
                >
                  <span>{getDivisionLabel(division.code)}</span>
                  <span className="text-xs text-muted-foreground">
                    {divisionCounts[division.code] || 0}
                  </span>
                </Button>
              ))}
            </CardContent>
          )}
        </Card>
      </div>
    </aside>
  )
}
