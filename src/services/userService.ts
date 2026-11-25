import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { ActivityLevel, BodyStats, Gender, UserProfile } from '@/types'
import { DEFAULT_CALORIE_GOAL } from '@/utils/constants'
import { db } from './firebase'

const userRef = (uid: string) => doc(db, 'users', uid)

function parseStats(data: unknown): BodyStats | null {
  if (typeof data !== 'object' || data === null) return null
  const s = data as Record<string, unknown>
  if (
    typeof s.gender !== 'string' ||
    typeof s.activityLevel !== 'string' ||
    typeof s.age !== 'number' ||
    typeof s.heightIn !== 'number' ||
    typeof s.weightLb !== 'number'
  ) {
    return null
  }
  return {
    gender: s.gender as Gender,
    activityLevel: s.activityLevel as ActivityLevel,
    age: s.age,
    heightIn: s.heightIn,
    weightLb: s.weightLb,
  }
}

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(userRef(uid))
  if (!snap.exists()) return null
  const data = snap.data()
  return {
    email: String(data.email ?? ''),
    calorieGoal: Number(data.calorieGoal ?? DEFAULT_CALORIE_GOAL),
    onboardingCompleted: data.onboardingCompleted === true,
    stats: parseStats(data.stats),
    weeklyChangeLb: typeof data.weeklyChangeLb === 'number' ? data.weeklyChangeLb : null,
  }
}

export async function createProfile(uid: string, email: string): Promise<void> {
  await setDoc(userRef(uid), {
    email,
    calorieGoal: DEFAULT_CALORIE_GOAL,
    onboardingCompleted: false,
    createdAt: Date.now(),
  })
}

export async function updateCalorieGoal(uid: string, calorieGoal: number): Promise<void> {
  await setDoc(userRef(uid), { calorieGoal }, { merge: true })
}

export async function saveOnboarding(
  uid: string,
  stats: BodyStats,
  weeklyChangeLb: number,
  calorieGoal: number,
): Promise<void> {
  await setDoc(
    userRef(uid),
    { stats, weeklyChangeLb, calorieGoal, onboardingCompleted: true },
    { merge: true },
  )
}

/** Marks onboarding as done without personal details, keeping the given goal. */
export async function skipOnboarding(uid: string, calorieGoal: number): Promise<void> {
  await setDoc(userRef(uid), { calorieGoal, onboardingCompleted: true }, { merge: true })
}
