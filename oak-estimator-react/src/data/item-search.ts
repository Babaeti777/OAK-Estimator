/**
 * Item Search Index
 *
 * Builds a searchable index of all items from default assemblies,
 * including related/alternative items. Used for autocomplete when
 * users type in description fields.
 */

import type { LineItem } from '@/types'
import { DEFAULT_ASSEMBLIES } from './default-assemblies'

export interface SearchableItem {
  description: string
  division: string
  type: LineItem['type']
  unit: string
  unitCost: number
  notes?: string
  source: string // Assembly name this came from
}

let _searchIndex: SearchableItem[] | null = null

/**
 * Build and cache the search index from all default assemblies.
 * Includes both primary items and their related alternatives.
 */
function buildSearchIndex(): SearchableItem[] {
  const seen = new Map<string, SearchableItem>()

  for (const assembly of DEFAULT_ASSEMBLIES) {
    for (const item of assembly.items) {
      // Add the primary item
      const key = item.description.toLowerCase()
      if (!seen.has(key)) {
        seen.set(key, {
          description: item.description,
          division: item.division,
          type: item.type,
          unit: item.unit,
          unitCost: item.unitCost,
          notes: item.notes,
          source: assembly.name,
        })
      }

      // Add related items
      if (item.relatedItems) {
        for (const related of item.relatedItems) {
          const relKey = related.description.toLowerCase()
          if (!seen.has(relKey)) {
            seen.set(relKey, {
              description: related.description,
              division: item.division,
              type: item.type,
              unit: related.unit || item.unit,
              unitCost: related.unitCost,
              notes: related.notes,
              source: assembly.name,
            })
          }
        }
      }
    }
  }

  return Array.from(seen.values())
}

/**
 * Get the full search index (built lazily on first call).
 */
export function getSearchIndex(): SearchableItem[] {
  if (!_searchIndex) {
    _searchIndex = buildSearchIndex()
  }
  return _searchIndex
}

/**
 * Search items by query string. Returns matches sorted by relevance.
 * Matches against description and notes.
 */
export function searchItems(query: string, limit = 10): SearchableItem[] {
  if (!query || query.trim().length < 2) return []

  const index = getSearchIndex()
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)

  const scored: Array<{ item: SearchableItem; score: number }> = []

  for (const item of index) {
    const desc = item.description.toLowerCase()
    const notes = (item.notes || '').toLowerCase()
    let score = 0

    for (const term of terms) {
      // Exact start match on description is highest value
      if (desc.startsWith(term)) {
        score += 10
      }
      // Word-boundary match in description
      else if (desc.includes(term)) {
        score += 5
      }
      // Match in notes
      if (notes.includes(term)) {
        score += 2
      }
    }

    if (score > 0) {
      scored.push({ item, score })
    }
  }

  // Sort by score descending, then alphabetically
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return a.item.description.localeCompare(b.item.description)
  })

  return scored.slice(0, limit).map(s => s.item)
}
