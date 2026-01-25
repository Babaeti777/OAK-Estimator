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
import type { LineItemTemplate } from '@/types'

const TEMPLATES_COLLECTION = 'lineItemTemplates'

/**
 * Get all templates for a user
 */
export async function getUserTemplates(userId: string): Promise<LineItemTemplate[]> {
  try {
    const q = query(
      collection(db, TEMPLATES_COLLECTION),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as LineItemTemplate))
  } catch (error: any) {
    console.error('Error getting templates:', error)
    throw new Error(error.message || 'Failed to load templates')
  }
}

/**
 * Create a new template
 */
export async function createTemplate(
  template: Omit<LineItemTemplate, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const docRef = doc(collection(db, TEMPLATES_COLLECTION))
    const now = Date.now()

    await setDoc(docRef, {
      ...template,
      createdAt: now,
      updatedAt: now,
    })

    return docRef.id
  } catch (error: any) {
    console.error('Error creating template:', error)
    throw new Error(error.message || 'Failed to create template')
  }
}

/**
 * Update a template
 */
export async function updateTemplate(
  templateId: string,
  updates: Partial<LineItemTemplate>
): Promise<void> {
  try {
    const docRef = doc(db, TEMPLATES_COLLECTION, templateId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Date.now(),
    })
  } catch (error: any) {
    console.error('Error updating template:', error)
    throw new Error(error.message || 'Failed to update template')
  }
}

/**
 * Delete a template
 */
export async function deleteTemplate(templateId: string): Promise<void> {
  try {
    const docRef = doc(db, TEMPLATES_COLLECTION, templateId)
    await deleteDoc(docRef)
  } catch (error: any) {
    console.error('Error deleting template:', error)
    throw new Error(error.message || 'Failed to delete template')
  }
}
