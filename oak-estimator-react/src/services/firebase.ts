import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyD3_zQVowO0Sg5rFSGkcSU0NoI852PuPAA",
  authDomain: "construction-estimator-d2633.firebaseapp.com",
  projectId: "construction-estimator-d2633",
  storageBucket: "construction-estimator-d2633.firebasestorage.app",
  messagingSenderId: "252394591641",
  appId: "1:252394591641:web:3e8e9ceb6da9052c7daf08"
}

// Initialize Firebase
export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// Initialize Firestore with modern persistence API
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
})

export const googleProvider = new GoogleAuthProvider()

// Initialize Storage
export const storage = getStorage(app)
