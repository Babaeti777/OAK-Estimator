/**
 * Construction unit definitions and conversion factors.
 *
 * Units are grouped by category for display, and convertible pairs
 * are defined so that when a user changes a unit the quantity can
 * be automatically adjusted.
 */

export interface UnitDef {
  value: string
  label: string
  category: string
}

// Canonical list of selectable units, grouped by category.
export const UNITS: UnitDef[] = [
  // Count
  { value: 'EA',    label: 'EA — Each',          category: 'Count' },
  { value: 'PR',    label: 'PR — Pair',          category: 'Count' },
  { value: 'SET',   label: 'SET — Set',          category: 'Count' },
  { value: 'LS',    label: 'LS — Lump Sum',      category: 'Count' },

  // Length
  { value: 'INCH',  label: 'INCH — Inch',        category: 'Length' },
  { value: 'LF',    label: 'LF — Linear Foot',   category: 'Length' },
  { value: 'MILE',  label: 'MILE — Mile',         category: 'Length' },

  // Area
  { value: 'SF',    label: 'SF — Square Foot',    category: 'Area' },
  { value: 'SY',    label: 'SY — Square Yard',    category: 'Area' },
  { value: 'CSF',   label: 'CSF — 100 Sq Ft',     category: 'Area' },
  { value: 'ACRE',  label: 'ACRE — Acre',         category: 'Area' },

  // Volume
  { value: 'CF',    label: 'CF — Cubic Foot',     category: 'Volume' },
  { value: 'CY',    label: 'CY — Cubic Yard',     category: 'Volume' },
  { value: 'GAL',   label: 'GAL — Gallon',        category: 'Volume' },

  // Weight
  { value: 'LB',    label: 'LB — Pound',          category: 'Weight' },
  { value: 'TON',   label: 'TON — Ton (2000 lb)', category: 'Weight' },

  // Time
  { value: 'HR',    label: 'HR — Hour',           category: 'Time' },
  { value: 'DAY',   label: 'DAY — Day (8 hr)',    category: 'Time' },
  { value: 'MONTH', label: 'MONTH — Month',       category: 'Time' },
  { value: 'YEAR',  label: 'YEAR — Year',         category: 'Time' },

  // Other
  { value: 'BAG',   label: 'BAG — Bag',           category: 'Other' },
  { value: 'DRUM',  label: 'DRUM — Drum',         category: 'Other' },
  { value: 'VF',    label: 'VF — Vertical Foot',  category: 'Other' },
]

// Quick lookup set so we can tell if a value is in the canonical list.
const UNIT_VALUE_SET = new Set(UNITS.map(u => u.value))

/** Return true when the value matches a known unit (case-insensitive). */
export function isKnownUnit(value: string): boolean {
  return UNIT_VALUE_SET.has(value.toUpperCase())
}

/** Normalise a unit string to its canonical uppercase form. */
export function normalizeUnit(raw: string): string {
  const upper = raw.trim().toUpperCase()
  // Handle common aliases
  const ALIASES: Record<string, string> = {
    SQFT: 'SF',
    SQYD: 'SY',
    CUYD: 'CY',
    CUFT: 'CF',
    EACH: 'EA',
    LNFT: 'LF',
    LBS:  'LB',
    TONS: 'TON',
    GALS: 'GAL',
    HRS:  'HR',
    DAYS: 'DAY',
  }
  return ALIASES[upper] ?? upper
}

// ─── Conversion factors ────────────────────────────────────────────
// Each entry maps "FROM→TO" to a multiplier such that:
//   new_quantity = old_quantity * factor
//   new_unitCost = old_unitCost / factor
//
// Only pairs within the same physical dimension are listed.

const CONVERSION_TABLE: Record<string, number> = {
  // Length
  'INCH→LF':   1 / 12,
  'LF→INCH':   12,
  'LF→MILE':   1 / 5280,
  'MILE→LF':   5280,
  'INCH→MILE': 1 / 63360,
  'MILE→INCH': 63360,

  // Area
  'SF→SY':     1 / 9,
  'SY→SF':     9,
  'SF→CSF':    1 / 100,
  'CSF→SF':    100,
  'SY→CSF':    9 / 100,
  'CSF→SY':    100 / 9,
  'SF→ACRE':   1 / 43560,
  'ACRE→SF':   43560,
  'SY→ACRE':   1 / 4840,
  'ACRE→SY':   4840,
  'CSF→ACRE':  100 / 43560,
  'ACRE→CSF':  43560 / 100,

  // Volume
  'CF→CY':     1 / 27,
  'CY→CF':     27,
  'GAL→CF':    1 / 7.48052,
  'CF→GAL':    7.48052,
  'GAL→CY':    1 / (7.48052 * 27),
  'CY→GAL':    7.48052 * 27,

  // Weight
  'LB→TON':    1 / 2000,
  'TON→LB':    2000,

  // Time
  'HR→DAY':    1 / 8,
  'DAY→HR':    8,
  'DAY→MONTH': 1 / 22,
  'MONTH→DAY': 22,
  'HR→MONTH':  1 / 176,
  'MONTH→HR':  176,
  'MONTH→YEAR': 1 / 12,
  'YEAR→MONTH': 12,
  'DAY→YEAR':   1 / 264,
  'YEAR→DAY':   264,
  'HR→YEAR':    1 / 2112,
  'YEAR→HR':    2112,
}

export interface ConversionResult {
  factor: number
  newQuantity: number
  newUnitCost: number
}

/**
 * Attempt to convert between two units.
 * Returns null when the pair is not convertible.
 */
export function convertUnit(
  fromUnit: string,
  toUnit: string,
  quantity: number,
  unitCost: number,
): ConversionResult | null {
  const from = normalizeUnit(fromUnit)
  const to = normalizeUnit(toUnit)
  if (from === to) return null

  const key = `${from}→${to}`
  const factor = CONVERSION_TABLE[key]
  if (factor == null) return null

  return {
    factor,
    newQuantity: +(quantity * factor).toPrecision(10),
    newUnitCost: +(unitCost / factor).toPrecision(10),
  }
}
