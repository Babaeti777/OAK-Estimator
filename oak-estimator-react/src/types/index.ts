/**
 * Core types for the OAK Estimator application
 */

export interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export interface CompanySettings {
  companyName: string
  address: string
  phone: string
  email: string
  logoUrl?: string
  // Extended branding
  website?: string
  licenseNumber?: string
  certifications?: string[]
  termsAndConditions?: string
  warrantyInfo?: string
  signatureUrl?: string
}

export interface ProjectSettings {
  projectName: string
  projectNumber: string
  location: string
  architect: string
  estimator: string
  date: string
  // From main branch
  inclusions: string
  exclusions: string
  terms: string
  // Extended fields
  clientName?: string
  clientEmail?: string
  clientPhone?: string
  clientAddress?: string
  scope?: string
  notes?: string
  validUntil?: string
  // Configurable rates per project
  markupPercentage?: number  // Defaults to 15 if not set
  taxPercentage?: number     // Defaults to 7 if not set
}

export interface LineItem {
  id: string
  division: string
  description: string
  type: 'material' | 'labor' | 'equipment' | 'subcontractor' | 'misc'
  quantity: number
  unit: string
  unitCost: number
  totalCost: number
  schedule?: string
  notes?: string
  materialId?: string
  order: number
  createdAt: number
  updatedAt: number
}

export interface Material {
  id: string
  division: string
  divisionName: string
  category: string
  description: string
  unit: string
  unitCost: number
  notes?: string
  tags?: string[]
}

// Project folder/category
export interface ProjectFolder {
  id: string
  userId: string
  name: string
  color?: string
  icon?: string
  order: number
  createdAt: number
}

// Project version for history tracking
export interface ProjectVersion {
  id: string
  projectId: string
  versionNumber: number
  name: string
  snapshot: Omit<Project, 'id' | 'userId'>
  createdAt: number
  createdBy?: string
  notes?: string
}

// Line item template
export interface LineItemTemplate {
  id: string
  userId: string
  name: string
  description?: string
  category?: string
  items: Omit<LineItem, 'id' | 'createdAt' | 'updatedAt' | 'order'>[]
  createdAt: number
  updatedAt: number
}

// User preferences
export interface UserPreferences {
  accentColor?: string  // Hex color for branding
  defaultMarkupPercentage?: number
  defaultTaxPercentage?: number
  quickAddEnabled?: boolean
  compactView?: boolean
}

export interface Project {
  id: string
  userId: string
  companySettings: CompanySettings
  projectSettings: ProjectSettings
  lineItems: LineItem[]
  createdAt: number
  updatedAt: number
  lastSyncedAt?: number
  trashedAt?: number
  deletedAt?: number
  // New fields
  folderId?: string  // Reference to ProjectFolder
  tags?: string[]
  status?: 'draft' | 'sent' | 'approved' | 'rejected' | 'completed'
  versionNumber?: number
}

export interface Summary {
  materialsCost: number
  laborCost: number
  equipmentCost: number
  subcontractorCost: number
  miscCost: number
  subtotal: number
  markup: number
  markupPercentage: number
  tax: number
  taxPercentage: number
  totalCost: number
}

export interface FilterOptions {
  searchTerm: string
  divisions: string[]
  types: LineItem['type'][]
}

export interface MaterialFilterOptions {
  searchTerm: string
  division?: string
  category?: string
}

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error'

export interface AppState {
  user: User | null
  currentProject: Project | null
  projects: Project[]
  syncStatus: SyncStatus
  isLoading: boolean
  error: string | null
}

// Export types for PDF/Excel generation
export interface ExportOptions {
  includeCompanyLogo: boolean
  includeTerms: boolean
  includeSignatureLine: boolean
  includeNotes: boolean
  groupByDivision: boolean
  showUnitCosts: boolean
  showLineItemNotes: boolean
}
