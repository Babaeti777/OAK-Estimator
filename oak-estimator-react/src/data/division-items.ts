/**
 * Division Items Helper
 *
 * Provides descriptions filtered by division from the MaterialsDatabase,
 * with auto-detected type based on cost breakdown.
 */

import { MaterialsDatabase } from './materials-database'
import type { LineItem } from '@/types'

export interface DivisionItem {
  id: string
  description: string
  unit: string
  unitCost: number
  type: LineItem['type']
}

interface MaterialEntry {
  id: string
  description: string
  unit: string
  material: number
  labor: number
  equipment: number
  category?: string
  subcategory?: string
}

/**
 * Determine the primary type from cost breakdown.
 */
function detectType(item: MaterialEntry): LineItem['type'] {
  const { material, labor, equipment } = item
  if (material >= labor && material >= equipment) return 'material'
  if (labor >= material && labor >= equipment) return 'labor'
  return 'equipment'
}

// Cache per division
const _cache = new Map<string, DivisionItem[]>()

/**
 * Get all items for a given division code (e.g., '01', '03').
 * Results are cached after first call.
 */
export function getItemsForDivision(divisionCode: string): DivisionItem[] {
  if (_cache.has(divisionCode)) {
    return _cache.get(divisionCode)!
  }

  const divisionData = (MaterialsDatabase as Record<string, unknown>)[divisionCode] as
    | { name: string; items: MaterialEntry[] }
    | undefined

  if (!divisionData || !divisionData.items) {
    _cache.set(divisionCode, [])
    return []
  }

  const items: DivisionItem[] = divisionData.items.map((entry) => {
    const type = detectType(entry)
    const unitCost =
      type === 'material'
        ? entry.material
        : type === 'labor'
          ? entry.labor
          : entry.equipment

    return {
      id: entry.id,
      description: entry.description,
      unit: entry.unit,
      unitCost: Math.max(entry.material + entry.labor + entry.equipment, unitCost),
      type,
    }
  })

  _cache.set(divisionCode, items)
  return items
}

/**
 * Search items within a specific division by query string.
 */
export function searchDivisionItems(
  divisionCode: string,
  query: string,
  limit = 15
): DivisionItem[] {
  const items = getItemsForDivision(divisionCode)
  if (!query || query.trim().length < 1) return items.slice(0, limit)

  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)

  const scored: Array<{ item: DivisionItem; score: number }> = []

  for (const item of items) {
    const desc = item.description.toLowerCase()
    let score = 0

    for (const term of terms) {
      if (desc.startsWith(term)) {
        score += 10
      } else if (desc.includes(term)) {
        score += 5
      }
    }

    if (score > 0) {
      scored.push({ item, score })
    }
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.item.description.localeCompare(b.item.description)
  })

  return scored.slice(0, limit).map((s) => s.item)
}
