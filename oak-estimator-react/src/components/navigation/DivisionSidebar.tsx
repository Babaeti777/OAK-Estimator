import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProject } from "@/contexts/ProjectContext"
import { DIVISIONS_ALL, getDivisionLabel } from "@/data/divisions"
import { formatCurrency } from "@/lib/utils"
import { Search } from "lucide-react"

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
  const [searchQuery, setSearchQuery] = useState("")
  const [showAll, setShowAll] = useState(false)

  const divisionCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    currentProject?.lineItems.forEach((item) => {
      counts[item.division] = (counts[item.division] || 0) + 1
    })
    return counts
  }, [currentProject?.lineItems])

  const divisionCosts = useMemo(() => {
    const costs: Record<string, number> = {}
    currentProject?.lineItems.forEach((item) => {
      costs[item.division] = (costs[item.division] || 0) + item.totalCost
    })
    return costs
  }, [currentProject?.lineItems])

  const totalCost = useMemo(() => {
    return currentProject?.lineItems.reduce((sum, item) => sum + item.totalCost, 0) ?? 0
  }, [currentProject?.lineItems])

  const filteredDivisions = useMemo(() => {
    let divisions = DIVISIONS_ALL

    // Filter to only populated divisions unless showAll is toggled
    if (!showAll) {
      divisions = divisions.filter((d) => (divisionCounts[d.code] || 0) > 0)
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      divisions = divisions.filter(
        (d) =>
          d.code.includes(query) ||
          d.name.toLowerCase().includes(query)
      )
    }

    return divisions
  }, [showAll, searchQuery, divisionCounts])

  const populatedCount = useMemo(() => {
    return DIVISIONS_ALL.filter((d) => (divisionCounts[d.code] || 0) > 0).length
  }, [divisionCounts])

  if (!currentProject) {
    return null
  }

  return (
    <div className="space-y-2">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Filter divisions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {/* All Divisions button */}
      <Button
        variant={selectedDivision === "" ? "secondary" : "ghost"}
        className="w-full justify-between"
        onClick={onClearDivision}
      >
        <span>All Divisions</span>
        <span className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {formatCurrency(totalCost)}
          </span>
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            {currentProject.lineItems.length}
          </span>
        </span>
      </Button>

      {/* Division list */}
      {filteredDivisions.map((division) => {
        const count = divisionCounts[division.code] || 0
        const cost = divisionCosts[division.code] || 0
        const isPopulated = count > 0

        return (
          <Button
            key={division.code}
            variant={selectedDivision === division.code ? "secondary" : "ghost"}
            className="w-full justify-between"
            onClick={() => onSelectDivision(division.code)}
          >
            <span className="truncate text-left">{getDivisionLabel(division.code)}</span>
            <span className="flex items-center gap-2 shrink-0">
              {isPopulated && (
                <span className="text-xs text-muted-foreground">
                  {formatCurrency(cost)}
                </span>
              )}
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  isPopulated
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {count}
              </span>
            </span>
          </Button>
        )
      })}

      {/* Show all / Show populated toggle */}
      <Button
        variant="ghost"
        className="w-full text-xs text-muted-foreground"
        onClick={() => setShowAll((prev) => !prev)}
      >
        {showAll
          ? `Show only populated (${populatedCount})`
          : `Show all divisions (${DIVISIONS_ALL.length})`}
      </Button>
    </div>
  )
}
