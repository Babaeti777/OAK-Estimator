import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth'
import { auth, googleProvider } from './firebase'
import type { User } from '@/types'

/**
 * Sign in with Google
 */
export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    return mapFirebaseUser(result.user)
  } catch (error: any) {
    console.error('Error signing in with Google:', error)
    throw new Error(error.message || 'Failed to sign in with Google')
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth)
  } catch (error: any) {
    console.error('Error signing out:', error)
    throw new Error(error.message || 'Failed to sign out')
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      callback(mapFirebaseUser(firebaseUser))
    } else {
      callback(null)
    }
  })
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  const firebaseUser = auth.currentUser
  return firebaseUser ? mapFirebaseUser(firebaseUser) : null
}

/**
 * Map Firebase user to our User type
 */
function mapFirebaseUser(firebaseUser: FirebaseUser): User {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
  }
}
