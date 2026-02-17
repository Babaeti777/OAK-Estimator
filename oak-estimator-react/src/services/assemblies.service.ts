import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Assembly } from '@/types'
import { getErrorMessage } from '@/lib/utils'

const ASSEMBLIES_COLLECTION = 'assemblies'

/**
 * Get all assemblies for a user
 */
export async function getUserAssemblies(userId: string): Promise<Assembly[]> {
  try {
    const q = query(
      collection(db, ASSEMBLIES_COLLECTION),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Assembly))
  } catch (error: unknown) {
    console.error('Error getting assemblies:', error)
    throw new Error(getErrorMessage(error) || 'Failed to load assemblies')
  }
}

/**
 * Create a new assembly
 */
export async function createAssembly(
  assembly: Omit<Assembly, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const docRef = doc(collection(db, ASSEMBLIES_COLLECTION))
    const now = Date.now()

    // Calculate total cost
    const totalCost = assembly.items.reduce(
      (sum, item) => sum + item.quantity * item.unitCost,
      0
    )

    // Clean items to remove undefined values (Firestore doesn't accept undefined)
    const cleanItems = assembly.items.map(item => ({
      id: item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      description: item.description || '',
      division: item.division || '',
      type: item.type || 'material',
      quantity: item.quantity || 0,
      unit: item.unit || 'EA',
      unitCost: item.unitCost || 0,
      notes: item.notes || '',
      laborHours: item.laborHours || 0,
    }))

    // Build the document with all fields
    const assemblyDoc: Record<string, unknown> = {
      userId: assembly.userId,
      name: assembly.name || '',
      description: assembly.description || '',
      category: assembly.category || 'custom',
      items: cleanItems,
      totalCost,
      estimatedDuration: assembly.estimatedDuration || 1,
      durationUnit: assembly.durationUnit || 'days',
      phase: assembly.phase || 'finishes',
      isDefault: assembly.isDefault || false,
      isShared: assembly.isShared || false,
      usageCount: assembly.usageCount || 0,
      createdAt: now,
      updatedAt: now,
    }

    // Only add optional fields if they have values
    if (assembly.tags && assembly.tags.length > 0) {
      assemblyDoc.tags = assembly.tags
    }
    if (assembly.dependencies && assembly.dependencies.length > 0) {
      assemblyDoc.dependencies = assembly.dependencies
    }
    if (assembly.forkedFrom) {
      assemblyDoc.forkedFrom = assembly.forkedFrom
    }
    if (assembly.lastUsedAt) {
      assemblyDoc.lastUsedAt = assembly.lastUsedAt
    }

    await setDoc(docRef, assemblyDoc)

    return docRef.id
  } catch (error: unknown) {
    console.error('Error creating assembly:', error)
    throw new Error(getErrorMessage(error) || 'Failed to create assembly')
  }
}

/**
 * Update an assembly
 */
export async function updateAssembly(
  assemblyId: string,
  updates: Partial<Assembly>
): Promise<void> {
  try {
    const docRef = doc(db, ASSEMBLIES_COLLECTION, assemblyId)

    // Recalculate total cost if items changed
    let totalCost = updates.totalCost
    if (updates.items) {
      totalCost = updates.items.reduce(
        (sum, item) => sum + item.quantity * item.unitCost,
        0
      )
    }

    // Build clean update object without undefined values
    const cleanUpdates: Record<string, unknown> = {
      updatedAt: Date.now(),
    }

    // Basic fields
    if (updates.name !== undefined) cleanUpdates.name = updates.name
    if (updates.description !== undefined) cleanUpdates.description = updates.description
    if (totalCost !== undefined) cleanUpdates.totalCost = totalCost

    // Scheduling fields
    if (updates.category !== undefined) cleanUpdates.category = updates.category
    if (updates.estimatedDuration !== undefined) cleanUpdates.estimatedDuration = updates.estimatedDuration
    if (updates.durationUnit !== undefined) cleanUpdates.durationUnit = updates.durationUnit
    if (updates.phase !== undefined) cleanUpdates.phase = updates.phase
    if (updates.dependencies !== undefined) cleanUpdates.dependencies = updates.dependencies
    if (updates.tags !== undefined) cleanUpdates.tags = updates.tags

    // Metadata fields
    if (updates.isShared !== undefined) cleanUpdates.isShared = updates.isShared
    if (updates.usageCount !== undefined) cleanUpdates.usageCount = updates.usageCount
    if (updates.lastUsedAt !== undefined) cleanUpdates.lastUsedAt = updates.lastUsedAt

    // Clean items if provided
    if (updates.items) {
      cleanUpdates.items = updates.items.map(item => ({
        id: item.id || `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        description: item.description || '',
        division: item.division || '',
        type: item.type || 'material',
        quantity: item.quantity || 0,
        unit: item.unit || 'EA',
        unitCost: item.unitCost || 0,
        notes: item.notes || '',
        laborHours: item.laborHours || 0,
      }))
    }

    await updateDoc(docRef, cleanUpdates)
  } catch (error: unknown) {
    console.error('Error updating assembly:', error)
    throw new Error(getErrorMessage(error) || 'Failed to update assembly')
  }
}

/**
 * Delete an assembly
 */
export async function deleteAssembly(assemblyId: string): Promise<void> {
  try {
    const docRef = doc(db, ASSEMBLIES_COLLECTION, assemblyId)
    await deleteDoc(docRef)
  } catch (error: unknown) {
    console.error('Error deleting assembly:', error)
    throw new Error(getErrorMessage(error) || 'Failed to delete assembly')
  }
}
