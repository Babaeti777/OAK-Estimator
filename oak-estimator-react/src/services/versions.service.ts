import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Project, ProjectVersion } from '@/types'

const VERSIONS_COLLECTION = 'projectVersions'

/**
 * Get all versions for a project
 */
export async function getProjectVersions(projectId: string): Promise<ProjectVersion[]> {
  try {
    const q = query(
      collection(db, VERSIONS_COLLECTION),
      where('projectId', '==', projectId),
      orderBy('versionNumber', 'desc'),
      limit(50)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as ProjectVersion))
  } catch (error: any) {
    console.error('Error getting project versions:', error)
    throw new Error(error.message || 'Failed to load versions')
  }
}

/**
 * Create a new version snapshot
 */
export async function createVersion(
  project: Project,
  name: string,
  notes?: string,
  createdBy?: string
): Promise<string> {
  try {
    const docRef = doc(collection(db, VERSIONS_COLLECTION))

    // Get current version number
    const existingVersions = await getProjectVersions(project.id)
    const versionNumber = existingVersions.length > 0
      ? Math.max(...existingVersions.map(v => v.versionNumber)) + 1
      : 1

    // Create snapshot excluding id and userId
    const { id, userId, ...snapshot } = project

    await setDoc(docRef, {
      projectId: project.id,
      versionNumber,
      name,
      snapshot,
      createdAt: Date.now(),
      createdBy,
      notes,
    })

    return docRef.id
  } catch (error: any) {
    console.error('Error creating version:', error)
    throw new Error(error.message || 'Failed to create version')
  }
}

/**
 * Delete a version
 */
export async function deleteVersion(versionId: string): Promise<void> {
  try {
    const docRef = doc(db, VERSIONS_COLLECTION, versionId)
    await deleteDoc(docRef)
  } catch (error: any) {
    console.error('Error deleting version:', error)
    throw new Error(error.message || 'Failed to delete version')
  }
}

/**
 * Get latest version number for a project
 */
export async function getLatestVersionNumber(projectId: string): Promise<number> {
  try {
    const versions = await getProjectVersions(projectId)
    if (versions.length === 0) return 0
    return Math.max(...versions.map(v => v.versionNumber))
  } catch {
    return 0
  }
}
