import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { useProject } from "@/contexts/ProjectContext"
import { DIVISIONS_PRELIMINARY, getDivisionLabel } from "@/data/divisions"

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
    <>
      {/* Mobile horizontal division chip filter */}
      <div className="lg:hidden -mx-4 px-4 mb-3 overflow-x-auto">
        <div className="flex items-center gap-2 pb-2 min-w-max">
          <button
            onClick={onClearDivision}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[36px] ${
              selectedDivision === ""
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
            aria-label="Show all divisions"
          >
            All ({currentProject.lineItems.length})
          </button>
          {DIVISIONS_PRELIMINARY.map((division) => {
            const count = divisionCounts[division.code] || 0
            if (count === 0) return null
            return (
              <button
                key={division.code}
                onClick={() => onSelectDivision(division.code)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[36px] ${
                  selectedDivision === division.code
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
                aria-label={`Filter by ${getDivisionLabel(division.code)}`}
              >
                {division.code} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Desktop vertical division list (for overlay panel) */}
      <div className="hidden lg:block space-y-2">
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
      </div>
    </>
  )
}
