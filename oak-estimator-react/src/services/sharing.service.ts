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
} from 'firebase/firestore'
import { db } from './firebase'
import type { SharedProject, ClientComment } from '@/types'
import { getErrorMessage } from '@/lib/utils'

const SHARED_PROJECTS_COLLECTION = 'sharedProjects'
const CLIENT_COMMENTS_COLLECTION = 'clientComments'

/**
 * Generate a random share token
 */
function generateShareToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}

/**
 * Create a shareable link for a project
 */
export async function createSharedProject(
  projectId: string,
  userId: string,
  options: {
    expiresInDays?: number
    allowComments?: boolean
    showUnitCosts?: boolean
    showMarkup?: boolean
    password?: string
  } = {}
): Promise<SharedProject> {
  try {
    const docRef = doc(collection(db, SHARED_PROJECTS_COLLECTION))
    const now = Date.now()
    const shareToken = generateShareToken()

    const sharedProject: Omit<SharedProject, 'id'> = {
      projectId,
      userId,
      shareToken,
      expiresAt: options.expiresInDays
        ? now + options.expiresInDays * 24 * 60 * 60 * 1000
        : undefined,
      allowComments: options.allowComments ?? false,
      showUnitCosts: options.showUnitCosts ?? true,
      showMarkup: options.showMarkup ?? false,
      password: options.password,
      viewCount: 0,
      createdAt: now,
    }

    await setDoc(docRef, sharedProject)

    return { id: docRef.id, ...sharedProject }
  } catch (error: unknown) {
    console.error('Error creating shared project:', error)
    throw new Error(getErrorMessage(error) || 'Failed to create shareable link')
  }
}

/**
 * Get shared project by token
 */
export async function getSharedProjectByToken(token: string): Promise<SharedProject | null> {
  try {
    const q = query(
      collection(db, SHARED_PROJECTS_COLLECTION),
      where('shareToken', '==', token)
    )

    const snapshot = await getDocs(q)
    if (snapshot.empty) return null

    const doc = snapshot.docs[0]
    return { id: doc.id, ...doc.data() } as SharedProject
  } catch (error: unknown) {
    console.error('Error getting shared project:', error)
    throw new Error(getErrorMessage(error) || 'Failed to get shared project')
  }
}

/**
 * Get all shared projects for a user's project
 */
export async function getProjectShares(projectId: string): Promise<SharedProject[]> {
  try {
    const q = query(
      collection(db, SHARED_PROJECTS_COLLECTION),
      where('projectId', '==', projectId)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as SharedProject))
  } catch (error: unknown) {
    console.error('Error getting project shares:', error)
    throw new Error(getErrorMessage(error) || 'Failed to get project shares')
  }
}

/**
 * Record a view of a shared project
 */
export async function recordSharedProjectView(sharedProjectId: string): Promise<void> {
  try {
    const docRef = doc(db, SHARED_PROJECTS_COLLECTION, sharedProjectId)
    const snapshot = await getDoc(docRef)
    if (!snapshot.exists()) return

    const data = snapshot.data()
    await updateDoc(docRef, {
      viewCount: (data.viewCount || 0) + 1,
      lastViewedAt: Date.now(),
    })
  } catch (error: unknown) {
    console.error('Error recording view:', error)
  }
}

/**
 * Delete a shared project link
 */
export async function deleteSharedProject(sharedProjectId: string): Promise<void> {
  try {
    const docRef = doc(db, SHARED_PROJECTS_COLLECTION, sharedProjectId)
    await deleteDoc(docRef)
  } catch (error: unknown) {
    console.error('Error deleting shared project:', error)
    throw new Error(getErrorMessage(error) || 'Failed to delete shared link')
  }
}

/**
 * Update shared project settings
 */
export async function updateSharedProject(
  sharedProjectId: string,
  updates: Partial<SharedProject>
): Promise<void> {
  try {
    const docRef = doc(db, SHARED_PROJECTS_COLLECTION, sharedProjectId)
    await updateDoc(docRef, updates)
  } catch (error: unknown) {
    console.error('Error updating shared project:', error)
    throw new Error(getErrorMessage(error) || 'Failed to update shared link')
  }
}

// ============================================
// Client Comments
// ============================================

/**
 * Add a client comment
 */
export async function addClientComment(
  comment: Omit<ClientComment, 'id' | 'createdAt'>
): Promise<string> {
  try {
    const docRef = doc(collection(db, CLIENT_COMMENTS_COLLECTION))
    await setDoc(docRef, {
      ...comment,
      createdAt: Date.now(),
    })
    return docRef.id
  } catch (error: unknown) {
    console.error('Error adding comment:', error)
    throw new Error(getErrorMessage(error) || 'Failed to add comment')
  }
}

/**
 * Get comments for a shared project
 */
export async function getSharedProjectComments(sharedProjectId: string): Promise<ClientComment[]> {
  try {
    const q = query(
      collection(db, CLIENT_COMMENTS_COLLECTION),
      where('sharedProjectId', '==', sharedProjectId)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as ClientComment))
  } catch (error: unknown) {
    console.error('Error getting comments:', error)
    throw new Error(getErrorMessage(error) || 'Failed to get comments')
  }
}

/**
 * Resolve a client comment
 */
export async function resolveClientComment(commentId: string): Promise<void> {
  try {
    const docRef = doc(db, CLIENT_COMMENTS_COLLECTION, commentId)
    await updateDoc(docRef, {
      resolved: true,
      resolvedAt: Date.now(),
    })
  } catch (error: unknown) {
    console.error('Error resolving comment:', error)
    throw new Error(getErrorMessage(error) || 'Failed to resolve comment')
  }
}
