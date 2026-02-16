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

// ============================================
// FEATURE 1: Dashboard Analytics Types
// ============================================

export interface DashboardStats {
  totalProjects: number
  activeProjects: number
  totalPipelineValue: number
  avgProjectValue: number
  projectsByStatus: Record<string, number>
  projectsByMonth: { month: string; count: number; value: number }[]
  costsByDivision: { division: string; cost: number }[]
  recentActivity: ActivityItem[]
}

export interface ActivityItem {
  id: string
  type: 'project_created' | 'project_updated' | 'project_sent' | 'project_approved' | 'project_rejected'
  projectId: string
  projectName: string
  timestamp: number
  details?: string
}

// ============================================
// FEATURE 2: Assembly/Kit Items Types
// ============================================

export interface Assembly {
  id: string
  userId: string
  name: string
  description?: string
  category?: string
  items: AssemblyItem[]
  totalCost: number
  createdAt: number
  updatedAt: number
}

export interface AssemblyItem {
  description: string
  division: string
  type: LineItem['type']
  quantity: number
  unit: string
  unitCost: number
  notes?: string
}

// ============================================
// FEATURE 3: Change Order Management Types
// ============================================

export interface ChangeOrder {
  id: string
  projectId: string
  userId: string
  changeOrderNumber: number
  title: string
  description: string
  reason: 'scope_change' | 'client_request' | 'unforeseen_conditions' | 'design_change' | 'other'
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  addedItems: Omit<LineItem, 'id' | 'createdAt' | 'updatedAt' | 'order'>[]
  removedItemIds: string[]
  modifiedItems: { itemId: string; changes: Partial<LineItem> }[]
  originalTotal: number
  newTotal: number
  netChange: number
  approvedBy?: string
  approvedAt?: number
  createdAt: number
  updatedAt: number
}

// ============================================
// FEATURE 5: Import/Export Types
// ============================================

export interface ImportMapping {
  division?: string
  description: string
  type?: string
  quantity: string
  unit: string
  unitCost: string
  notes?: string
}

export interface ImportResult {
  success: number
  failed: number
  errors: { row: number; message: string }[]
  items: Omit<LineItem, 'id' | 'createdAt' | 'updatedAt' | 'order'>[]
}

// ============================================
// FEATURE 6: Client Portal Types
// ============================================

export interface SharedProject {
  id: string
  projectId: string
  userId: string
  shareToken: string
  expiresAt?: number
  allowComments: boolean
  showUnitCosts: boolean
  showMarkup: boolean
  password?: string
  viewCount: number
  lastViewedAt?: number
  createdAt: number
}

export interface ClientComment {
  id: string
  sharedProjectId: string
  lineItemId?: string
  content: string
  authorName: string
  authorEmail?: string
  createdAt: number
  resolved?: boolean
  resolvedAt?: number
}

// ============================================
// FEATURE 7: Keyboard Shortcuts Types
// ============================================

export interface KeyboardShortcut {
  key: string
  modifiers: ('ctrl' | 'alt' | 'shift' | 'meta')[]
  action: string
  description: string
  category: 'navigation' | 'editing' | 'actions' | 'global'
}

// ============================================
// FEATURE 8: Attachments Types
// ============================================

export interface Attachment {
  id: string
  projectId: string
  userId: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
  lineItemId?: string
  description?: string
  createdAt: number
}

// ============================================
// FEATURE 9: Labor Rate Management Types
// ============================================

export interface LaborRate {
  id: string
  userId: string
  tradeName: string
  tradeCode: string
  description?: string
  hourlyRate: number
  overtimeMultiplier: number
  benefitsRate?: number
  burdenRate?: number
  effectiveRate: number
  isDefault?: boolean
  createdAt: number
  updatedAt: number
}

export interface LaborCategory {
  code: string
  name: string
  defaultRate: number
}

// ============================================
// FEATURE 10: Profit Margin Types
// ============================================

export interface ProfitAnalysis {
  totalRevenue: number
  totalCost: number
  grossProfit: number
  grossMarginPercentage: number
  byDivision: DivisionProfit[]
  byType: TypeProfit[]
  recommendations: string[]
}

export interface DivisionProfit {
  division: string
  divisionName: string
  cost: number
  revenue: number
  profit: number
  marginPercentage: number
}

export interface TypeProfit {
  type: LineItem['type']
  cost: number
  revenue: number
  profit: number
  marginPercentage: number
}

// ============================================
// FEATURE 11: Updatable Materials Catalog
// ============================================

/** A user-defined custom material stored in Firestore */
export interface CustomMaterial {
  id: string
  userId: string
  division: string
  category: string
  description: string
  unit: string
  materialCost: number
  laborCost: number
  equipmentCost: number
  notes?: string
  tags?: string[]
  source?: string  // where it came from (manual, supplier, etc.)
  isActive: boolean
  createdAt: number
  updatedAt: number
}

/** A price override for an existing static material */
export interface PriceOverride {
  id: string
  userId: string
  materialId: string  // reference to static MaterialsDatabase item
  materialCost?: number
  laborCost?: number
  equipmentCost?: number
  notes?: string
  effectiveDate: number
  createdAt: number
  updatedAt: number
}

/** Catalog metadata for tracking database version */
export interface CatalogMeta {
  id: string
  userId: string
  currentVersion: string
  lastChecked: number
  customMaterialsCount: number
  priceOverridesCount: number
  lastUpdated: number
}

/** Shared assembly published to community */
export interface SharedAssembly {
  id: string
  publishedBy: string
  publisherName: string
  name: string
  description: string
  category: string
  items: AssemblyItem[]
  totalCost: number
  usageCount: number
  rating: number
  tags: string[]
  createdAt: number
  updatedAt: number
}

