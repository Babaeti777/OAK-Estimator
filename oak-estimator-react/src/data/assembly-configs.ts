/**
 * Smart Assembly Form Configurations
 *
 * Defines the dynamic form fields for each assembly category.
 * The wizard uses these configs to render category-specific questions
 * and generate assembly items from the answers.
 */

import type { AssemblyCategory, AssemblyItem, LineItem } from '@/types'

// ============================================
// Form Field Types
// ============================================

export interface FormFieldOption {
  value: string
  label: string
  /** Multiplier applied to base cost/quantity when this option is selected */
  costMultiplier?: number
  quantityMultiplier?: number
}

export interface FormField {
  id: string
  label: string
  type: 'select' | 'number' | 'text' | 'toggle'
  options?: FormFieldOption[]
  defaultValue?: string | number | boolean
  placeholder?: string
  unit?: string        // e.g., "SF", "LF", "rooms"
  min?: number
  max?: number
  step?: number
  helpText?: string
  /** Only show this field when another field matches a condition */
  showWhen?: { field: string; value: string | number | boolean }
}

export interface AssemblyTemplate {
  description: string
  division: string
  type: LineItem['type']
  baseQuantity: number
  unit: string
  baseUnitCost: number
  notes?: string
  /** Which form field scales this item's quantity */
  scaleBy?: string
  /** Which form field selects a cost variant */
  variantField?: string
  /** Cost overrides keyed by variant field value */
  variantCosts?: Record<string, number>
  /** Quantity overrides keyed by variant field value */
  variantQuantities?: Record<string, number>
  /** Only include when a field matches */
  includeWhen?: { field: string; value: string | number | boolean }
}

export interface CategoryFormConfig {
  category: AssemblyCategory
  title: string
  description: string
  fields: FormField[]
  templates: AssemblyTemplate[]
  /** Default estimated duration in days */
  baseDuration: number
  /** Which field scales the duration */
  durationScaleField?: string
  durationScaleFactor?: number
}

// ============================================
// Helper: Generate items from config + answers
// ============================================

let wizardItemId = 0
function genWizardItemId(): string {
  return `wizard-item-${++wizardItemId}`
}

export function generateItemsFromConfig(
  config: CategoryFormConfig,
  answers: Record<string, string | number | boolean>
): { items: AssemblyItem[]; estimatedDuration: number } {
  const items: AssemblyItem[] = []

  for (const template of config.templates) {
    // Check includeWhen condition
    if (template.includeWhen) {
      const fieldVal = answers[template.includeWhen.field]
      if (fieldVal !== template.includeWhen.value) continue
    }

    let quantity = template.baseQuantity
    let unitCost = template.baseUnitCost

    // Apply scale factor from a form field
    if (template.scaleBy && answers[template.scaleBy] !== undefined) {
      const scaleVal = Number(answers[template.scaleBy])
      if (!isNaN(scaleVal) && scaleVal > 0) {
        quantity = template.baseQuantity * scaleVal
      }
    }

    // Apply variant cost/quantity overrides
    if (template.variantField && answers[template.variantField] !== undefined) {
      const variant = String(answers[template.variantField])
      if (template.variantCosts?.[variant] !== undefined) {
        unitCost = template.variantCosts[variant]
      }
      if (template.variantQuantities?.[variant] !== undefined) {
        quantity = template.variantQuantities[variant]
        // Still apply scale if both exist
        if (template.scaleBy && answers[template.scaleBy] !== undefined) {
          const scaleVal = Number(answers[template.scaleBy])
          if (!isNaN(scaleVal) && scaleVal > 0) {
            quantity = quantity * scaleVal
          }
        }
      }
    }

    // Apply any option-level multipliers from select fields
    for (const field of config.fields) {
      if (field.type === 'select' && field.options && answers[field.id]) {
        const selected = field.options.find(o => o.value === answers[field.id])
        if (selected) {
          if (selected.costMultiplier && template.scaleBy !== field.id && template.variantField !== field.id) {
            unitCost = Math.round(unitCost * selected.costMultiplier * 100) / 100
          }
          if (selected.quantityMultiplier && template.scaleBy !== field.id) {
            quantity = Math.round(quantity * selected.quantityMultiplier * 100) / 100
          }
        }
      }
    }

    items.push({
      id: genWizardItemId(),
      description: template.description,
      division: template.division,
      type: template.type,
      quantity: Math.round(quantity * 100) / 100,
      unit: template.unit,
      unitCost: Math.round(unitCost * 100) / 100,
      notes: template.notes,
    })
  }

  // Calculate duration
  let duration = config.baseDuration
  if (config.durationScaleField && answers[config.durationScaleField] !== undefined) {
    const scaleVal = Number(answers[config.durationScaleField])
    const factor = config.durationScaleFactor || 1
    if (!isNaN(scaleVal) && scaleVal > 0) {
      duration = Math.ceil(config.baseDuration * scaleVal * factor)
    }
  }

  return { items, estimatedDuration: Math.max(1, duration) }
}

// ============================================
// Category Configurations
// ============================================

const demolitionConfig: CategoryFormConfig = {
  category: 'demolition',
  title: 'Demolition',
  description: 'What are you demolishing?',
  baseDuration: 2,
  durationScaleField: 'scope',
  durationScaleFactor: 0.5,
  fields: [
    {
      id: 'scope',
      label: 'Scope',
      type: 'select',
      options: [
        { value: 'kitchen', label: 'Kitchen' },
        { value: 'bathroom', label: 'Bathroom' },
        { value: 'wall', label: 'Wall Removal' },
        { value: 'flooring', label: 'Flooring Only' },
        { value: 'full-gut', label: 'Full Gut' },
      ],
    },
    {
      id: 'area',
      label: 'Approximate Area',
      type: 'number',
      unit: 'SF',
      defaultValue: 200,
      min: 50,
      max: 5000,
      step: 50,
    },
    {
      id: 'dumpster',
      label: 'Dumpster Size',
      type: 'select',
      options: [
        { value: '10', label: '10 Yard' },
        { value: '20', label: '20 Yard' },
        { value: '30', label: '30 Yard' },
        { value: '40', label: '40 Yard' },
      ],
      defaultValue: '20',
    },
    {
      id: 'hazmat',
      label: 'Hazardous Materials',
      type: 'toggle',
      defaultValue: false,
      helpText: 'Asbestos, lead paint, or other hazmat present',
    },
  ],
  templates: [
    { description: 'Demolition labor', division: '02', type: 'labor', baseQuantity: 0.08, unit: 'HR', baseUnitCost: 55, scaleBy: 'area', notes: 'Per SF of demo area' },
    { description: 'Debris removal labor', division: '02', type: 'labor', baseQuantity: 0.03, unit: 'HR', baseUnitCost: 45, scaleBy: 'area' },
    { description: 'Dumpster rental', division: '02', type: 'equipment', baseQuantity: 1, unit: 'EA', baseUnitCost: 450, variantField: 'dumpster', variantCosts: { '10': 350, '20': 450, '30': 550, '40': 650 } },
    { description: 'Dump fees', division: '02', type: 'misc', baseQuantity: 1, unit: 'LS', baseUnitCost: 200 },
    { description: 'Hazmat abatement', division: '02', type: 'subcontractor', baseQuantity: 1, unit: 'LS', baseUnitCost: 1500, includeWhen: { field: 'hazmat', value: true } },
  ],
}

const siteworkConfig: CategoryFormConfig = {
  category: 'sitework',
  title: 'Sitework',
  description: 'Site preparation and earthwork',
  baseDuration: 3,
  durationScaleField: 'area',
  durationScaleFactor: 0.002,
  fields: [
    {
      id: 'workType',
      label: 'Work Type',
      type: 'select',
      options: [
        { value: 'grading', label: 'Grading' },
        { value: 'excavation', label: 'Excavation' },
        { value: 'trenching', label: 'Utility Trenching' },
        { value: 'backfill', label: 'Backfill & Compaction' },
      ],
    },
    {
      id: 'area',
      label: 'Area / Length',
      type: 'number',
      unit: 'SF or LF',
      defaultValue: 500,
      min: 50,
      max: 10000,
      step: 50,
    },
    {
      id: 'accessDifficulty',
      label: 'Site Access',
      type: 'select',
      options: [
        { value: 'easy', label: 'Easy Access', costMultiplier: 1 },
        { value: 'moderate', label: 'Moderate', costMultiplier: 1.2 },
        { value: 'difficult', label: 'Difficult / Tight', costMultiplier: 1.5 },
      ],
      defaultValue: 'easy',
    },
  ],
  templates: [
    { description: 'Equipment mobilization', division: '31', type: 'equipment', baseQuantity: 1, unit: 'LS', baseUnitCost: 500 },
    { description: 'Excavation / grading', division: '31', type: 'equipment', baseQuantity: 0.01, unit: 'HR', baseUnitCost: 150, scaleBy: 'area' },
    { description: 'Operator labor', division: '31', type: 'labor', baseQuantity: 0.01, unit: 'HR', baseUnitCost: 75, scaleBy: 'area' },
    { description: 'Laborer', division: '31', type: 'labor', baseQuantity: 0.015, unit: 'HR', baseUnitCost: 50, scaleBy: 'area' },
    { description: 'Compaction', division: '31', type: 'equipment', baseQuantity: 0.005, unit: 'HR', baseUnitCost: 85, scaleBy: 'area' },
  ],
}

const concreteConfig: CategoryFormConfig = {
  category: 'concrete',
  title: 'Concrete',
  description: 'Foundations, slabs, and flatwork',
  baseDuration: 3,
  durationScaleField: 'area',
  durationScaleFactor: 0.005,
  fields: [
    {
      id: 'concreteType',
      label: 'Type',
      type: 'select',
      options: [
        { value: 'slab', label: 'Slab on Grade' },
        { value: 'foundation', label: 'Foundation Wall' },
        { value: 'footing', label: 'Footings' },
        { value: 'flatwork', label: 'Flatwork (patio/walk)' },
      ],
    },
    {
      id: 'area',
      label: 'Area',
      type: 'number',
      unit: 'SF',
      defaultValue: 400,
      min: 25,
      max: 10000,
      step: 25,
    },
    {
      id: 'thickness',
      label: 'Thickness',
      type: 'select',
      options: [
        { value: '4', label: '4 inches', costMultiplier: 1 },
        { value: '6', label: '6 inches', costMultiplier: 1.4 },
        { value: '8', label: '8 inches', costMultiplier: 1.8 },
      ],
      defaultValue: '4',
    },
    {
      id: 'rebar',
      label: 'Include Rebar',
      type: 'toggle',
      defaultValue: true,
    },
  ],
  templates: [
    { description: 'Concrete (3000 PSI)', division: '03', type: 'material', baseQuantity: 0.012, unit: 'CY', baseUnitCost: 165, scaleBy: 'area', notes: 'Per SF at 4" thick' },
    { description: 'Form work', division: '03', type: 'material', baseQuantity: 0.5, unit: 'LF', baseUnitCost: 8.50, scaleBy: 'area' },
    { description: 'Rebar / wire mesh', division: '03', type: 'material', baseQuantity: 1, unit: 'SF', baseUnitCost: 1.25, scaleBy: 'area', includeWhen: { field: 'rebar', value: true } },
    { description: 'Concrete labor (pour & finish)', division: '03', type: 'labor', baseQuantity: 0.04, unit: 'HR', baseUnitCost: 65, scaleBy: 'area' },
    { description: 'Concrete pump', division: '03', type: 'equipment', baseQuantity: 1, unit: 'EA', baseUnitCost: 600 },
  ],
}

const framingConfig: CategoryFormConfig = {
  category: 'framing',
  title: 'Framing',
  description: 'Structural framing',
  baseDuration: 5,
  durationScaleField: 'length',
  durationScaleFactor: 0.1,
  fields: [
    {
      id: 'framingType',
      label: 'What to Frame',
      type: 'select',
      options: [
        { value: 'interior-wall', label: 'Interior Wall' },
        { value: 'exterior-wall', label: 'Exterior Wall' },
        { value: 'door-opening', label: 'Door Opening' },
        { value: 'window-opening', label: 'Window Opening' },
        { value: 'ceiling', label: 'Ceiling Joists' },
      ],
    },
    {
      id: 'length',
      label: 'Length / Quantity',
      type: 'number',
      unit: 'LF',
      defaultValue: 20,
      min: 1,
      max: 500,
      step: 1,
    },
    {
      id: 'material',
      label: 'Framing Material',
      type: 'select',
      options: [
        { value: '2x4', label: '2x4 Wood', costMultiplier: 1 },
        { value: '2x6', label: '2x6 Wood', costMultiplier: 1.5 },
        { value: 'steel', label: 'Steel Studs', costMultiplier: 1.3 },
      ],
      defaultValue: '2x4',
    },
    {
      id: 'height',
      label: 'Wall Height',
      type: 'select',
      options: [
        { value: '8', label: '8 ft', costMultiplier: 1 },
        { value: '9', label: '9 ft', costMultiplier: 1.15 },
        { value: '10', label: '10 ft', costMultiplier: 1.3 },
      ],
      defaultValue: '8',
      showWhen: { field: 'framingType', value: 'interior-wall' },
    },
  ],
  templates: [
    { description: 'Studs', division: '06', type: 'material', baseQuantity: 1, unit: 'LF', baseUnitCost: 4.50, scaleBy: 'length' },
    { description: 'Top/bottom plates', division: '06', type: 'material', baseQuantity: 2, unit: 'LF', baseUnitCost: 1.25, scaleBy: 'length' },
    { description: 'Fasteners & hardware', division: '06', type: 'material', baseQuantity: 1, unit: 'LF', baseUnitCost: 0.50, scaleBy: 'length' },
    { description: 'Framing labor', division: '06', type: 'labor', baseQuantity: 0.25, unit: 'HR', baseUnitCost: 65, scaleBy: 'length' },
  ],
}

const roofingConfig: CategoryFormConfig = {
  category: 'roofing',
  title: 'Roofing',
  description: 'Roof installation or repair',
  baseDuration: 3,
  durationScaleField: 'area',
  durationScaleFactor: 0.003,
  fields: [
    {
      id: 'roofType',
      label: 'Roofing Material',
      type: 'select',
      options: [
        { value: 'asphalt', label: 'Asphalt Shingles' },
        { value: 'metal', label: 'Standing Seam Metal' },
        { value: 'tile', label: 'Tile' },
        { value: 'flat', label: 'Flat / TPO' },
      ],
    },
    {
      id: 'area',
      label: 'Roof Area',
      type: 'number',
      unit: 'SF',
      defaultValue: 1500,
      min: 100,
      max: 10000,
      step: 100,
    },
    {
      id: 'tearOff',
      label: 'Tear Off Existing',
      type: 'toggle',
      defaultValue: false,
    },
  ],
  templates: [
    { description: 'Roofing material', division: '07', type: 'material', baseQuantity: 1, unit: 'SF', baseUnitCost: 3.50, scaleBy: 'area', variantField: 'roofType', variantCosts: { 'asphalt': 3.50, 'metal': 9.00, 'tile': 8.50, 'flat': 5.00 } },
    { description: 'Underlayment', division: '07', type: 'material', baseQuantity: 1, unit: 'SF', baseUnitCost: 0.50, scaleBy: 'area' },
    { description: 'Flashing & trim', division: '07', type: 'material', baseQuantity: 0.1, unit: 'LF', baseUnitCost: 6, scaleBy: 'area' },
    { description: 'Roofing labor', division: '07', type: 'labor', baseQuantity: 0.02, unit: 'HR', baseUnitCost: 60, scaleBy: 'area' },
    { description: 'Tear-off labor & disposal', division: '07', type: 'labor', baseQuantity: 0.015, unit: 'HR', baseUnitCost: 50, scaleBy: 'area', includeWhen: { field: 'tearOff', value: true } },
  ],
}

const plumbingConfig: CategoryFormConfig = {
  category: 'plumbing',
  title: 'Plumbing',
  description: 'Plumbing rough-in and finish',
  baseDuration: 4,
  fields: [
    {
      id: 'plumbingType',
      label: 'Scope',
      type: 'select',
      options: [
        { value: 'bathroom-rough', label: 'Bathroom Rough-In' },
        { value: 'kitchen-rough', label: 'Kitchen Rough-In' },
        { value: 'laundry', label: 'Laundry Hookup' },
        { value: 'repipe', label: 'Whole House Repipe' },
        { value: 'water-heater', label: 'Water Heater' },
      ],
    },
    {
      id: 'fixtures',
      label: 'Number of Fixtures',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 20,
      step: 1,
    },
    {
      id: 'pipeType',
      label: 'Pipe Material',
      type: 'select',
      options: [
        { value: 'pex', label: 'PEX', costMultiplier: 1 },
        { value: 'copper', label: 'Copper', costMultiplier: 2 },
        { value: 'pvc', label: 'PVC (drain only)', costMultiplier: 0.8 },
      ],
      defaultValue: 'pex',
    },
  ],
  templates: [
    { description: 'Supply piping', division: '22', type: 'material', baseQuantity: 25, unit: 'LF', baseUnitCost: 3.50, scaleBy: 'fixtures', variantField: 'pipeType', variantCosts: { 'pex': 3.50, 'copper': 8.00, 'pvc': 2.50 } },
    { description: 'Drain piping (PVC)', division: '22', type: 'material', baseQuantity: 15, unit: 'LF', baseUnitCost: 4.50, scaleBy: 'fixtures' },
    { description: 'Fittings & connections', division: '22', type: 'material', baseQuantity: 8, unit: 'EA', baseUnitCost: 12, scaleBy: 'fixtures' },
    { description: 'Plumbing labor', division: '22', type: 'labor', baseQuantity: 6, unit: 'HR', baseUnitCost: 85, scaleBy: 'fixtures' },
    { description: 'Permits & inspection', division: '22', type: 'misc', baseQuantity: 1, unit: 'LS', baseUnitCost: 250 },
  ],
}

const electricalConfig: CategoryFormConfig = {
  category: 'electrical',
  title: 'Electrical',
  description: 'Wiring and electrical work',
  baseDuration: 3,
  fields: [
    {
      id: 'electricalType',
      label: 'Scope',
      type: 'select',
      options: [
        { value: 'room-rough', label: 'Room Rough-In' },
        { value: 'panel-upgrade', label: 'Panel Upgrade' },
        { value: 'kitchen', label: 'Kitchen Circuits' },
        { value: 'bathroom', label: 'Bathroom Circuit' },
        { value: 'outdoor', label: 'Outdoor / Landscape' },
      ],
    },
    {
      id: 'circuits',
      label: 'Number of Circuits / Runs',
      type: 'number',
      defaultValue: 4,
      min: 1,
      max: 30,
      step: 1,
    },
    {
      id: 'wireType',
      label: 'Wire Gauge',
      type: 'select',
      options: [
        { value: '14-2', label: '14/2 (15A)', costMultiplier: 1 },
        { value: '12-2', label: '12/2 (20A)', costMultiplier: 1.3 },
        { value: '10-2', label: '10/2 (30A)', costMultiplier: 1.8 },
      ],
      defaultValue: '12-2',
    },
  ],
  templates: [
    { description: 'Romex wire', division: '26', type: 'material', baseQuantity: 50, unit: 'LF', baseUnitCost: 0.65, scaleBy: 'circuits' },
    { description: 'Boxes, connectors, plates', division: '26', type: 'material', baseQuantity: 4, unit: 'EA', baseUnitCost: 8, scaleBy: 'circuits' },
    { description: 'Breakers', division: '26', type: 'material', baseQuantity: 1, unit: 'EA', baseUnitCost: 15, scaleBy: 'circuits' },
    { description: 'Electrician labor', division: '26', type: 'labor', baseQuantity: 3, unit: 'HR', baseUnitCost: 85, scaleBy: 'circuits' },
    { description: 'Permits & inspection', division: '26', type: 'misc', baseQuantity: 1, unit: 'LS', baseUnitCost: 200 },
  ],
}

const hvacConfig: CategoryFormConfig = {
  category: 'hvac',
  title: 'HVAC',
  description: 'Heating, cooling, and ventilation',
  baseDuration: 3,
  fields: [
    {
      id: 'hvacType',
      label: 'System Type',
      type: 'select',
      options: [
        { value: 'split', label: 'Split System (AC + Furnace)' },
        { value: 'heatpump', label: 'Heat Pump' },
        { value: 'mini-split', label: 'Mini Split' },
        { value: 'ductwork', label: 'Ductwork Only' },
      ],
    },
    {
      id: 'tonnage',
      label: 'System Size',
      type: 'select',
      options: [
        { value: '1.5', label: '1.5 Ton' },
        { value: '2', label: '2 Ton' },
        { value: '2.5', label: '2.5 Ton' },
        { value: '3', label: '3 Ton' },
        { value: '4', label: '4 Ton' },
        { value: '5', label: '5 Ton' },
      ],
      defaultValue: '3',
    },
    {
      id: 'zones',
      label: 'Zones',
      type: 'number',
      defaultValue: 1,
      min: 1,
      max: 8,
      step: 1,
      showWhen: { field: 'hvacType', value: 'mini-split' },
    },
  ],
  templates: [
    { description: 'HVAC equipment', division: '23', type: 'equipment', baseQuantity: 1, unit: 'EA', baseUnitCost: 4500, variantField: 'hvacType', variantCosts: { 'split': 4500, 'heatpump': 5500, 'mini-split': 3500, 'ductwork': 0 } },
    { description: 'Ductwork / line set', division: '23', type: 'material', baseQuantity: 1, unit: 'LS', baseUnitCost: 1800, variantField: 'hvacType', variantCosts: { 'split': 1800, 'heatpump': 1800, 'mini-split': 600, 'ductwork': 2500 } },
    { description: 'Thermostat / controls', division: '23', type: 'material', baseQuantity: 1, unit: 'EA', baseUnitCost: 250 },
    { description: 'HVAC labor (install)', division: '23', type: 'labor', baseQuantity: 24, unit: 'HR', baseUnitCost: 85 },
    { description: 'Permits & inspection', division: '23', type: 'misc', baseQuantity: 1, unit: 'LS', baseUnitCost: 300 },
  ],
}

const insulationConfig: CategoryFormConfig = {
  category: 'insulation',
  title: 'Insulation',
  description: 'Thermal and acoustic insulation',
  baseDuration: 2,
  durationScaleField: 'area',
  durationScaleFactor: 0.002,
  fields: [
    {
      id: 'insulationType',
      label: 'Insulation Type',
      type: 'select',
      options: [
        { value: 'fiberglass-batt', label: 'Fiberglass Batt' },
        { value: 'blown-in', label: 'Blown-In' },
        { value: 'spray-foam-open', label: 'Spray Foam (Open Cell)' },
        { value: 'spray-foam-closed', label: 'Spray Foam (Closed Cell)' },
        { value: 'rigid', label: 'Rigid Foam Board' },
      ],
    },
    {
      id: 'area',
      label: 'Area to Insulate',
      type: 'number',
      unit: 'SF',
      defaultValue: 500,
      min: 50,
      max: 10000,
      step: 50,
    },
    {
      id: 'rValue',
      label: 'R-Value',
      type: 'select',
      options: [
        { value: 'R-13', label: 'R-13 (2x4 walls)', costMultiplier: 1 },
        { value: 'R-19', label: 'R-19 (2x6 walls)', costMultiplier: 1.3 },
        { value: 'R-30', label: 'R-30 (attic)', costMultiplier: 1.6 },
        { value: 'R-38', label: 'R-38 (attic, cold climate)', costMultiplier: 2 },
      ],
      defaultValue: 'R-13',
    },
  ],
  templates: [
    { description: 'Insulation material', division: '07', type: 'material', baseQuantity: 1, unit: 'SF', baseUnitCost: 0.75, scaleBy: 'area', variantField: 'insulationType', variantCosts: { 'fiberglass-batt': 0.75, 'blown-in': 1.00, 'spray-foam-open': 1.50, 'spray-foam-closed': 2.50, 'rigid': 1.25 } },
    { description: 'Vapor barrier', division: '07', type: 'material', baseQuantity: 1, unit: 'SF', baseUnitCost: 0.15, scaleBy: 'area' },
    { description: 'Insulation labor', division: '07', type: 'labor', baseQuantity: 0.01, unit: 'HR', baseUnitCost: 55, scaleBy: 'area' },
  ],
}

const drywallConfig: CategoryFormConfig = {
  category: 'drywall',
  title: 'Drywall',
  description: 'Hanging, taping, and finishing',
  baseDuration: 4,
  durationScaleField: 'area',
  durationScaleFactor: 0.004,
  fields: [
    {
      id: 'area',
      label: 'Wall/Ceiling Area',
      type: 'number',
      unit: 'SF',
      defaultValue: 500,
      min: 50,
      max: 10000,
      step: 50,
    },
    {
      id: 'boardType',
      label: 'Drywall Type',
      type: 'select',
      options: [
        { value: 'standard', label: '1/2" Standard' },
        { value: 'moisture', label: '1/2" Moisture Resistant' },
        { value: 'fire', label: '5/8" Fire Rated (Type X)' },
        { value: 'soundboard', label: '5/8" Soundboard' },
      ],
      defaultValue: 'standard',
    },
    {
      id: 'finishLevel',
      label: 'Finish Level',
      type: 'select',
      options: [
        { value: '3', label: 'Level 3 (tape + 2 coats)', costMultiplier: 1 },
        { value: '4', label: 'Level 4 (tape + 3 coats)', costMultiplier: 1.2 },
        { value: '5', label: 'Level 5 (skim coat)', costMultiplier: 1.5 },
      ],
      defaultValue: '4',
    },
  ],
  templates: [
    { description: 'Drywall board', division: '09', type: 'material', baseQuantity: 1, unit: 'SF', baseUnitCost: 0.55, scaleBy: 'area', variantField: 'boardType', variantCosts: { 'standard': 0.55, 'moisture': 0.70, 'fire': 0.65, 'soundboard': 0.85 } },
    { description: 'Joint compound & tape', division: '09', type: 'material', baseQuantity: 1, unit: 'SF', baseUnitCost: 0.15, scaleBy: 'area' },
    { description: 'Screws & fasteners', division: '09', type: 'material', baseQuantity: 1, unit: 'SF', baseUnitCost: 0.05, scaleBy: 'area' },
    { description: 'Hanging labor', division: '09', type: 'labor', baseQuantity: 0.015, unit: 'HR', baseUnitCost: 55, scaleBy: 'area' },
    { description: 'Taping & finishing labor', division: '09', type: 'labor', baseQuantity: 0.02, unit: 'HR', baseUnitCost: 60, scaleBy: 'area' },
  ],
}

const flooringConfig: CategoryFormConfig = {
  category: 'flooring',
  title: 'Flooring',
  description: 'Floor covering installation',
  baseDuration: 3,
  durationScaleField: 'area',
  durationScaleFactor: 0.003,
  fields: [
    {
      id: 'floorType',
      label: 'Flooring Type',
      type: 'select',
      options: [
        { value: 'lvp', label: 'Luxury Vinyl Plank (LVP)' },
        { value: 'hardwood', label: 'Hardwood' },
        { value: 'tile', label: 'Tile' },
        { value: 'carpet', label: 'Carpet' },
        { value: 'laminate', label: 'Laminate' },
      ],
    },
    {
      id: 'area',
      label: 'Floor Area',
      type: 'number',
      unit: 'SF',
      defaultValue: 300,
      min: 25,
      max: 5000,
      step: 25,
    },
    {
      id: 'subfloorPrep',
      label: 'Subfloor Prep Needed',
      type: 'toggle',
      defaultValue: false,
      helpText: 'Leveling, patching, or underlayment needed',
    },
  ],
  templates: [
    { description: 'Flooring material', division: '09', type: 'material', baseQuantity: 1.1, unit: 'SF', baseUnitCost: 4.00, scaleBy: 'area', notes: '10% waste factor', variantField: 'floorType', variantCosts: { 'lvp': 4.00, 'hardwood': 8.00, 'tile': 6.00, 'carpet': 3.50, 'laminate': 2.50 } },
    { description: 'Underlayment / adhesive', division: '09', type: 'material', baseQuantity: 1, unit: 'SF', baseUnitCost: 0.50, scaleBy: 'area', variantField: 'floorType', variantCosts: { 'lvp': 0.30, 'hardwood': 0.50, 'tile': 1.50, 'carpet': 0.35, 'laminate': 0.25 } },
    { description: 'Transitions & trim', division: '09', type: 'material', baseQuantity: 0.1, unit: 'LF', baseUnitCost: 8, scaleBy: 'area' },
    { description: 'Installation labor', division: '09', type: 'labor', baseQuantity: 0.025, unit: 'HR', baseUnitCost: 55, scaleBy: 'area', variantField: 'floorType', variantCosts: { 'lvp': 55, 'hardwood': 65, 'tile': 70, 'carpet': 45, 'laminate': 50 } },
    { description: 'Subfloor prep', division: '09', type: 'labor', baseQuantity: 0.01, unit: 'HR', baseUnitCost: 55, scaleBy: 'area', includeWhen: { field: 'subfloorPrep', value: true } },
  ],
}

const paintingConfig: CategoryFormConfig = {
  category: 'painting',
  title: 'Painting',
  description: 'Interior and exterior painting',
  baseDuration: 3,
  durationScaleField: 'area',
  durationScaleFactor: 0.003,
  fields: [
    {
      id: 'paintScope',
      label: 'Scope',
      type: 'select',
      options: [
        { value: 'interior-room', label: 'Interior Room(s)' },
        { value: 'interior-whole', label: 'Whole Interior' },
        { value: 'exterior', label: 'Exterior' },
        { value: 'trim-only', label: 'Trim & Doors Only' },
      ],
    },
    {
      id: 'area',
      label: 'Surface Area',
      type: 'number',
      unit: 'SF',
      defaultValue: 500,
      min: 50,
      max: 10000,
      step: 50,
    },
    {
      id: 'coats',
      label: 'Number of Coats',
      type: 'select',
      options: [
        { value: '1', label: '1 Coat', costMultiplier: 0.7 },
        { value: '2', label: '2 Coats', costMultiplier: 1 },
        { value: '3', label: '3 Coats', costMultiplier: 1.3 },
      ],
      defaultValue: '2',
    },
    {
      id: 'quality',
      label: 'Paint Quality',
      type: 'select',
      options: [
        { value: 'builder', label: 'Builder Grade', costMultiplier: 1 },
        { value: 'mid', label: 'Mid-Grade', costMultiplier: 1.3 },
        { value: 'premium', label: 'Premium', costMultiplier: 1.8 },
      ],
      defaultValue: 'mid',
    },
  ],
  templates: [
    { description: 'Paint', division: '09', type: 'material', baseQuantity: 0.003, unit: 'GAL', baseUnitCost: 45, scaleBy: 'area', notes: '~350 SF per gallon' },
    { description: 'Primer', division: '09', type: 'material', baseQuantity: 0.002, unit: 'GAL', baseUnitCost: 35, scaleBy: 'area' },
    { description: 'Supplies (tape, drop cloths, etc.)', division: '09', type: 'material', baseQuantity: 1, unit: 'LS', baseUnitCost: 75 },
    { description: 'Painting labor (prep + paint)', division: '09', type: 'labor', baseQuantity: 0.015, unit: 'HR', baseUnitCost: 50, scaleBy: 'area' },
  ],
}

const cabinetsConfig: CategoryFormConfig = {
  category: 'cabinets',
  title: 'Cabinets',
  description: 'Kitchen, bath, and storage cabinets',
  baseDuration: 3,
  fields: [
    {
      id: 'cabinetScope',
      label: 'Scope',
      type: 'select',
      options: [
        { value: 'kitchen', label: 'Kitchen' },
        { value: 'bathroom', label: 'Bathroom Vanity' },
        { value: 'laundry', label: 'Laundry Room' },
        { value: 'closet', label: 'Closet System' },
      ],
    },
    {
      id: 'length',
      label: 'Cabinet Run',
      type: 'number',
      unit: 'LF',
      defaultValue: 15,
      min: 2,
      max: 50,
      step: 1,
    },
    {
      id: 'grade',
      label: 'Cabinet Grade',
      type: 'select',
      options: [
        { value: 'stock', label: 'Stock', costMultiplier: 1 },
        { value: 'semi-custom', label: 'Semi-Custom', costMultiplier: 1.8 },
        { value: 'custom', label: 'Custom', costMultiplier: 3 },
      ],
      defaultValue: 'stock',
    },
    {
      id: 'countertop',
      label: 'Include Countertop',
      type: 'toggle',
      defaultValue: true,
    },
  ],
  templates: [
    { description: 'Cabinets (base + wall)', division: '06', type: 'material', baseQuantity: 1, unit: 'LF', baseUnitCost: 200, scaleBy: 'length' },
    { description: 'Cabinet hardware', division: '06', type: 'material', baseQuantity: 2, unit: 'EA', baseUnitCost: 8, scaleBy: 'length' },
    { description: 'Countertop (laminate)', division: '06', type: 'material', baseQuantity: 1, unit: 'LF', baseUnitCost: 45, scaleBy: 'length', includeWhen: { field: 'countertop', value: true } },
    { description: 'Cabinet installation labor', division: '06', type: 'labor', baseQuantity: 1, unit: 'HR', baseUnitCost: 65, scaleBy: 'length' },
  ],
}

const fixturesConfig: CategoryFormConfig = {
  category: 'fixtures',
  title: 'Fixtures',
  description: 'Plumbing and lighting fixtures',
  baseDuration: 2,
  fields: [
    {
      id: 'fixtureType',
      label: 'Fixture Area',
      type: 'select',
      options: [
        { value: 'bathroom', label: 'Bathroom Fixtures' },
        { value: 'kitchen', label: 'Kitchen Fixtures' },
        { value: 'lighting', label: 'Light Fixtures' },
        { value: 'mixed', label: 'Mixed / Whole House' },
      ],
    },
    {
      id: 'count',
      label: 'Number of Fixtures',
      type: 'number',
      defaultValue: 5,
      min: 1,
      max: 30,
      step: 1,
    },
    {
      id: 'quality',
      label: 'Fixture Quality',
      type: 'select',
      options: [
        { value: 'builder', label: 'Builder Grade', costMultiplier: 1 },
        { value: 'mid', label: 'Mid-Range', costMultiplier: 1.8 },
        { value: 'high', label: 'High-End', costMultiplier: 3 },
      ],
      defaultValue: 'mid',
    },
  ],
  templates: [
    { description: 'Fixtures (avg per unit)', division: '22', type: 'material', baseQuantity: 1, unit: 'EA', baseUnitCost: 150, scaleBy: 'count' },
    { description: 'Fixture trim & accessories', division: '22', type: 'material', baseQuantity: 1, unit: 'EA', baseUnitCost: 25, scaleBy: 'count' },
    { description: 'Fixture installation labor', division: '22', type: 'labor', baseQuantity: 1.5, unit: 'HR', baseUnitCost: 75, scaleBy: 'count' },
  ],
}

const exteriorConfig: CategoryFormConfig = {
  category: 'exterior',
  title: 'Exterior',
  description: 'Siding, windows, and exterior doors',
  baseDuration: 5,
  durationScaleField: 'area',
  durationScaleFactor: 0.004,
  fields: [
    {
      id: 'exteriorType',
      label: 'Exterior Work',
      type: 'select',
      options: [
        { value: 'siding', label: 'Siding' },
        { value: 'windows', label: 'Windows' },
        { value: 'doors', label: 'Exterior Doors' },
        { value: 'combo', label: 'Siding + Windows' },
      ],
    },
    {
      id: 'area',
      label: 'Area / Count',
      type: 'number',
      unit: 'SF or EA',
      defaultValue: 500,
      min: 1,
      max: 5000,
      step: 25,
    },
    {
      id: 'sidingMaterial',
      label: 'Siding Material',
      type: 'select',
      options: [
        { value: 'vinyl', label: 'Vinyl', costMultiplier: 1 },
        { value: 'fiber-cement', label: 'Fiber Cement (Hardie)', costMultiplier: 1.6 },
        { value: 'wood', label: 'Wood', costMultiplier: 2 },
      ],
      defaultValue: 'vinyl',
      showWhen: { field: 'exteriorType', value: 'siding' },
    },
  ],
  templates: [
    { description: 'Exterior material', division: '07', type: 'material', baseQuantity: 1, unit: 'SF', baseUnitCost: 4.50, scaleBy: 'area' },
    { description: 'Trim & flashing', division: '07', type: 'material', baseQuantity: 0.15, unit: 'LF', baseUnitCost: 5, scaleBy: 'area' },
    { description: 'Housewrap / WRB', division: '07', type: 'material', baseQuantity: 1, unit: 'SF', baseUnitCost: 0.25, scaleBy: 'area' },
    { description: 'Exterior labor', division: '07', type: 'labor', baseQuantity: 0.03, unit: 'HR', baseUnitCost: 60, scaleBy: 'area' },
  ],
}

const landscapingConfig: CategoryFormConfig = {
  category: 'landscaping',
  title: 'Landscaping',
  description: 'Outdoor and landscape improvements',
  baseDuration: 3,
  durationScaleField: 'area',
  durationScaleFactor: 0.002,
  fields: [
    {
      id: 'landscapeType',
      label: 'Scope',
      type: 'select',
      options: [
        { value: 'softscape', label: 'Softscape (plants, sod)' },
        { value: 'hardscape', label: 'Hardscape (patio, walkway)' },
        { value: 'fence', label: 'Fencing' },
        { value: 'irrigation', label: 'Irrigation System' },
      ],
    },
    {
      id: 'area',
      label: 'Area / Length',
      type: 'number',
      unit: 'SF or LF',
      defaultValue: 500,
      min: 25,
      max: 10000,
      step: 25,
    },
  ],
  templates: [
    { description: 'Landscape materials', division: '32', type: 'material', baseQuantity: 1, unit: 'SF', baseUnitCost: 3.50, scaleBy: 'area', variantField: 'landscapeType', variantCosts: { 'softscape': 3.50, 'hardscape': 8.00, 'fence': 12.00, 'irrigation': 2.00 } },
    { description: 'Soil / gravel / base', division: '32', type: 'material', baseQuantity: 0.05, unit: 'CY', baseUnitCost: 45, scaleBy: 'area' },
    { description: 'Landscape labor', division: '32', type: 'labor', baseQuantity: 0.02, unit: 'HR', baseUnitCost: 50, scaleBy: 'area' },
  ],
}

const cleanupConfig: CategoryFormConfig = {
  category: 'cleanup',
  title: 'Cleanup',
  description: 'Final cleaning and debris removal',
  baseDuration: 1,
  durationScaleField: 'area',
  durationScaleFactor: 0.001,
  fields: [
    {
      id: 'cleanupType',
      label: 'Cleanup Type',
      type: 'select',
      options: [
        { value: 'rough', label: 'Rough Clean (mid-project)' },
        { value: 'final', label: 'Final Clean (turnover)' },
        { value: 'post-construction', label: 'Post-Construction Deep Clean' },
      ],
      defaultValue: 'final',
    },
    {
      id: 'area',
      label: 'Area',
      type: 'number',
      unit: 'SF',
      defaultValue: 1500,
      min: 100,
      max: 10000,
      step: 100,
    },
  ],
  templates: [
    { description: 'Cleaning labor', division: '01', type: 'labor', baseQuantity: 0.01, unit: 'HR', baseUnitCost: 40, scaleBy: 'area', variantField: 'cleanupType', variantCosts: { 'rough': 35, 'final': 40, 'post-construction': 50 } },
    { description: 'Cleaning supplies', division: '01', type: 'material', baseQuantity: 1, unit: 'LS', baseUnitCost: 75, variantField: 'cleanupType', variantCosts: { 'rough': 50, 'final': 75, 'post-construction': 150 } },
    { description: 'Dumpster / debris hauling', division: '01', type: 'equipment', baseQuantity: 1, unit: 'EA', baseUnitCost: 350, includeWhen: { field: 'cleanupType', value: 'rough' } },
  ],
}

const customConfig: CategoryFormConfig = {
  category: 'custom',
  title: 'Custom',
  description: 'Build a custom assembly from scratch',
  baseDuration: 1,
  fields: [
    {
      id: 'itemCount',
      label: 'Number of Line Items',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 20,
      step: 1,
      helpText: 'You can edit items after creation',
    },
  ],
  templates: [
    { description: 'Custom item 1', division: '01', type: 'material', baseQuantity: 1, unit: 'EA', baseUnitCost: 0, notes: 'Edit after creation' },
  ],
}

// ============================================
// Export all configs as a lookup map
// ============================================

export const ASSEMBLY_FORM_CONFIGS: Record<AssemblyCategory, CategoryFormConfig> = {
  demolition: demolitionConfig,
  sitework: siteworkConfig,
  concrete: concreteConfig,
  framing: framingConfig,
  roofing: roofingConfig,
  plumbing: plumbingConfig,
  electrical: electricalConfig,
  hvac: hvacConfig,
  insulation: insulationConfig,
  drywall: drywallConfig,
  flooring: flooringConfig,
  painting: paintingConfig,
  cabinets: cabinetsConfig,
  fixtures: fixturesConfig,
  exterior: exteriorConfig,
  landscaping: landscapingConfig,
  cleanup: cleanupConfig,
  custom: customConfig,
}

export function getFormConfig(category: AssemblyCategory): CategoryFormConfig {
  return ASSEMBLY_FORM_CONFIGS[category]
}
