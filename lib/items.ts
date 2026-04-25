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
import { Item, Reservation } from './types'

const COL = 'items'

export function subscribeToItems(callback: (items: Item[]) => void) {
  const q = query(collection(db, COL), orderBy('order', 'asc'))
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map((d) => {
      const data = d.data()

      // Rétro-compatibilité : anciens documents avec reservedBy/reservedMessage
      if (data.reservedBy && (!data.reservations || data.reservations.length === 0)) {
        data.reservations = [{
          name: data.reservedBy,
          quantity: 1,
          ...(data.reservedMessage ? { message: data.reservedMessage } : {}),
        }]
        data.reservedQuantity = 1
      }

      // Valeurs par défaut
      if (!data.reservations) data.reservations = []
      if (!data.quantity) data.quantity = 1
      if (data.reservedQuantity === undefined) data.reservedQuantity = 0

      return { id: d.id, ...data } as Item
    })
    callback(items)
  })
}

function sanitizeItem(data: Partial<Omit<Item, 'id'>>): Partial<Omit<Item, 'id'>> {
  const out = { ...data }
  if (typeof out.name === 'string') out.name = out.name.slice(0, 60)
  if (typeof out.brand === 'string') out.brand = out.brand.slice(0, 40)
  if (typeof out.note === 'string') out.note = out.note.slice(0, 120)
  if (typeof out.quantity === 'number') out.quantity = Math.max(1, Math.min(99, Math.floor(out.quantity)))
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

export async function reserveItem(
  id: string,
  name: string,
  quantity: number,
  message: string,
  currentReservations: Reservation[],
  itemQuantity: number,
) {
  const newReservation: Reservation = {
    name: name.slice(0, 60),
    quantity,
    ...(message.trim() ? { message: message.slice(0, 150) } : {}),
  }
  const newReservations = [...currentReservations, newReservation]
  const newReservedQty = newReservations.reduce((sum, r) => sum + r.quantity, 0)

  return updateDoc(doc(db, COL, id), {
    reservations: newReservations,
    reservedQuantity: newReservedQty,
    reserved: newReservedQty >= itemQuantity,
  })
}

export async function cancelReservation(
  id: string,
  newReservations: Reservation[],
  itemQuantity: number,
) {
  const newReservedQty = newReservations.reduce((sum, r) => sum + r.quantity, 0)
  return updateDoc(doc(db, COL, id), {
    reservations: newReservations,
    reservedQuantity: newReservedQty,
    reserved: newReservedQty >= itemQuantity,
  })
}
