import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './firebase'
import { getErrorMessage, hasErrorCode } from '@/lib/utils'

/**
 * Upload a company logo to Firebase Storage
 */
export async function uploadCompanyLogo(
  userId: string,
  file: File
): Promise<string> {
  try {
    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a PNG, JPG, or SVG image.')
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024 // 2MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size too large. Please upload an image smaller than 2MB.')
    }

    // Create a unique filename with timestamp
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `logo_${timestamp}.${extension}`

    // Create storage reference
    const storageRef = ref(storage, `company-logos/${userId}/${filename}`)

    // Upload file
    await uploadBytes(storageRef, file, {
      contentType: file.type,
    })

    // Get download URL
    const downloadURL = await getDownloadURL(storageRef)

    return downloadURL
  } catch (error: unknown) {
    console.error('Error uploading logo:', error)
    throw new Error(getErrorMessage(error) || 'Failed to upload logo')
  }
}

/**
 * Delete a company logo from Firebase Storage
 */
export async function deleteCompanyLogo(logoUrl: string): Promise<void> {
  try {
    // Extract the storage path from the URL
    const url = new URL(logoUrl)
    const pathMatch = url.pathname.match(/\/o\/(.+?)\?/)
    if (!pathMatch) {
      throw new Error('Invalid logo URL')
    }

    const path = decodeURIComponent(pathMatch[1])
    const storageRef = ref(storage, path)

    await deleteObject(storageRef)
  } catch (error: unknown) {
    console.error('Error deleting logo:', error)
    // Don't throw error if file doesn't exist
    if (hasErrorCode(error) && error.code !== 'storage/object-not-found') {
      throw new Error(getErrorMessage(error) || 'Failed to delete logo')
    }
  }
}
