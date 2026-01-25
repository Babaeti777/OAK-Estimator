import type { Project, DashboardStats, ActivityItem, ProfitAnalysis, DivisionProfit, TypeProfit, LineItem, Summary } from '@/types'
import { DIVISIONS_ALL } from '@/data/divisions'

/**
 * Calculate dashboard statistics from projects
 */
export function calculateDashboardStats(projects: Project[]): DashboardStats {
  const activeProjects = projects.filter(p => !p.trashedAt && !p.deletedAt)

  // Calculate total pipeline value
  const totalPipelineValue = activeProjects.reduce((sum, project) => {
    const projectTotal = calculateProjectTotal(project)
    return sum + projectTotal
  }, 0)

  // Projects by status
  const projectsByStatus: Record<string, number> = {
    draft: 0,
    sent: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
  }

  activeProjects.forEach(project => {
    const status = project.status || 'draft'
    projectsByStatus[status] = (projectsByStatus[status] || 0) + 1
  })

  // Projects by month (last 12 months)
  const projectsByMonth = getProjectsByMonth(activeProjects)

  // Costs by division
  const costsByDivision = getCostsByDivision(activeProjects)

  // Recent activity
  const recentActivity = getRecentActivity(activeProjects)

  return {
    totalProjects: activeProjects.length,
    activeProjects: activeProjects.filter(p => p.status !== 'completed' && p.status !== 'rejected').length,
    totalPipelineValue,
    avgProjectValue: activeProjects.length > 0 ? totalPipelineValue / activeProjects.length : 0,
    projectsByStatus,
    projectsByMonth,
    costsByDivision,
    recentActivity,
  }
}

/**
 * Calculate project total including markup and tax
 */
export function calculateProjectTotal(project: Project): number {
  const subtotal = project.lineItems.reduce((sum, item) => sum + item.totalCost, 0)
  const markupPercent = project.projectSettings.markupPercentage ?? 15
  const taxPercent = project.projectSettings.taxPercentage ?? 7

  const markup = subtotal * (markupPercent / 100)
  const tax = (subtotal + markup) * (taxPercent / 100)

  return subtotal + markup + tax
}

/**
 * Get projects grouped by month
 */
function getProjectsByMonth(projects: Project[]): { month: string; count: number; value: number }[] {
  const months: Map<string, { count: number; value: number }> = new Map()

  // Initialize last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    months.set(key, { count: 0, value: 0 })
  }

  projects.forEach(project => {
    const date = new Date(project.createdAt)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

    if (months.has(key)) {
      const current = months.get(key)!
      current.count++
      current.value += calculateProjectTotal(project)
    }
  })

  return Array.from(months.entries()).map(([month, data]) => ({
    month: formatMonth(month),
    count: data.count,
    value: data.value,
  }))
}

/**
 * Format month key to display name
 */
function formatMonth(key: string): string {
  const [year, month] = key.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

/**
 * Get costs aggregated by division
 */
function getCostsByDivision(projects: Project[]): { division: string; cost: number }[] {
  const divisionCosts: Map<string, number> = new Map()

  projects.forEach(project => {
    project.lineItems.forEach(item => {
      const current = divisionCosts.get(item.division) || 0
      divisionCosts.set(item.division, current + item.totalCost)
    })
  })

  return Array.from(divisionCosts.entries())
    .map(([division, cost]) => {
      const divInfo = DIVISIONS_ALL.find(d => d.code === division)
      return {
        division: divInfo ? `${division} - ${divInfo.name}` : division,
        cost,
      }
    })
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 10) // Top 10 divisions
}

/**
 * Get recent activity
 */
function getRecentActivity(projects: Project[]): ActivityItem[] {
  const activities: ActivityItem[] = []

  projects
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 20)
    .forEach(project => {
      // Add creation activity
      activities.push({
        id: `${project.id}-created`,
        type: 'project_created',
        projectId: project.id,
        projectName: project.projectSettings.projectName,
        timestamp: project.createdAt,
      })

      // Add status change activity if applicable
      if (project.status && project.status !== 'draft') {
        activities.push({
          id: `${project.id}-status`,
          type: project.status === 'sent' ? 'project_sent' :
            project.status === 'approved' ? 'project_approved' :
              project.status === 'rejected' ? 'project_rejected' : 'project_updated',
          projectId: project.id,
          projectName: project.projectSettings.projectName,
          timestamp: project.updatedAt,
        })
      }
    })

  return activities
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10)
}

/**
 * Calculate profit analysis for a project
 */
export function calculateProfitAnalysis(project: Project): ProfitAnalysis {
  const summary = calculateSummary(project)

  const totalCost = summary.subtotal
  const totalRevenue = summary.totalCost
  const grossProfit = totalRevenue - totalCost
  const grossMarginPercentage = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

  // By division
  const divisionMap: Map<string, { cost: number; items: LineItem[] }> = new Map()
  project.lineItems.forEach(item => {
    const current = divisionMap.get(item.division) || { cost: 0, items: [] }
    current.cost += item.totalCost
    current.items.push(item)
    divisionMap.set(item.division, current)
  })

  const markupMultiplier = 1 + (summary.markupPercentage / 100)
  const taxMultiplier = 1 + (summary.taxPercentage / 100)

  const byDivision: DivisionProfit[] = Array.from(divisionMap.entries()).map(([division, data]) => {
    const cost = data.cost
    const revenue = cost * markupMultiplier * taxMultiplier
    const profit = revenue - cost
    const divInfo = DIVISIONS_ALL.find(d => d.code === division)

    return {
      division,
      divisionName: divInfo?.name || division,
      cost,
      revenue,
      profit,
      marginPercentage: revenue > 0 ? (profit / revenue) * 100 : 0,
    }
  }).sort((a, b) => b.cost - a.cost)

  // By type
  const typeMap: Map<LineItem['type'], number> = new Map()
  project.lineItems.forEach(item => {
    const current = typeMap.get(item.type) || 0
    typeMap.set(item.type, current + item.totalCost)
  })

  const byType: TypeProfit[] = Array.from(typeMap.entries()).map(([type, cost]) => {
    const revenue = cost * markupMultiplier * taxMultiplier
    const profit = revenue - cost

    return {
      type,
      cost,
      revenue,
      profit,
      marginPercentage: revenue > 0 ? (profit / revenue) * 100 : 0,
    }
  }).sort((a, b) => b.cost - a.cost)

  // Generate recommendations
  const recommendations: string[] = []

  if (grossMarginPercentage < 15) {
    recommendations.push('Consider increasing markup - current margin is below industry average')
  }

  const laborCost = typeMap.get('labor') || 0
  if (laborCost / totalCost > 0.5) {
    recommendations.push('Labor costs are high - consider efficiency improvements or subcontracting')
  }

  const lowMarginDivisions = byDivision.filter(d => d.marginPercentage < 10)
  if (lowMarginDivisions.length > 0) {
    recommendations.push(`Low margins in: ${lowMarginDivisions.map(d => d.divisionName).join(', ')}`)
  }

  return {
    totalRevenue,
    totalCost,
    grossProfit,
    grossMarginPercentage,
    byDivision,
    byType,
    recommendations,
  }
}

/**
 * Calculate summary for a project
 */
function calculateSummary(project: Project): Summary {
  let materialsCost = 0
  let laborCost = 0
  let equipmentCost = 0
  let subcontractorCost = 0
  let miscCost = 0

  project.lineItems.forEach(item => {
    switch (item.type) {
      case 'material':
        materialsCost += item.totalCost
        break
      case 'labor':
        laborCost += item.totalCost
        break
      case 'equipment':
        equipmentCost += item.totalCost
        break
      case 'subcontractor':
        subcontractorCost += item.totalCost
        break
      case 'misc':
        miscCost += item.totalCost
        break
    }
  })

  const subtotal = materialsCost + laborCost + equipmentCost + subcontractorCost + miscCost
  const markupPercentage = project.projectSettings.markupPercentage ?? 15
  const taxPercentage = project.projectSettings.taxPercentage ?? 7

  const markup = subtotal * (markupPercentage / 100)
  const tax = (subtotal + markup) * (taxPercentage / 100)
  const totalCost = subtotal + markup + tax

  return {
    materialsCost,
    laborCost,
    equipmentCost,
    subcontractorCost,
    miscCost,
    subtotal,
    markup,
    markupPercentage,
    tax,
    taxPercentage,
    totalCost,
  }
}
