import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { db, storage } from './firebase'
import type { Attachment } from '@/types'

const ATTACHMENTS_COLLECTION = 'attachments'

/**
 * Upload a file and create an attachment record
 */
export async function uploadAttachment(
  file: File,
  projectId: string,
  userId: string,
  lineItemId?: string,
  description?: string
): Promise<Attachment> {
  try {
    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const storagePath = `attachments/${userId}/${projectId}/${filename}`

    // Upload to Firebase Storage
    const storageRef = ref(storage, storagePath)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)

    // Generate thumbnail URL for images
    let thumbnailUrl: string | undefined
    if (file.type.startsWith('image/')) {
      // For now, use the same URL - in production you'd generate a thumbnail
      thumbnailUrl = url
    }

    // Create Firestore record
    const docRef = doc(collection(db, ATTACHMENTS_COLLECTION))
    const attachment: Omit<Attachment, 'id'> = {
      projectId,
      userId,
      filename,
      originalName: file.name,
      mimeType: file.type,
      size: file.size,
      url,
      thumbnailUrl,
      lineItemId,
      description,
      createdAt: timestamp,
    }

    await setDoc(docRef, attachment)

    return { id: docRef.id, ...attachment }
  } catch (error: any) {
    console.error('Error uploading attachment:', error)
    throw new Error(error.message || 'Failed to upload attachment')
  }
}

/**
 * Get all attachments for a project
 */
export async function getProjectAttachments(projectId: string): Promise<Attachment[]> {
  try {
    const q = query(
      collection(db, ATTACHMENTS_COLLECTION),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Attachment))
  } catch (error: any) {
    console.error('Error getting attachments:', error)
    throw new Error(error.message || 'Failed to load attachments')
  }
}

/**
 * Get attachments for a specific line item
 */
export async function getLineItemAttachments(
  projectId: string,
  lineItemId: string
): Promise<Attachment[]> {
  try {
    const q = query(
      collection(db, ATTACHMENTS_COLLECTION),
      where('projectId', '==', projectId),
      where('lineItemId', '==', lineItemId)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Attachment))
  } catch (error: any) {
    console.error('Error getting line item attachments:', error)
    throw new Error(error.message || 'Failed to load attachments')
  }
}

/**
 * Delete an attachment
 */
export async function deleteAttachment(attachment: Attachment): Promise<void> {
  try {
    // Delete from Storage
    const storagePath = `attachments/${attachment.userId}/${attachment.projectId}/${attachment.filename}`
    const storageRef = ref(storage, storagePath)

    try {
      await deleteObject(storageRef)
    } catch (e) {
      // File might not exist in storage, continue with Firestore deletion
      console.warn('Storage file not found, continuing with deletion')
    }

    // Delete Firestore record
    const docRef = doc(db, ATTACHMENTS_COLLECTION, attachment.id)
    await deleteDoc(docRef)
  } catch (error: any) {
    console.error('Error deleting attachment:', error)
    throw new Error(error.message || 'Failed to delete attachment')
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Check if file type is allowed
 */
export function isAllowedFileType(file: File): boolean {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ]
  return allowedTypes.includes(file.type)
}

/**
 * Get file icon based on mime type
 */
export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType === 'application/pdf') return 'file-text'
  if (mimeType.includes('word')) return 'file-text'
  if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'table'
  if (mimeType === 'text/csv') return 'table'
  return 'file'
}
