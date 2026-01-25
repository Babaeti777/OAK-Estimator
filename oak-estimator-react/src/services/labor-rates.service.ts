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
} from 'firebase/firestore'
import { db } from './firebase'
import type { LaborRate, LaborCategory } from '@/types'

const LABOR_RATES_COLLECTION = 'laborRates'

// Default labor categories with typical rates
export const DEFAULT_LABOR_CATEGORIES: LaborCategory[] = [
  { code: 'GEN', name: 'General Labor', defaultRate: 35 },
  { code: 'CARP', name: 'Carpenter', defaultRate: 55 },
  { code: 'ELEC', name: 'Electrician', defaultRate: 75 },
  { code: 'PLUM', name: 'Plumber', defaultRate: 70 },
  { code: 'HVAC', name: 'HVAC Technician', defaultRate: 65 },
  { code: 'MASO', name: 'Mason', defaultRate: 60 },
  { code: 'PAIN', name: 'Painter', defaultRate: 45 },
  { code: 'ROOF', name: 'Roofer', defaultRate: 55 },
  { code: 'CONC', name: 'Concrete Worker', defaultRate: 50 },
  { code: 'WELD', name: 'Welder', defaultRate: 65 },
  { code: 'IRON', name: 'Ironworker', defaultRate: 70 },
  { code: 'TILE', name: 'Tile Setter', defaultRate: 55 },
  { code: 'DRYW', name: 'Drywall Installer', defaultRate: 50 },
  { code: 'INSU', name: 'Insulation Worker', defaultRate: 45 },
  { code: 'GLAZ', name: 'Glazier', defaultRate: 55 },
  { code: 'FIRE', name: 'Fire Protection', defaultRate: 65 },
  { code: 'SURV', name: 'Surveyor', defaultRate: 80 },
  { code: 'PROJ', name: 'Project Manager', defaultRate: 95 },
  { code: 'SUPR', name: 'Superintendent', defaultRate: 85 },
  { code: 'FORE', name: 'Foreman', defaultRate: 70 },
]

/**
 * Get all labor rates for a user
 */
export async function getUserLaborRates(userId: string): Promise<LaborRate[]> {
  try {
    const q = query(
      collection(db, LABOR_RATES_COLLECTION),
      where('userId', '==', userId),
      orderBy('tradeName', 'asc')
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as LaborRate))
  } catch (error: any) {
    console.error('Error getting labor rates:', error)
    throw new Error(error.message || 'Failed to load labor rates')
  }
}

/**
 * Calculate effective rate including burden
 */
export function calculateEffectiveRate(
  hourlyRate: number,
  benefitsRate: number = 0,
  burdenRate: number = 0
): number {
  return hourlyRate * (1 + benefitsRate / 100 + burdenRate / 100)
}

/**
 * Create a new labor rate
 */
export async function createLaborRate(
  laborRate: Omit<LaborRate, 'id' | 'createdAt' | 'updatedAt' | 'effectiveRate'>
): Promise<string> {
  try {
    const docRef = doc(collection(db, LABOR_RATES_COLLECTION))
    const now = Date.now()

    const effectiveRate = calculateEffectiveRate(
      laborRate.hourlyRate,
      laborRate.benefitsRate,
      laborRate.burdenRate
    )

    await setDoc(docRef, {
      ...laborRate,
      effectiveRate,
      createdAt: now,
      updatedAt: now,
    })

    return docRef.id
  } catch (error: any) {
    console.error('Error creating labor rate:', error)
    throw new Error(error.message || 'Failed to create labor rate')
  }
}

/**
 * Update a labor rate
 */
export async function updateLaborRate(
  laborRateId: string,
  updates: Partial<LaborRate>
): Promise<void> {
  try {
    const docRef = doc(db, LABOR_RATES_COLLECTION, laborRateId)

    // Recalculate effective rate if relevant fields changed
    let effectiveRate = updates.effectiveRate
    if (updates.hourlyRate !== undefined || updates.benefitsRate !== undefined || updates.burdenRate !== undefined) {
      effectiveRate = calculateEffectiveRate(
        updates.hourlyRate || 0,
        updates.benefitsRate,
        updates.burdenRate
      )
    }

    await updateDoc(docRef, {
      ...updates,
      effectiveRate,
      updatedAt: Date.now(),
    })
  } catch (error: any) {
    console.error('Error updating labor rate:', error)
    throw new Error(error.message || 'Failed to update labor rate')
  }
}

/**
 * Delete a labor rate
 */
export async function deleteLaborRate(laborRateId: string): Promise<void> {
  try {
    const docRef = doc(db, LABOR_RATES_COLLECTION, laborRateId)
    await deleteDoc(docRef)
  } catch (error: any) {
    console.error('Error deleting labor rate:', error)
    throw new Error(error.message || 'Failed to delete labor rate')
  }
}

/**
 * Initialize default labor rates for a new user
 */
export async function initializeDefaultLaborRates(userId: string): Promise<void> {
  try {
    const existingRates = await getUserLaborRates(userId)
    if (existingRates.length > 0) return // Already initialized

    for (const category of DEFAULT_LABOR_CATEGORIES) {
      await createLaborRate({
        userId,
        tradeName: category.name,
        tradeCode: category.code,
        hourlyRate: category.defaultRate,
        overtimeMultiplier: 1.5,
        benefitsRate: 30,
        burdenRate: 15,
        isDefault: true,
      })
    }
  } catch (error: any) {
    console.error('Error initializing labor rates:', error)
  }
}
