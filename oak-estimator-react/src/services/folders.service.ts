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
  onSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'
import type { ProjectFolder } from '@/types'

const FOLDERS_COLLECTION = 'folders'

/**
 * Get all folders for a user
 */
export async function getUserFolders(userId: string): Promise<ProjectFolder[]> {
  try {
    const q = query(
      collection(db, FOLDERS_COLLECTION),
      where('userId', '==', userId),
      orderBy('order', 'asc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as ProjectFolder))
  } catch (error: any) {
    console.error('Error getting folders:', error)
    throw new Error(error.message || 'Failed to load folders')
  }
}

/**
 * Create a new folder
 */
export async function createFolder(folder: Omit<ProjectFolder, 'id' | 'createdAt'>): Promise<string> {
  try {
    const docRef = doc(collection(db, FOLDERS_COLLECTION))

    await setDoc(docRef, {
      ...folder,
      createdAt: Date.now(),
    })

    return docRef.id
  } catch (error: any) {
    console.error('Error creating folder:', error)
    throw new Error(error.message || 'Failed to create folder')
  }
}

/**
 * Update a folder
 */
export async function updateFolder(folderId: string, updates: Partial<ProjectFolder>): Promise<void> {
  try {
    const docRef = doc(db, FOLDERS_COLLECTION, folderId)
    await updateDoc(docRef, updates)
  } catch (error: any) {
    console.error('Error updating folder:', error)
    throw new Error(error.message || 'Failed to update folder')
  }
}

/**
 * Delete a folder
 */
export async function deleteFolder(folderId: string): Promise<void> {
  try {
    const docRef = doc(db, FOLDERS_COLLECTION, folderId)
    await deleteDoc(docRef)
  } catch (error: any) {
    console.error('Error deleting folder:', error)
    throw new Error(error.message || 'Failed to delete folder')
  }
}

/**
 * Subscribe to user folders
 */
export function subscribeToUserFolders(
  userId: string,
  callback: (folders: ProjectFolder[]) => void
): () => void {
  const q = query(
    collection(db, FOLDERS_COLLECTION),
    where('userId', '==', userId),
    orderBy('order', 'asc')
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const folders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as ProjectFolder))
      callback(folders)
    },
    (error) => {
      console.error('Error in folders subscription:', error)
      callback([])
    }
  )
}
