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

export interface Item {
  id: string
  name: string
  brand?: string
  category: Category
  imageUrl?: string
  shopUrl?: string
  note?: string
  reserved: boolean
  reservedBy?: string
  reservedMessage?: string
  purchased: boolean
  order: number
  createdAt: number
}
