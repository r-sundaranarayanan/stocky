import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  type DocumentData,
} from 'firebase/firestore'
import type { Food, FoodInput } from '@/types'
import { db } from './firebase'

const foodsCol = (uid: string) => collection(db, 'users', uid, 'foods')

function toFood(id: string, data: DocumentData): Food {
  return {
    id,
    name: String(data.name ?? ''),
    servingSize: Number(data.servingSize ?? 1),
    servingUnit: String(data.servingUnit ?? 'serving'),
    calories: Number(data.calories ?? 0),
    protein: Number(data.protein ?? 0),
    carbs: Number(data.carbs ?? 0),
    fat: Number(data.fat ?? 0),
    lastUsedAt: typeof data.lastUsedAt === 'number' ? data.lastUsedAt : null,
    createdAt: Number(data.createdAt ?? 0),
  }
}

export async function listFoods(uid: string): Promise<Food[]> {
  const snap = await getDocs(foodsCol(uid))
  return snap.docs.map((d) => toFood(d.id, d.data()))
}

export async function createFood(uid: string, input: FoodInput): Promise<Food> {
  const createdAt = Date.now()
  const data = { ...input, nameLower: input.name.toLowerCase(), lastUsedAt: null, createdAt }
  const ref = await addDoc(foodsCol(uid), data)
  return toFood(ref.id, data)
}

export async function updateFood(uid: string, id: string, input: FoodInput): Promise<void> {
  await updateDoc(doc(foodsCol(uid), id), { ...input, nameLower: input.name.toLowerCase() })
}

export async function deleteFood(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(foodsCol(uid), id))
}

export async function markFoodUsed(uid: string, id: string, usedAt: number): Promise<void> {
  await setDoc(doc(foodsCol(uid), id), { lastUsedAt: usedAt }, { merge: true })
}
