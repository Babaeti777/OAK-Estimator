import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'

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
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()

// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.')
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support offline persistence')
  }
})
