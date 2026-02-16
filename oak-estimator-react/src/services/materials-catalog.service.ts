/**
 * Materials Catalog Service
 * Manages custom materials, price overrides, and catalog versioning
 */

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  getDoc,
  setDoc,
} from 'firebase/firestore'
import { db } from '@/services/firebase'
import type { CustomMaterial, PriceOverride, CatalogMeta, SharedAssembly } from '@/types'
import { MaterialsDatabase } from '@/data/materials-database'

// ============================================
// Custom Materials CRUD
// ============================================

export async function getUserCustomMaterials(userId: string): Promise<CustomMaterial[]> {
  const q = query(
    collection(db, 'customMaterials'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CustomMaterial))
}

export async function createCustomMaterial(
  material: Omit<CustomMaterial, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = Date.now()
  const docRef = await addDoc(collection(db, 'customMaterials'), {
    ...material,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  })
  return docRef.id
}

export async function updateCustomMaterial(
  materialId: string,
  updates: Partial<CustomMaterial>
): Promise<void> {
  await updateDoc(doc(db, 'customMaterials', materialId), {
    ...updates,
    updatedAt: Date.now(),
  })
}

export async function deleteCustomMaterial(materialId: string): Promise<void> {
  await deleteDoc(doc(db, 'customMaterials', materialId))
}

// ============================================
// Price Overrides
// ============================================

export async function getUserPriceOverrides(userId: string): Promise<PriceOverride[]> {
  const q = query(
    collection(db, 'priceOverrides'),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PriceOverride))
}

export async function createPriceOverride(
  override: Omit<PriceOverride, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = Date.now()
  const docRef = await addDoc(collection(db, 'priceOverrides'), {
    ...override,
    createdAt: now,
    updatedAt: now,
  })
  return docRef.id
}

export async function updatePriceOverride(
  overrideId: string,
  updates: Partial<PriceOverride>
): Promise<void> {
  await updateDoc(doc(db, 'priceOverrides', overrideId), {
    ...updates,
    updatedAt: Date.now(),
  })
}

export async function deletePriceOverride(overrideId: string): Promise<void> {
  await deleteDoc(doc(db, 'priceOverrides', overrideId))
}

// ============================================
// Catalog Metadata & Version Tracking
// ============================================

export function getCurrentCatalogVersion(): {
  version: string
  lastUpdated: string
  totalItems: number
} {
  return {
    version: MaterialsDatabase.version,
    lastUpdated: MaterialsDatabase.lastUpdated,
    totalItems: MaterialsDatabase.totalItems,
  }
}

export async function getUserCatalogMeta(userId: string): Promise<CatalogMeta | null> {
  const docRef = doc(db, 'catalogMeta', userId)
  const snapshot = await getDoc(docRef)
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as CatalogMeta
  }
  return null
}

export async function updateCatalogMeta(
  userId: string,
  updates: Partial<CatalogMeta>
): Promise<void> {
  const docRef = doc(db, 'catalogMeta', userId)
  await setDoc(docRef, {
    userId,
    ...updates,
    lastUpdated: Date.now(),
  }, { merge: true })
}

/**
 * Check if the static database has been updated since the user last checked
 */
export async function checkForCatalogUpdates(userId: string): Promise<{
  hasUpdates: boolean
  currentVersion: string
  userVersion: string | null
  newItemsCount: number
}> {
  const meta = await getUserCatalogMeta(userId)
  const current = getCurrentCatalogVersion()

  const hasUpdates = !meta || meta.currentVersion !== current.version

  // Update the last checked timestamp
  await updateCatalogMeta(userId, {
    lastChecked: Date.now(),
  })

  return {
    hasUpdates,
    currentVersion: current.version,
    userVersion: meta?.currentVersion || null,
    newItemsCount: hasUpdates ? current.totalItems : 0,
  }
}

/**
 * Mark the user as up to date with the current catalog version
 */
export async function acknowledgeCatalogUpdate(userId: string): Promise<void> {
  const current = getCurrentCatalogVersion()
  await updateCatalogMeta(userId, {
    currentVersion: current.version,
    lastChecked: Date.now(),
  })
}

// ============================================
// Shared / Community Assemblies
// ============================================

export async function getSharedAssemblies(): Promise<SharedAssembly[]> {
  const q = query(
    collection(db, 'sharedAssemblies'),
    orderBy('usageCount', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SharedAssembly))
}

export async function publishAssemblyToShared(
  assembly: Omit<SharedAssembly, 'id' | 'usageCount' | 'rating' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const now = Date.now()
  const docRef = await addDoc(collection(db, 'sharedAssemblies'), {
    ...assembly,
    usageCount: 0,
    rating: 0,
    createdAt: now,
    updatedAt: now,
  })
  return docRef.id
}

export async function incrementAssemblyUsage(assemblyId: string): Promise<void> {
  const docRef = doc(db, 'sharedAssemblies', assemblyId)
  const snapshot = await getDoc(docRef)
  if (snapshot.exists()) {
    const data = snapshot.data()
    await updateDoc(docRef, { usageCount: (data.usageCount || 0) + 1 })
  }
}

// ============================================
// Utility: Merge static + custom materials
// ============================================

export interface MergedMaterial {
  id: string
  division: string
  divisionName: string
  category: string
  description: string
  unit: string
  materialCost: number
  laborCost: number
  equipmentCost: number
  unitCost: number
  notes?: string
  source: 'static' | 'custom' | 'override'
  originalCost?: number  // original cost before override
}

/**
 * Get all materials merged: static database + custom materials + price overrides
 */
export function getMergedMaterials(
  customMaterials: CustomMaterial[],
  priceOverrides: PriceOverride[]
): MergedMaterial[] {
  const overrideMap = new Map<string, PriceOverride>()
  for (const override of priceOverrides) {
    overrideMap.set(override.materialId, override)
  }

  const merged: MergedMaterial[] = []

  // Add static materials (with overrides applied)
  const divisions = Object.keys(MaterialsDatabase).filter(
    k => !['version', 'lastUpdated', 'currency', 'totalItems', 'buildDate'].includes(k)
  )

  for (const divCode of divisions) {
    const division = (MaterialsDatabase as any)[divCode]
    if (!division || !division.items) continue

    for (const item of division.items) {
      const override = overrideMap.get(item.id)
      const materialCost = override?.materialCost ?? item.material
      const laborCost = override?.laborCost ?? item.labor
      const equipmentCost = override?.equipmentCost ?? item.equipment
      const unitCost = materialCost + laborCost + equipmentCost

      merged.push({
        id: item.id,
        division: divCode,
        divisionName: division.name,
        category: item.category,
        description: item.description,
        unit: item.unit,
        materialCost,
        laborCost,
        equipmentCost,
        unitCost,
        notes: override?.notes || item.notes,
        source: override ? 'override' : 'static',
        originalCost: override
          ? item.material + item.labor + item.equipment
          : undefined,
      })
    }
  }

  // Add custom materials
  for (const custom of customMaterials) {
    if (!custom.isActive) continue
    const unitCost = custom.materialCost + custom.laborCost + custom.equipmentCost

    merged.push({
      id: custom.id,
      division: custom.division,
      divisionName: '',  // will be filled by caller if needed
      category: custom.category,
      description: custom.description,
      unit: custom.unit,
      materialCost: custom.materialCost,
      laborCost: custom.laborCost,
      equipmentCost: custom.equipmentCost,
      unitCost,
      notes: custom.notes,
      source: 'custom',
    })
  }

  return merged
}
