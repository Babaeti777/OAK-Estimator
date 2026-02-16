import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase'

export interface UserSettings {
  defaultUnit: string
  defaultMarkup: number
  autoSave: boolean
  notifications: boolean
  theme: 'dark' | 'light' | 'system'
  accentColor: string
}

const DEFAULT_SETTINGS: UserSettings = {
  defaultUnit: 'EA',
  defaultMarkup: 15,
  autoSave: true,
  notifications: true,
  theme: 'dark',
  accentColor: 'orange',
}

/**
 * Get user settings from Firestore
 */
export async function getUserSettings(userId: string): Promise<UserSettings> {
  try {
    const docRef = doc(db, 'userSettings', userId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { ...DEFAULT_SETTINGS, ...docSnap.data() } as UserSettings
    }

    // Return defaults if no settings exist
    return DEFAULT_SETTINGS
  } catch (error) {
    console.error('Error fetching user settings:', error)
    // Return defaults on error
    return DEFAULT_SETTINGS
  }
}

/**
 * Save user settings to Firestore
 */
export async function saveUserSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<void> {
  try {
    const docRef = doc(db, 'userSettings', userId)
    await setDoc(docRef, settings, { merge: true })
  } catch (error) {
    console.error('Error saving user settings:', error)
    throw new Error('Failed to save settings')
  }
}

/**
 * Reset user settings to defaults
 */
export async function resetUserSettings(userId: string): Promise<UserSettings> {
  try {
    const docRef = doc(db, 'userSettings', userId)
    await setDoc(docRef, DEFAULT_SETTINGS)
    return DEFAULT_SETTINGS
  } catch (error) {
    console.error('Error resetting user settings:', error)
    throw new Error('Failed to reset settings')
  }
}
