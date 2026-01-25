import type { ImportMapping, ImportResult, LineItem } from '@/types'

/**
 * Parse CSV content into rows
 */
export function parseCSV(content: string): string[][] {
  const lines = content.split(/\r?\n/)
  const rows: string[][] = []

  for (const line of lines) {
    if (!line.trim()) continue

    const row: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        row.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    row.push(current.trim())
    rows.push(row)
  }

  return rows
}

/**
 * Auto-detect column mapping based on header names
 */
export function autoDetectMapping(headers: string[]): Partial<ImportMapping> {
  const mapping: Partial<ImportMapping> = {}
  const headerLower = headers.map(h => h.toLowerCase().trim())

  // Division patterns
  const divisionPatterns = ['division', 'div', 'csi', 'code', 'category']
  for (let i = 0; i < headerLower.length; i++) {
    if (divisionPatterns.some(p => headerLower[i].includes(p))) {
      mapping.division = i.toString()
      break
    }
  }

  // Description patterns
  const descPatterns = ['description', 'desc', 'name', 'item', 'work']
  for (let i = 0; i < headerLower.length; i++) {
    if (descPatterns.some(p => headerLower[i].includes(p))) {
      mapping.description = i.toString()
      break
    }
  }

  // Type patterns
  const typePatterns = ['type', 'category', 'kind']
  for (let i = 0; i < headerLower.length; i++) {
    if (typePatterns.some(p => headerLower[i] === p)) {
      mapping.type = i.toString()
      break
    }
  }

  // Quantity patterns
  const qtyPatterns = ['quantity', 'qty', 'amount', 'count']
  for (let i = 0; i < headerLower.length; i++) {
    if (qtyPatterns.some(p => headerLower[i].includes(p))) {
      mapping.quantity = i.toString()
      break
    }
  }

  // Unit patterns
  const unitPatterns = ['unit', 'uom', 'measure']
  for (let i = 0; i < headerLower.length; i++) {
    if (unitPatterns.some(p => headerLower[i].includes(p)) && !headerLower[i].includes('cost')) {
      mapping.unit = i.toString()
      break
    }
  }

  // Unit cost patterns
  const costPatterns = ['unit cost', 'unitcost', 'price', 'rate', 'cost/unit']
  for (let i = 0; i < headerLower.length; i++) {
    if (costPatterns.some(p => headerLower[i].includes(p))) {
      mapping.unitCost = i.toString()
      break
    }
  }

  // Notes patterns
  const notesPatterns = ['notes', 'note', 'comments', 'remarks']
  for (let i = 0; i < headerLower.length; i++) {
    if (notesPatterns.some(p => headerLower[i].includes(p))) {
      mapping.notes = i.toString()
      break
    }
  }

  return mapping
}

/**
 * Parse a type string into a valid LineItem type
 */
function parseType(value: string): LineItem['type'] {
  const lower = value.toLowerCase().trim()
  if (lower.includes('material')) return 'material'
  if (lower.includes('labor')) return 'labor'
  if (lower.includes('equipment')) return 'equipment'
  if (lower.includes('sub')) return 'subcontractor'
  return 'misc'
}

/**
 * Parse a number from various formats
 */
function parseNumber(value: string): number {
  if (!value) return 0
  // Remove currency symbols, commas, and spaces
  const cleaned = value.replace(/[$,\s]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

/**
 * Import line items from parsed CSV data
 */
export function importLineItems(
  rows: string[][],
  mapping: ImportMapping,
  skipHeader: boolean = true
): ImportResult {
  const result: ImportResult = {
    success: 0,
    failed: 0,
    errors: [],
    items: [],
  }

  const dataRows = skipHeader ? rows.slice(1) : rows

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i]
    const rowNum = skipHeader ? i + 2 : i + 1 // 1-based, accounting for header

    try {
      const descIndex = parseInt(mapping.description)
      const description = row[descIndex]?.trim()

      if (!description) {
        result.errors.push({ row: rowNum, message: 'Missing description' })
        result.failed++
        continue
      }

      const qtyIndex = parseInt(mapping.quantity)
      const unitIndex = parseInt(mapping.unit)
      const costIndex = parseInt(mapping.unitCost)

      const quantity = parseNumber(row[qtyIndex])
      const unit = row[unitIndex]?.trim() || 'EA'
      const unitCost = parseNumber(row[costIndex])

      const item: Omit<LineItem, 'id' | 'createdAt' | 'updatedAt' | 'order'> = {
        division: mapping.division ? row[parseInt(mapping.division)]?.trim() || '01' : '01',
        description,
        type: mapping.type ? parseType(row[parseInt(mapping.type)]) : 'material',
        quantity,
        unit,
        unitCost,
        totalCost: quantity * unitCost,
        notes: mapping.notes ? row[parseInt(mapping.notes)]?.trim() : undefined,
      }

      result.items.push(item)
      result.success++
    } catch (error: any) {
      result.errors.push({ row: rowNum, message: error.message || 'Failed to parse row' })
      result.failed++
    }
  }

  return result
}

/**
 * Read file content as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target?.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

/**
 * Export line items to CSV format
 */
export function exportToCSV(
  items: LineItem[],
  includeHeaders: boolean = true
): string {
  const headers = ['Division', 'Description', 'Type', 'Quantity', 'Unit', 'Unit Cost', 'Total Cost', 'Notes']

  const rows = items.map(item => [
    item.division,
    `"${item.description.replace(/"/g, '""')}"`,
    item.type,
    item.quantity.toString(),
    item.unit,
    item.unitCost.toFixed(2),
    item.totalCost.toFixed(2),
    item.notes ? `"${item.notes.replace(/"/g, '""')}"` : '',
  ])

  if (includeHeaders) {
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  }
  return rows.map(r => r.join(',')).join('\n')
}
