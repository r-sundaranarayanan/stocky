import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
  type DocumentData,
} from 'firebase/firestore'
import type { Entry, EntryInput, Meal } from '@/types'
import { db } from './firebase'

const entriesCol = (uid: string) => collection(db, 'users', uid, 'entries')

function toEntry(id: string, data: DocumentData): Entry {
  return {
    id,
    date: String(data.date ?? ''),
    meal: data.meal as Meal,
    // Entries saved before planning existed have no status and were eaten.
    status: data.status === 'planned' ? 'planned' : 'eaten',
    foodId: typeof data.foodId === 'string' ? data.foodId : null,
    foodName: String(data.foodName ?? ''),
    servingSize: Number(data.servingSize ?? 1),
    servingUnit: String(data.servingUnit ?? 'serving'),
    servings: Number(data.servings ?? 1),
    calories: Number(data.calories ?? 0),
    protein: Number(data.protein ?? 0),
    carbs: Number(data.carbs ?? 0),
    fat: Number(data.fat ?? 0),
    createdAt: Number(data.createdAt ?? 0),
  }
}

export async function listEntriesByDate(uid: string, date: string): Promise<Entry[]> {
  const snap = await getDocs(query(entriesCol(uid), where('date', '==', date)))
  return snap.docs.map((d) => toEntry(d.id, d.data())).sort((a, b) => a.createdAt - b.createdAt)
}

export async function getEntry(uid: string, id: string): Promise<Entry | null> {
  const snap = await getDoc(doc(entriesCol(uid), id))
  return snap.exists() ? toEntry(snap.id, snap.data()) : null
}

export async function addEntry(uid: string, input: EntryInput): Promise<Entry> {
  const createdAt = Date.now()
  const ref = await addDoc(entriesCol(uid), { ...input, createdAt })
  return { ...input, id: ref.id, createdAt }
}

export async function updateEntry(
  uid: string,
  id: string,
  changes: Partial<
    Pick<Entry, 'meal' | 'servings' | 'calories' | 'protein' | 'carbs' | 'fat' | 'status'>
  >,
): Promise<void> {
  await updateDoc(doc(entriesCol(uid), id), changes)
}

export async function deleteEntry(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(entriesCol(uid), id))
}
