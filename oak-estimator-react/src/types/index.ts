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
}

export interface ProjectSettings {
  projectName: string
  projectNumber: string
  location: string
  architect: string
  estimator: string
  date: string
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

export interface Project {
  id: string
  userId: string
  companySettings: CompanySettings
  projectSettings: ProjectSettings
  lineItems: LineItem[]
  createdAt: number
  updatedAt: number
  lastSyncedAt?: number
  trashedAt?: number  // Timestamp when moved to trash
  deletedAt?: number  // Timestamp when permanently deleted (30 days after trashedAt)
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
