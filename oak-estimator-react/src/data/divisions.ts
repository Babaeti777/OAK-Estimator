export interface Division {
  code: string
  name: string
}

export const DIVISIONS_PRELIMINARY: Division[] = [
  { code: '01', name: 'General Requirements' },
  { code: '02', name: 'Existing Conditions' },
  { code: '03', name: 'Concrete' },
  { code: '04', name: 'Masonry' },
  { code: '05', name: 'Metals' },
  { code: '06', name: 'Wood, Plastics & Composites' },
  { code: '07', name: 'Thermal & Moisture Protection' },
  { code: '08', name: 'Openings' },
  { code: '09', name: 'Finishes' },
  { code: '10', name: 'Specialties' },
]

export const DIVISIONS_ALL: Division[] = [
  ...DIVISIONS_PRELIMINARY,
  { code: '11', name: 'Equipment' },
  { code: '12', name: 'Furnishings' },
  { code: '13', name: 'Special Construction' },
  { code: '14', name: 'Conveying Equipment' },
  { code: '21', name: 'Fire Suppression' },
  { code: '22', name: 'Plumbing' },
  { code: '23', name: 'HVAC' },
  { code: '26', name: 'Electrical' },
  { code: '27', name: 'Communications' },
  { code: '28', name: 'Electronic Safety & Security' },
  { code: '31', name: 'Earthwork' },
]

export const DIVISION_FILTERS: Division[] = [
  { code: '', name: 'All Divisions' },
  ...DIVISIONS_PRELIMINARY,
]

export function getDivisionLabel(code: string) {
  const division = DIVISIONS_ALL.find((item) => item.code === code)
  if (!division) {
    return code
  }

  return `${division.code} - ${division.name}`
}
