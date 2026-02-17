/**
 * Project Schedule Component
 *
 * Timeline visualization with:
 * - Duration-based scheduling
 * - Phase grouping
 * - Dependency tracking
 * - CSV export for schedule visualization
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  PlayCircle,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react'
import type {
  Assembly,
  ScheduledAssembly,
  AssemblyCategory,
  ProjectPhase,
} from '@/types'
import { useProject } from '@/contexts/ProjectContext'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { getCategoryInfo, DEFAULT_ASSEMBLIES } from '@/data/default-assemblies'
import { getUserAssemblies } from '@/services/assemblies.service'
import { formatCurrency } from '@/lib/utils'

interface ProjectScheduleProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  assemblies?: Assembly[]
}

// Phase display order and labels
const PHASE_ORDER: ProjectPhase[] = [
  'pre-construction',
  'rough-in',
  'mechanical',
  'insulation-drywall',
  'finishes',
  'fixtures',
  'final',
]

const PHASE_LABELS: Record<ProjectPhase, string> = {
  'pre-construction': 'Pre-Construction',
  'rough-in': 'Rough-In',
  mechanical: 'Mechanical',
  'insulation-drywall': 'Insulation & Drywall',
  finishes: 'Finishes',
  fixtures: 'Fixtures',
  final: 'Final',
}

// Convert assembly to scheduled assembly
function assemblyToScheduled(assembly: Assembly, startDay: number): ScheduledAssembly {
  // Convert duration to days for unified calculation
  let durationInDays = assembly.estimatedDuration
  if (assembly.durationUnit === 'hours') {
    durationInDays = assembly.estimatedDuration / 8 // 8 hour workday
  } else if (assembly.durationUnit === 'weeks') {
    durationInDays = assembly.estimatedDuration * 7
  }

  return {
    id: `sched-${assembly.id}`,
    assemblyId: assembly.id,
    assemblyName: assembly.name,
    category: assembly.category,
    startDay,
    duration: Math.max(0.5, durationInDays), // Minimum half day
    dependencies: assembly.dependencies || [],
    status: 'pending',
  }
}

// Calculate schedule based on dependencies
function calculateSchedule(assemblies: Assembly[]): ScheduledAssembly[] {
  if (assemblies.length === 0) return []

  // Group assemblies by phase
  const phaseGroups = new Map<ProjectPhase, Assembly[]>()
  for (const phase of PHASE_ORDER) {
    phaseGroups.set(phase, [])
  }

  for (const assembly of assemblies) {
    const phase = assembly.phase || getCategoryInfo(assembly.category)?.defaultPhase || 'finishes'
    const group = phaseGroups.get(phase) || []
    group.push(assembly)
    phaseGroups.set(phase, group)
  }

  const scheduled: ScheduledAssembly[] = []
  const categoryEndDays = new Map<AssemblyCategory, number>()
  let currentDay = 1

  // Process each phase in order
  for (const phase of PHASE_ORDER) {
    const phaseAssemblies = phaseGroups.get(phase) || []
    if (phaseAssemblies.length === 0) continue

    // Find the earliest start day for this phase based on dependencies
    let phaseStartDay = currentDay

    for (const assembly of phaseAssemblies) {
      const deps = (assembly.dependencies as AssemblyCategory[]) || []
      for (const dep of deps) {
        const depEndDay = categoryEndDays.get(dep) || 0
        if (depEndDay >= phaseStartDay) {
          phaseStartDay = depEndDay + 1
        }
      }
    }

    // Schedule assemblies in this phase
    // Assemblies in the same phase can run in parallel if they don't have
    // explicit dependencies between them
    let maxEndDay = phaseStartDay

    for (const assembly of phaseAssemblies) {
      // Check specific category dependencies
      let startDay = phaseStartDay
      const deps = (assembly.dependencies as AssemblyCategory[]) || []
      for (const dep of deps) {
        const depEndDay = categoryEndDays.get(dep) || 0
        if (depEndDay >= startDay) {
          startDay = depEndDay + 1
        }
      }

      const scheduledAssembly = assemblyToScheduled(assembly, startDay)
      scheduled.push(scheduledAssembly)

      const endDay = startDay + scheduledAssembly.duration - 1
      maxEndDay = Math.max(maxEndDay, endDay)

      // Track category end days for dependency calculation
      const currentCategoryEnd = categoryEndDays.get(assembly.category) || 0
      if (endDay > currentCategoryEnd) {
        categoryEndDays.set(assembly.category, endDay)
      }
    }

    currentDay = Math.ceil(maxEndDay) + 1
  }

  return scheduled
}

// Format date from day number and start date
function formatDate(startDate: Date, dayNumber: number): string {
  const date = new Date(startDate)
  date.setDate(date.getDate() + dayNumber - 1)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// Generate CSV content for schedule export
function generateScheduleCSV(
  schedule: ScheduledAssembly[],
  startDate: Date,
  assemblies: Assembly[]
): string {
  const headers = [
    'Task',
    'Category',
    'Phase',
    'Start Day',
    'Duration (Days)',
    'End Day',
    'Start Date',
    'End Date',
    'Dependencies',
    'Status',
    'Estimated Cost',
  ]

  const rows = schedule.map(item => {
    const assembly = assemblies.find(a => a.id === item.assemblyId)
    const categoryInfo = getCategoryInfo(item.category)
    const endDay = item.startDay + item.duration - 1

    const startDateStr = formatDate(startDate, item.startDay)
    const endDateStr = formatDate(startDate, endDay)

    const depNames = item.dependencies
      .map(dep => getCategoryInfo(dep as AssemblyCategory)?.name || dep)
      .join('; ')

    return [
      item.assemblyName,
      categoryInfo?.name || item.category,
      assembly?.phase ? PHASE_LABELS[assembly.phase] : '',
      item.startDay.toString(),
      item.duration.toFixed(1),
      endDay.toFixed(1),
      startDateStr,
      endDateStr,
      depNames,
      item.status,
      assembly?.totalCost?.toFixed(2) || '0.00',
    ]
  })

  // Add summary row
  const totalDuration = Math.max(...schedule.map(s => s.startDay + s.duration - 1), 0)
  const totalCost = assemblies.reduce((sum, a) => sum + (a.totalCost || 0), 0)

  rows.push([])
  rows.push(['SUMMARY'])
  rows.push(['Total Duration (Days)', totalDuration.toFixed(1)])
  rows.push(['Total Estimated Cost', totalCost.toFixed(2)])
  rows.push(['Project Start Date', startDate.toLocaleDateString()])
  rows.push(['Estimated End Date', formatDate(startDate, Math.ceil(totalDuration))])

  // Convert to CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      row
        .map(cell => {
          // Escape quotes and wrap in quotes if contains comma
          const escaped = String(cell).replace(/"/g, '""')
          return escaped.includes(',') || escaped.includes('"') ? `"${escaped}"` : escaped
        })
        .join(',')
    ),
  ].join('\n')

  return csvContent
}

// Download CSV file
function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

// Status icon component
function StatusIcon({ status }: { status: ScheduledAssembly['status'] }) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-4 h-4 text-green-500" />
    case 'in-progress':
      return <PlayCircle className="w-4 h-4 text-blue-500" />
    default:
      return <Circle className="w-4 h-4 text-muted-foreground" />
  }
}

// Timeline bar component
function TimelineBar({
  item,
  maxDuration,
}: {
  item: ScheduledAssembly
  maxDuration: number
}) {
  const startPercent = ((item.startDay - 1) / maxDuration) * 100
  const widthPercent = (item.duration / maxDuration) * 100
  const endDay = item.startDay + item.duration - 1

  // Category-based colors
  const colorClasses: Record<string, string> = {
    demolition: 'bg-red-500/70',
    sitework: 'bg-orange-500/70',
    concrete: 'bg-gray-500/70',
    framing: 'bg-yellow-600/70',
    roofing: 'bg-amber-700/70',
    plumbing: 'bg-blue-500/70',
    electrical: 'bg-yellow-400/70',
    hvac: 'bg-cyan-500/70',
    insulation: 'bg-pink-400/70',
    drywall: 'bg-stone-400/70',
    flooring: 'bg-emerald-600/70',
    painting: 'bg-purple-500/70',
    cabinets: 'bg-amber-600/70',
    fixtures: 'bg-indigo-500/70',
    exterior: 'bg-teal-600/70',
    landscaping: 'bg-green-600/70',
    cleanup: 'bg-slate-500/70',
    custom: 'bg-violet-500/70',
  }

  const bgColor = colorClasses[item.category] || 'bg-primary/70'

  return (
    <div className="relative h-6 bg-muted/30 rounded">
      <div
        className={`absolute h-full rounded ${bgColor} flex items-center justify-center text-xs text-white font-medium overflow-hidden`}
        style={{
          left: `${startPercent}%`,
          width: `${Math.max(widthPercent, 3)}%`, // Minimum 3% width for visibility
        }}
        title={`${item.assemblyName}: Day ${item.startDay} - ${endDay.toFixed(1)} (${item.duration.toFixed(1)} days)`}
      >
        <span className="truncate px-1">{item.duration.toFixed(1)}d</span>
      </div>
    </div>
  )
}

export function ProjectSchedule({ open, onOpenChange, assemblies: propAssemblies }: ProjectScheduleProps) {
  const { currentProject } = useProject()
  const { user } = useAuth()
  const { toast } = useToast()

  // State
  const [startDate, setStartDate] = useState<Date>(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  })
  const [expandedPhases, setExpandedPhases] = useState<Set<ProjectPhase>>(
    new Set(PHASE_ORDER)
  )
  const [userAssemblies, setUserAssemblies] = useState<Assembly[]>([])
  const [selectedAssemblyIds, setSelectedAssemblyIds] = useState<Set<string>>(new Set())

  // Fetch user assemblies when dialog opens
  useEffect(() => {
    if (open && user && !propAssemblies) {
      getUserAssemblies(user.uid).then(setUserAssemblies).catch(console.error)
    }
  }, [open, user, propAssemblies])

  // Combine assemblies: prop assemblies or default + user assemblies
  const allAssemblies = useMemo(() => {
    if (propAssemblies) return propAssemblies
    return [...DEFAULT_ASSEMBLIES, ...userAssemblies]
  }, [propAssemblies, userAssemblies])

  // Selected assemblies for scheduling
  const assemblies = useMemo(() => {
    if (propAssemblies) return propAssemblies
    if (selectedAssemblyIds.size === 0) return []
    return allAssemblies.filter(a => selectedAssemblyIds.has(a.id))
  }, [propAssemblies, allAssemblies, selectedAssemblyIds])

  // Toggle assembly selection
  const toggleAssembly = useCallback((id: string) => {
    setSelectedAssemblyIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // Calculate schedule
  const schedule = useMemo(() => calculateSchedule(assemblies), [assemblies])

  // Group schedule by phase
  const scheduleByPhase = useMemo(() => {
    const grouped = new Map<ProjectPhase, ScheduledAssembly[]>()
    for (const phase of PHASE_ORDER) {
      grouped.set(phase, [])
    }

    for (const item of schedule) {
      const assembly = assemblies.find(a => a.id === item.assemblyId)
      const phase = assembly?.phase || getCategoryInfo(item.category)?.defaultPhase || 'finishes'
      const items = grouped.get(phase) || []
      items.push(item)
      grouped.set(phase, items)
    }

    return grouped
  }, [schedule, assemblies])

  // Calculate totals
  const totals = useMemo(() => {
    const totalDuration = Math.max(...schedule.map(s => s.startDay + s.duration - 1), 0)
    const totalCost = assemblies.reduce((sum, a) => sum + (a.totalCost || 0), 0)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + Math.ceil(totalDuration))

    return { totalDuration, totalCost, endDate }
  }, [schedule, assemblies, startDate])

  // Toggle phase expansion
  const togglePhase = useCallback((phase: ProjectPhase) => {
    setExpandedPhases(prev => {
      const next = new Set(prev)
      if (next.has(phase)) {
        next.delete(phase)
      } else {
        next.add(phase)
      }
      return next
    })
  }, [])

  // Recalculate schedule
  const handleRecalculate = useCallback(() => {
    toast({
      title: 'Schedule recalculated',
      description: `Total duration: ${totals.totalDuration.toFixed(1)} days`,
    })
  }, [toast, totals.totalDuration])

  // Export to CSV
  const handleExportCSV = useCallback(() => {
    if (schedule.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No schedule to export',
        description: 'Add assemblies to the project first',
      })
      return
    }

    const projectName = currentProject?.projectSettings?.projectName || 'Project'
    const filename = `${projectName.replace(/[^a-z0-9]/gi, '_')}_schedule_${
      startDate.toISOString().split('T')[0]
    }.csv`

    const csvContent = generateScheduleCSV(schedule, startDate, assemblies)
    downloadCSV(csvContent, filename)

    toast({
      title: 'Schedule exported',
      description: `Downloaded ${filename}`,
    })
  }, [schedule, startDate, assemblies, currentProject, toast])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Project Schedule
          </DialogTitle>
        </DialogHeader>

        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="start-date" className="whitespace-nowrap">
                Start Date:
              </Label>
              <Input
                id="start-date"
                type="date"
                value={startDate.toISOString().split('T')[0]}
                onChange={e => setStartDate(new Date(e.target.value))}
                className="w-40"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{totals.totalDuration.toFixed(1)}</span> days total |{' '}
              Est. completion:{' '}
              <span className="font-medium">
                {totals.endDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRecalculate}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Recalculate
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <FileSpreadsheet className="w-4 h-4 mr-1" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Schedule Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Assembly Selection (when no prop assemblies) */}
          {!propAssemblies && (
            <div className="mb-4 p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium">Select assemblies to schedule:</Label>
                <span className="text-xs text-muted-foreground">
                  {selectedAssemblyIds.size} selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {allAssemblies.map(assembly => {
                  const isSelected = selectedAssemblyIds.has(assembly.id)
                  return (
                    <button
                      key={assembly.id}
                      onClick={() => toggleAssembly(assembly.id)}
                      className={`px-2 py-1 rounded text-xs transition-colors ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary hover:bg-secondary/80'
                      }`}
                    >
                      {assembly.name}
                      <span className="ml-1 opacity-70">
                        ({assembly.estimatedDuration}{assembly.durationUnit[0]})
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {assemblies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Calendar className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No assemblies selected</p>
              <p className="text-sm">Select assemblies above to create a schedule</p>
            </div>
          ) : (
            <div className="space-y-4">
              {PHASE_ORDER.map(phase => {
                const phaseItems = scheduleByPhase.get(phase) || []
                if (phaseItems.length === 0) return null

                const isExpanded = expandedPhases.has(phase)
                const phaseStart = Math.min(...phaseItems.map(i => i.startDay))
                const phaseEnd = Math.max(...phaseItems.map(i => i.startDay + i.duration - 1))
                const phaseDuration = phaseEnd - phaseStart + 1

                return (
                  <div key={phase} className="border rounded-lg overflow-hidden">
                    {/* Phase Header */}
                    <button
                      onClick={() => togglePhase(phase)}
                      className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <span className="font-medium">{PHASE_LABELS[phase]}</span>
                        <span className="text-sm text-muted-foreground">
                          ({phaseItems.length} tasks)
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          Day {phaseStart} - {phaseEnd.toFixed(0)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {phaseDuration.toFixed(1)} days
                        </span>
                      </div>
                    </button>

                    {/* Phase Items */}
                    {isExpanded && (
                      <div className="divide-y">
                        {phaseItems.map(item => {
                          const assembly = assemblies.find(a => a.id === item.assemblyId)
                          const categoryInfo = getCategoryInfo(item.category)
                          const hasDeps = item.dependencies.length > 0

                          return (
                            <div
                              key={item.id}
                              className="grid grid-cols-12 gap-4 p-3 items-center hover:bg-muted/30"
                            >
                              {/* Status & Name */}
                              <div className="col-span-4 flex items-center gap-2 min-w-0">
                                <StatusIcon status={item.status} />
                                <div className="min-w-0">
                                  <div className="font-medium truncate">{item.assemblyName}</div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                                    <span>{categoryInfo?.name}</span>
                                    {hasDeps && (
                                      <span
                                        className="flex items-center gap-0.5 text-amber-600"
                                        title={`Depends on: ${item.dependencies.join(', ')}`}
                                      >
                                        <AlertTriangle className="w-3 h-3" />
                                        {item.dependencies.length} deps
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Duration Info */}
                              <div className="col-span-2 text-sm">
                                <div>Day {item.startDay}</div>
                                <div className="text-muted-foreground">
                                  {item.duration.toFixed(1)} days
                                </div>
                              </div>

                              {/* Cost */}
                              <div className="col-span-2 text-sm">
                                {assembly && formatCurrency(assembly.totalCost)}
                              </div>

                              {/* Timeline Bar */}
                              <div className="col-span-4">
                                <TimelineBar
                                  item={item}
                                  maxDuration={totals.totalDuration}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Summary Footer */}
        {assemblies.length > 0 && (
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">{schedule.length}</div>
                <div className="text-xs text-muted-foreground">Tasks</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">{totals.totalDuration.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Days Total</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">{formatCurrency(totals.totalCost)}</div>
                <div className="text-xs text-muted-foreground">Est. Cost</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-2xl font-bold">
                  {totals.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <div className="text-xs text-muted-foreground">Est. Completion</div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
