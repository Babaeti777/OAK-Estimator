import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { db } from './firebase'
import type { ChangeOrder } from '@/types'
import { getErrorMessage } from '@/lib/utils'

const CHANGE_ORDERS_COLLECTION = 'changeOrders'

/**
 * Get all change orders for a project
 */
export async function getProjectChangeOrders(projectId: string): Promise<ChangeOrder[]> {
  try {
    const q = query(
      collection(db, CHANGE_ORDERS_COLLECTION),
      where('projectId', '==', projectId),
      orderBy('changeOrderNumber', 'asc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as ChangeOrder))
  } catch (error: unknown) {
    console.error('Error getting change orders:', error)
    throw new Error(getErrorMessage(error) || 'Failed to load change orders')
  }
}

/**
 * Get next change order number for a project
 */
export async function getNextChangeOrderNumber(projectId: string): Promise<number> {
  try {
    const changeOrders = await getProjectChangeOrders(projectId)
    if (changeOrders.length === 0) return 1
    return Math.max(...changeOrders.map(co => co.changeOrderNumber)) + 1
  } catch {
    return 1
  }
}

/**
 * Create a new change order
 */
export async function createChangeOrder(
  changeOrder: Omit<ChangeOrder, 'id' | 'createdAt' | 'updatedAt' | 'changeOrderNumber'>
): Promise<string> {
  try {
    const docRef = doc(collection(db, CHANGE_ORDERS_COLLECTION))
    const now = Date.now()
    const changeOrderNumber = await getNextChangeOrderNumber(changeOrder.projectId)

    await setDoc(docRef, {
      ...changeOrder,
      changeOrderNumber,
      createdAt: now,
      updatedAt: now,
    })

    return docRef.id
  } catch (error: unknown) {
    console.error('Error creating change order:', error)
    throw new Error(getErrorMessage(error) || 'Failed to create change order')
  }
}

/**
 * Update a change order
 */
export async function updateChangeOrder(
  changeOrderId: string,
  updates: Partial<ChangeOrder>
): Promise<void> {
  try {
    const docRef = doc(db, CHANGE_ORDERS_COLLECTION, changeOrderId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Date.now(),
    })
  } catch (error: unknown) {
    console.error('Error updating change order:', error)
    throw new Error(getErrorMessage(error) || 'Failed to update change order')
  }
}

/**
 * Approve a change order
 */
export async function approveChangeOrder(
  changeOrderId: string,
  approvedBy: string
): Promise<void> {
  try {
    const docRef = doc(db, CHANGE_ORDERS_COLLECTION, changeOrderId)
    await updateDoc(docRef, {
      status: 'approved',
      approvedBy,
      approvedAt: Date.now(),
      updatedAt: Date.now(),
    })
  } catch (error: unknown) {
    console.error('Error approving change order:', error)
    throw new Error(getErrorMessage(error) || 'Failed to approve change order')
  }
}

/**
 * Reject a change order
 */
export async function rejectChangeOrder(changeOrderId: string): Promise<void> {
  try {
    const docRef = doc(db, CHANGE_ORDERS_COLLECTION, changeOrderId)
    await updateDoc(docRef, {
      status: 'rejected',
      updatedAt: Date.now(),
    })
  } catch (error: unknown) {
    console.error('Error rejecting change order:', error)
    throw new Error(getErrorMessage(error) || 'Failed to reject change order')
  }
}

/**
 * Delete a change order
 */
export async function deleteChangeOrder(changeOrderId: string): Promise<void> {
  try {
    const docRef = doc(db, CHANGE_ORDERS_COLLECTION, changeOrderId)
    await deleteDoc(docRef)
  } catch (error: unknown) {
    console.error('Error deleting change order:', error)
    throw new Error(getErrorMessage(error) || 'Failed to delete change order')
  }
}

/**
 * Get a single change order
 */
export async function getChangeOrder(changeOrderId: string): Promise<ChangeOrder | null> {
  try {
    const docRef = doc(db, CHANGE_ORDERS_COLLECTION, changeOrderId)
    const snapshot = await getDoc(docRef)
    if (!snapshot.exists()) return null
    return { id: snapshot.id, ...snapshot.data() } as ChangeOrder
  } catch (error: unknown) {
    console.error('Error getting change order:', error)
    throw new Error(getErrorMessage(error) || 'Failed to get change order')
  }
}
