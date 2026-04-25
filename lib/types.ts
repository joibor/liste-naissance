export type Category =
  | 'chambre'
  | 'bain'
  | 'repas'
  | 'jeux'
  | 'vetements'
  | 'poussette'
  | 'autre'

export const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'chambre', label: 'Chambre', emoji: '🛏' },
  { value: 'bain', label: 'Bain', emoji: '🛁' },
  { value: 'repas', label: 'Repas', emoji: '🍼' },
  { value: 'jeux', label: 'Jeux & éveil', emoji: '🧸' },
  { value: 'vetements', label: 'Vêtements', emoji: '👗' },
  { value: 'poussette', label: 'Poussette & transport', emoji: '🚗' },
  { value: 'autre', label: 'Autre', emoji: '🎁' },
]

export interface Reservation {
  name: string
  quantity: number
  message?: string
}

export interface Item {
  id: string
  name: string
  brand?: string
  category: Category
  imageUrl?: string
  shopUrl?: string
  note?: string
  quantity: number           // quantité souhaitée (défaut 1)
  reservations: Reservation[] // liste des réservations partielles/totales
  reservedQuantity: number    // somme des quantités réservées
  reserved: boolean           // true quand reservedQuantity >= quantity
  purchased: boolean
  order: number
  createdAt: number
}
