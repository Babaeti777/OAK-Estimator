# Assembly Scheduling System - Design Document

**Version:** 1.0 MVP
**Date:** February 17, 2026

---

## Overview

Transform the assembly system from simple templates into a smart scheduling system that:
1. Provides a default library of construction assemblies
2. Allows team/company sharing of custom assemblies
3. Schedules work based on durations and dependencies
4. Enables fast project creation through category browsing and search

---

## MVP Scope

### Included in MVP
- Editable assemblies (fix current gap)
- Default assembly library (~50 common assemblies)
- Category-based browsing
- Search functionality
- Recent assemblies tracking
- Duration field on assemblies
- Basic dependency selection
- Simple timeline/schedule view

### Deferred to Phase 2
- Full team/company sharing (use existing sharing infrastructure)
- Complex dependency resolution (critical path)
- Gantt chart visualization
- Bulk add with conflict detection
- Assembly versioning

---

## Data Model Changes

### Enhanced Assembly Type

```typescript
export interface Assembly {
  id: string
  userId: string

  // Basic info
  name: string
  description?: string
  category: AssemblyCategory
  tags?: string[]

  // Items
  items: AssemblyItem[]
  totalCost: number

  // Scheduling
  estimatedDuration: number        // Duration in days
  durationUnit: 'hours' | 'days' | 'weeks'
  dependencies?: string[]          // Array of assembly IDs that must complete first
  phase?: ProjectPhase             // Which phase this belongs to

  // Metadata
  isDefault: boolean               // System-provided vs user-created
  isShared: boolean                // Shared with team
  usageCount: number               // Track popularity
  lastUsedAt?: number              // For "recent" sorting

  createdAt: number
  updatedAt: number
}

export type AssemblyCategory =
  | 'demolition'
  | 'sitework'
  | 'concrete'
  | 'framing'
  | 'roofing'
  | 'plumbing'
  | 'electrical'
  | 'hvac'
  | 'insulation'
  | 'drywall'
  | 'flooring'
  | 'painting'
  | 'cabinets'
  | 'fixtures'
  | 'exterior'
  | 'landscaping'
  | 'cleanup'
  | 'custom'

export type ProjectPhase =
  | 'pre-construction'
  | 'rough-in'
  | 'mechanical'
  | 'insulation-drywall'
  | 'finishes'
  | 'fixtures'
  | 'final'

export interface AssemblyItem {
  id: string                       // Add ID for editing
  description: string
  division: string
  type: LineItem['type']
  quantity: number
  unit: string
  unitCost: number
  notes?: string
  laborHours?: number              // Optional labor tracking
}
```

### Project Schedule Type

```typescript
export interface ProjectSchedule {
  projectId: string
  startDate: number                // Project start date
  assemblies: ScheduledAssembly[]
  totalDuration: number            // Calculated total days
}

export interface ScheduledAssembly {
  assemblyId: string
  assemblyName: string
  startDay: number                 // Relative to project start
  duration: number
  dependencies: string[]
  status: 'pending' | 'in-progress' | 'completed'
}
```

---

## Default Assembly Library

### Categories and Sample Assemblies

```
demolition/
├── Kitchen Demo (2-3 days)
├── Bathroom Demo (1-2 days)
├── Wall Removal (0.5-1 day)
└── Flooring Removal (1 day per 500 sqft)

sitework/
├── Excavation (varies)
├── Grading (1-2 days)
└── Utilities Trenching (1-3 days)

concrete/
├── Foundation Footings (3-5 days)
├── Slab on Grade (2-3 days)
├── Concrete Patio (2 days)
└── Sidewalk/Driveway (1-2 days)

framing/
├── Wall Framing - Interior (2-4 days)
├── Wall Framing - Exterior (3-5 days)
├── Ceiling/Roof Framing (3-5 days)
└── Deck Framing (2-3 days)

roofing/
├── Asphalt Shingle Roof (2-4 days)
├── Metal Roof (3-5 days)
├── Flat Roof/TPO (2-3 days)
└── Roof Repair (0.5-1 day)

plumbing/
├── Bathroom Rough-In (1-2 days)
├── Kitchen Rough-In (1 day)
├── Water Heater Install (0.5 day)
├── Fixture Installation (1 day)
└── Sewer/Drain Line (2-3 days)

electrical/
├── Panel Upgrade (1 day)
├── Rough-In Wiring (2-4 days)
├── Outlet/Switch Install (1 day)
├── Lighting Installation (1-2 days)
└── EV Charger Install (0.5 day)

hvac/
├── Furnace Install (1 day)
├── AC Install (1 day)
├── Ductwork (2-4 days)
├── Mini-Split System (1-2 days)
└── Ventilation/Exhaust (0.5-1 day)

insulation/
├── Batt Insulation (1-2 days)
├── Blown-In Insulation (1 day)
├── Spray Foam (1-2 days)
└── Vapor Barrier (0.5 day)

drywall/
├── Drywall Hanging (2-4 days)
├── Drywall Taping/Finishing (3-5 days)
├── Ceiling Texture (1 day)
└── Wall Texture (1 day)

flooring/
├── Hardwood Install (2-4 days)
├── LVP/Laminate Install (1-2 days)
├── Tile Floor (2-4 days)
├── Carpet Install (1 day)
└── Floor Prep/Leveling (1 day)

painting/
├── Interior Paint - Room (1 day)
├── Interior Paint - Whole House (3-5 days)
├── Exterior Paint (3-5 days)
├── Cabinet Painting (2-3 days)
└── Staining/Finishing (1-2 days)

cabinets/
├── Kitchen Cabinets (2-3 days)
├── Bathroom Vanity (0.5 day)
├── Closet System (1 day)
└── Pantry/Storage (1 day)

fixtures/
├── Bathroom Fixtures (1 day)
├── Kitchen Fixtures (0.5 day)
├── Light Fixtures (1 day)
├── Door Hardware (0.5 day)
└── Window Treatments (1 day)

exterior/
├── Siding Install (3-5 days)
├── Window Install (1-2 days)
├── Door Install (0.5 day each)
├── Gutter Install (1 day)
└── Deck/Porch (3-5 days)

landscaping/
├── Basic Landscaping (2-3 days)
├── Irrigation System (2-3 days)
├── Fence Install (2-3 days)
├── Patio/Hardscape (3-5 days)
└── Sod/Seeding (1-2 days)

cleanup/
├── Construction Cleanup (1 day)
├── Final Clean (1 day)
└── Debris Removal (0.5 day)
```

---

## Dependency Graph

### Standard Construction Dependencies

```
Pre-Construction
└── Demolition
    └── Sitework
        └── Concrete/Foundation
            └── Framing
                ├── Roofing
                └── Rough-Ins (parallel)
                    ├── Plumbing Rough
                    ├── Electrical Rough
                    └── HVAC Rough
                        └── Inspection
                            └── Insulation
                                └── Drywall
                                    └── Finishes (parallel)
                                        ├── Flooring
                                        ├── Painting
                                        └── Cabinets
                                            └── Fixtures
                                                └── Final Inspection
                                                    └── Cleanup
```

### Dependency Rules for MVP

```typescript
const DEPENDENCY_RULES: Record<AssemblyCategory, AssemblyCategory[]> = {
  demolition: [],
  sitework: ['demolition'],
  concrete: ['sitework', 'demolition'],
  framing: ['concrete'],
  roofing: ['framing'],
  plumbing: ['framing'],           // Rough-in after framing
  electrical: ['framing'],
  hvac: ['framing'],
  insulation: ['plumbing', 'electrical', 'hvac'],  // After rough-ins
  drywall: ['insulation'],
  flooring: ['drywall'],
  painting: ['drywall'],
  cabinets: ['drywall'],
  fixtures: ['flooring', 'painting', 'cabinets'],
  exterior: ['framing', 'roofing'],
  landscaping: ['exterior'],
  cleanup: ['fixtures', 'landscaping'],
  custom: [],                      // No automatic dependencies
}
```

---

## UI Components

### 1. AssemblyLibrary (New)

```
┌─────────────────────────────────────────────────────────────┐
│  Assembly Library                                     [X]   │
├─────────────────────────────────────────────────────────────┤
│  [🔍 Search assemblies...]                                  │
│                                                             │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────┐       │
│  │ Recent  │ All     │ Default │ My      │ Shared  │       │
│  └─────────┴─────────┴─────────┴─────────┴─────────┘       │
│                                                             │
│  Categories:                                                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ 🔨 Demo     │ │ 🧱 Concrete │ │ 🪵 Framing  │           │
│  │ 4 items    │ │ 4 items    │ │ 4 items    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│  │ 🚿 Plumbing │ │ ⚡ Electric │ │ 🌡️ HVAC     │           │
│  │ 5 items    │ │ 5 items    │ │ 5 items    │           │
│  └─────────────┘ └─────────────┘ └─────────────┘           │
│  ... more categories ...                                    │
│                                                             │
│  ═══════════════════════════════════════════════════════   │
│  Selected (3):                              [Add to Project]│
│  • Bathroom Rough-In (1-2 days)                            │
│  • Bathroom Drywall (2 days)                               │
│  • Bathroom Fixtures (1 day)                               │
│                                                             │
│  Total Duration: 4-5 days | Est. Cost: $4,250              │
└─────────────────────────────────────────────────────────────┘
```

### 2. AssemblyEditor (New)

```
┌─────────────────────────────────────────────────────────────┐
│  Edit Assembly: Bathroom Rough-In                     [X]   │
├─────────────────────────────────────────────────────────────┤
│  Name: [Bathroom Rough-In                           ]       │
│  Category: [Plumbing ▼]  Duration: [1.5] [days ▼]          │
│  Phase: [Rough-In ▼]                                        │
│  Tags: [bathroom] [plumbing] [rough-in] [+]                │
│                                                             │
│  Dependencies:                                              │
│  [Framing must complete first ▼]                           │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  Items:                                    [+ Add Item]     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ☰ │ 2" PVC Drain Pipe      │ 20 LF  │ $2.50 │ $50  │[×]│
│  │ ☰ │ 3" PVC Drain Pipe      │ 15 LF  │ $4.00 │ $60  │[×]│
│  │ ☰ │ 1/2" Copper Supply     │ 30 LF  │ $3.50 │$105  │[×]│
│  │ ☰ │ Plumber Labor          │ 12 HR  │$85.00 │$1020 │[×]│
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Total: $1,235                                              │
│                                                             │
│  [Cancel]                              [Save] [Save as New] │
└─────────────────────────────────────────────────────────────┘
```

### 3. ProjectSchedule (New)

```
┌─────────────────────────────────────────────────────────────┐
│  Project Schedule                                     [X]   │
├─────────────────────────────────────────────────────────────┤
│  Start Date: [Mar 15, 2026 📅]     Total: 18 working days   │
│                                                             │
│  Phase: Rough-In                                            │
│  ├─ Day 1-2   │████████░░░░░░│ Framing           (2 days)  │
│  ├─ Day 3-4   │░░░░████████░░│ Plumbing Rough    (2 days)  │
│  ├─ Day 3-4   │░░░░████████░░│ Electrical Rough  (2 days)  │
│  └─ Day 5     │░░░░░░░░░░████│ HVAC Rough        (1 day)   │
│                                                             │
│  Phase: Insulation & Drywall                                │
│  ├─ Day 6     │████░░░░░░░░░░│ Insulation        (1 day)   │
│  └─ Day 7-10  │░░░░████████░░│ Drywall           (4 days)  │
│                                                             │
│  Phase: Finishes                                            │
│  ├─ Day 11-12 │████████░░░░░░│ Flooring          (2 days)  │
│  ├─ Day 11-13 │████████████░░│ Painting          (3 days)  │
│  ├─ Day 14-15 │░░░░░░████████│ Cabinets          (2 days)  │
│  └─ Day 16-17 │░░░░░░░░░░████│ Fixtures          (2 days)  │
│                                                             │
│  Phase: Final                                               │
│  └─ Day 18    │░░░░░░░░░░░░██│ Cleanup           (1 day)   │
│                                                             │
│  Est. Completion: April 9, 2026                             │
│                                                             │
│  [Export Schedule]              [Recalculate] [Save]        │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Plan

### Phase 1: Foundation (This PR)

1. **Update Types**
   - Add scheduling fields to Assembly interface
   - Add AssemblyCategory and ProjectPhase types
   - Add ProjectSchedule type

2. **Create Default Assemblies Data**
   - JSON file with ~50 default assemblies
   - Include items, durations, dependencies
   - Categorized properly

3. **Update AssemblyManager**
   - Add edit functionality
   - Add category filtering
   - Add search
   - Add duration/dependency fields

### Phase 2: Library & Quick Add

1. **Create AssemblyLibrary Component**
   - Category grid view
   - Search functionality
   - Recent assemblies section
   - Multi-select for bulk add

2. **Update Service Layer**
   - Default assemblies loading
   - Usage tracking
   - Recent assemblies query

### Phase 3: Scheduling

1. **Create ProjectSchedule Component**
   - Timeline visualization
   - Dependency resolution
   - Date calculations

2. **Update Project Context**
   - Schedule state management
   - Auto-calculate from assemblies

### Phase 4: Team Sharing

1. **Extend Sharing Infrastructure**
   - Assembly sharing permissions
   - Team/company assemblies collection
   - Import/fork assemblies

---

## File Structure

```
src/
├── components/
│   └── assemblies/
│       ├── AssemblyManager.tsx      # Updated
│       ├── AssemblyEditor.tsx       # New
│       ├── AssemblyLibrary.tsx      # New
│       ├── AssemblyCard.tsx         # New
│       ├── CategoryGrid.tsx         # New
│       └── ProjectSchedule.tsx      # New
├── data/
│   └── default-assemblies.ts        # New - default library
├── services/
│   └── assemblies.service.ts        # Updated
├── types/
│   └── index.ts                     # Updated
└── utils/
    └── schedule-calculator.ts       # New - dependency resolution
```

---

## Design Decisions (Confirmed)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Duration Type** | Calendar days | Simpler calculation, 7 days = 1 week |
| **Fork Defaults** | Yes, allow forking | Users can copy and customize default assemblies |
| **Dependency Enforcement** | Soft warnings | Show warning but allow adding out of order |
| **Sharing** | Both default + team | Default library AND team sharing capabilities |

---

## Success Metrics

- Reduce time to create a new project estimate by 50%
- Increase assembly reuse rate to 70%+ of line items
- Users can create a full bathroom remodel estimate in < 5 minutes
