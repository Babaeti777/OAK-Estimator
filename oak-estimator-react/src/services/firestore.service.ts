import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Project } from '@/types'
import { getErrorMessage, hasErrorCode } from '@/lib/utils'
import { withRetry } from '@/lib/retry'
import { createLogger } from './logging.service'

const logger = createLogger('FirestoreService')

/** Default retry options for Firestore operations */
const RETRY_OPTIONS = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 5000,
}

const PROJECTS_COLLECTION = 'projects'

/**
 * Get all projects for a user (excluding trashed)
 */
export async function getUserProjects(userId: string): Promise<Project[]> {
  return withRetry(async () => {
    try {
      const q = query(
        collection(db, PROJECTS_COLLECTION),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc')
      )

      const snapshot = await getDocs(q)
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Project))

      // Filter out trashed projects
      return projects.filter(p => !p.trashedAt)
    } catch (error: unknown) {
      logger.error('Error getting user projects', { userId }, error)

      // Check for index-related errors
      if (hasErrorCode(error) && (error.code === 'failed-precondition' || error.message?.includes('index'))) {
        logger.error('Firestore index required', {
          collection: 'projects',
          fields: 'userId (ASC), updatedAt (DESC)',
        })
      }

      throw new Error(getErrorMessage(error) || 'Failed to load projects')
    }
  }, RETRY_OPTIONS)
}

/**
 * Get a single project
 */
export async function getProject(projectId: string): Promise<Project | null> {
  return withRetry(async () => {
    try {
      const docRef = doc(db, PROJECTS_COLLECTION, projectId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Project
      }

      return null
    } catch (error: unknown) {
      logger.error('Error getting project', { projectId }, error)
      throw new Error(getErrorMessage(error) || 'Failed to load project')
    }
  }, RETRY_OPTIONS)
}

/**
 * Create a new project
 */
export async function createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  return withRetry(async () => {
    try {
      const docRef = doc(collection(db, PROJECTS_COLLECTION))
      const now = Date.now()

      await setDoc(docRef, {
        ...project,
        createdAt: now,
        updatedAt: now,
      })

      logger.info('Project created', { projectId: docRef.id })
      return docRef.id
    } catch (error: unknown) {
      logger.error('Error creating project', {}, error)
      throw new Error(getErrorMessage(error) || 'Failed to create project')
    }
  }, RETRY_OPTIONS)
}

/**
 * Update a project
 */
export async function updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
  return withRetry(async () => {
    try {
      const docRef = doc(db, PROJECTS_COLLECTION, projectId)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Date.now(),
      })
    } catch (error: unknown) {
      logger.error('Error updating project', { projectId }, error)
      throw new Error(getErrorMessage(error) || 'Failed to update project')
    }
  }, RETRY_OPTIONS)
}

/**
 * Move project to trash (soft delete)
 */
export async function trashProject(projectId: string): Promise<void> {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId)
    await updateDoc(docRef, {
      trashedAt: Date.now(),
      updatedAt: Date.now(),
    })
  } catch (error: unknown) {
    console.error('Error trashing project:', error)
    throw new Error(getErrorMessage(error) || 'Failed to move project to trash')
  }
}

/**
 * Restore project from trash
 */
export async function restoreProject(projectId: string): Promise<void> {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId)
    await updateDoc(docRef, {
      trashedAt: null,
      updatedAt: Date.now(),
    })
  } catch (error: unknown) {
    console.error('Error restoring project:', error)
    throw new Error(getErrorMessage(error) || 'Failed to restore project')
  }
}

/**
 * Get trashed projects
 */
export async function getTrashedProjects(userId: string): Promise<Project[]> {
  try {
    const q = query(
      collection(db, PROJECTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    )

    const snapshot = await getDocs(q)
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Project))

    // Filter for trashed projects only
    return projects.filter(p => p.trashedAt)
  } catch (error: unknown) {
    console.error('Error getting trashed projects:', error)
    throw new Error(getErrorMessage(error) || 'Failed to load trashed projects')
  }
}

/**
 * Permanently delete a project
 */
export async function deleteProject(projectId: string): Promise<void> {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId)
    await deleteDoc(docRef)
  } catch (error: unknown) {
    console.error('Error deleting project:', error)
    throw new Error(getErrorMessage(error) || 'Failed to delete project')
  }
}

/**
 * Subscribe to real-time project updates
 */
export function subscribeToProject(
  projectId: string,
  callback: (project: Project | null) => void
): () => void {
  const docRef = doc(db, PROJECTS_COLLECTION, projectId)

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback({
          id: snapshot.id,
          ...snapshot.data(),
        } as Project)
      } else {
        callback(null)
      }
    },
    (error) => {
      console.error('Error in project subscription:', error)
      callback(null)
    }
  )
}

/**
 * Subscribe to all user projects (excluding trashed)
 */
export function subscribeToUserProjects(
  userId: string,
  callback: (projects: Project[]) => void
): () => void {
  const q = query(
    collection(db, PROJECTS_COLLECTION),
    where('userId', '==', userId),
    orderBy('updatedAt', 'desc')
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const projects = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Project))
      // Filter out trashed projects
      callback(projects.filter(p => !p.trashedAt))
    },
    (error) => {
      console.error('Error in projects subscription:', error)

      // Check for index-related errors
      if (error.code === 'failed-precondition' || error.message?.includes('index')) {
        console.error('Firestore index required. Please create the composite index in Firebase Console.')
        console.error('Required index: Collection: projects, Fields: userId (ASC), updatedAt (DESC)')
      }

      callback([])
    }
  )
}
