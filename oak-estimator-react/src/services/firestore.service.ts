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

const PROJECTS_COLLECTION = 'projects'

/**
 * Get all projects for a user
 */
export async function getUserProjects(userId: string): Promise<Project[]> {
  try {
    const q = query(
      collection(db, PROJECTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Project))
  } catch (error: any) {
    console.error('Error getting user projects:', error)

    // Check for index-related errors
    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
      console.error('Firestore index required. Please create the composite index in Firebase Console.')
      console.error('Required index: Collection: projects, Fields: userId (ASC), updatedAt (DESC)')
    }

    throw new Error(error.message || 'Failed to load projects')
  }
}

/**
 * Get a single project
 */
export async function getProject(projectId: string): Promise<Project | null> {
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
  } catch (error: any) {
    console.error('Error getting project:', error)
    throw new Error(error.message || 'Failed to load project')
  }
}

/**
 * Create a new project
 */
export async function createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const docRef = doc(collection(db, PROJECTS_COLLECTION))
    const now = Date.now()

    await setDoc(docRef, {
      ...project,
      createdAt: now,
      updatedAt: now,
    })

    return docRef.id
  } catch (error: any) {
    console.error('Error creating project:', error)
    throw new Error(error.message || 'Failed to create project')
  }
}

/**
 * Update a project
 */
export async function updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Date.now(),
    })
  } catch (error: any) {
    console.error('Error updating project:', error)
    throw new Error(error.message || 'Failed to update project')
  }
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<void> {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId)
    await deleteDoc(docRef)
  } catch (error: any) {
    console.error('Error deleting project:', error)
    throw new Error(error.message || 'Failed to delete project')
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
 * Subscribe to all user projects
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
      callback(projects)
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
