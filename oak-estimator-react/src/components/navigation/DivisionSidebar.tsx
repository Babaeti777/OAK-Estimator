import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { useProject } from "@/contexts/ProjectContext"
import { DIVISIONS_PRELIMINARY, getDivisionLabel } from "@/data/divisions"

interface DivisionSidebarProps {
  selectedDivision: string
  onSelectDivision: (division: string) => void
  onClearDivision: () => void
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

  // Only show in overlay panel (no inline horizontal chips)
  return (
    <div className="space-y-2">
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
  )
}
