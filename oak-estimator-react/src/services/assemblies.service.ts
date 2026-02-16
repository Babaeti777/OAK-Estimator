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
  } catch (error: any) {
    console.error('Error getting assemblies:', error)
    throw new Error(error.message || 'Failed to load assemblies')
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
      description: item.description || '',
      division: item.division || '',
      type: item.type || 'material',
      quantity: item.quantity || 0,
      unit: item.unit || 'EA',
      unitCost: item.unitCost || 0,
      notes: item.notes || '',
    }))

    await setDoc(docRef, {
      userId: assembly.userId,
      name: assembly.name || '',
      description: assembly.description || '',
      items: cleanItems,
      totalCost,
      createdAt: now,
      updatedAt: now,
    })

    return docRef.id
  } catch (error: any) {
    console.error('Error creating assembly:', error)
    throw new Error(error.message || 'Failed to create assembly')
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
    const cleanUpdates: Record<string, any> = {
      updatedAt: Date.now(),
    }

    if (updates.name !== undefined) cleanUpdates.name = updates.name
    if (updates.description !== undefined) cleanUpdates.description = updates.description
    if (totalCost !== undefined) cleanUpdates.totalCost = totalCost

    if (updates.items) {
      cleanUpdates.items = updates.items.map(item => ({
        description: item.description || '',
        division: item.division || '',
        type: item.type || 'material',
        quantity: item.quantity || 0,
        unit: item.unit || 'EA',
        unitCost: item.unitCost || 0,
        notes: item.notes || '',
      }))
    }

    await updateDoc(docRef, cleanUpdates)
  } catch (error: any) {
    console.error('Error updating assembly:', error)
    throw new Error(error.message || 'Failed to update assembly')
  }
}

/**
 * Delete an assembly
 */
export async function deleteAssembly(assemblyId: string): Promise<void> {
  try {
    const docRef = doc(db, ASSEMBLIES_COLLECTION, assemblyId)
    await deleteDoc(docRef)
  } catch (error: any) {
    console.error('Error deleting assembly:', error)
    throw new Error(error.message || 'Failed to delete assembly')
  }
}
