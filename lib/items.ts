import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from './firebase'
import { Item } from './types'

const COL = 'items'

export function subscribeToItems(callback: (items: Item[]) => void) {
  const q = query(collection(db, COL), orderBy('order', 'asc'))
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Item))
    callback(items)
  })
}

function sanitizeItem(data: Partial<Omit<Item, 'id'>>): Partial<Omit<Item, 'id'>> {
  const out = { ...data }
  if (typeof out.name === 'string') out.name = out.name.slice(0, 60)
  if (typeof out.brand === 'string') out.brand = out.brand.slice(0, 40)
  if (typeof out.note === 'string') out.note = out.note.slice(0, 120)
  return out
}

export async function addItem(data: Omit<Item, 'id'>) {
  return addDoc(collection(db, COL), sanitizeItem(data))
}

export async function updateItem(id: string, data: Partial<Item>) {
  return updateDoc(doc(db, COL, id), sanitizeItem(data))
}

export async function deleteItem(id: string) {
  return deleteDoc(doc(db, COL, id))
}

export async function reserveItem(id: string, reservedBy: string, reservedMessage?: string) {
  return updateDoc(doc(db, COL, id), {
    reserved: true,
    reservedBy: reservedBy.slice(0, 60),
    reservedMessage: (reservedMessage ?? '').slice(0, 150),
  })
}

export async function cancelReservation(id: string) {
  return updateDoc(doc(db, COL, id), {
    reserved: false,
    reservedBy: '',
    reservedMessage: '',
  })
}
