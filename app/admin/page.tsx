'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { subscribeToItems, addItem, updateItem, deleteItem, cancelReservation } from '@/lib/items'
import { Item, CATEGORIES, Category } from '@/lib/types'
import { Pencil, Trash2, Check, X, Plus, ArrowUp, ArrowDown, Ban } from 'lucide-react'

const emptyForm = {
  name: '',
  brand: '',
  category: 'autre' as Category,
  imageUrl: '',
  shopUrl: '',
  note: '',
}

export default function AdminPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [confirmCancelReserv, setConfirmCancelReserv] = useState<string | null>(null)
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  useEffect(() => {
    const unsub = subscribeToItems((data) => {
      setItems(data)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  function startAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function startEdit(item: Item) {
    setEditingId(item.id)
    setForm({
      name: item.name,
      brand: item.brand ?? '',
      category: item.category,
      imageUrl: item.imageUrl ?? '',
      shopUrl: item.shopUrl ?? '',
      note: item.note ?? '',
    })
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelForm() {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  async function handleSave() {
    if (!form.name.trim()) return
    setSaving(true)
    const raw: Record<string, unknown> = {
      name: form.name.trim(),
      category: form.category,
    }
    if (form.brand.trim()) raw.brand = form.brand.trim()
    if (form.imageUrl.trim()) raw.imageUrl = form.imageUrl.trim()
    if (form.shopUrl.trim()) raw.shopUrl = form.shopUrl.trim()
    if (form.note.trim()) raw.note = form.note.trim()
    const data = raw as Partial<Item>
    if (editingId) {
      await updateItem(editingId, data)
    } else {
      const maxOrder = items.length > 0 ? Math.max(...items.map((i) => i.order)) : -1
      await addItem({
        ...data,
        reserved: false,
        purchased: false,
        order: maxOrder + 1,
        createdAt: Date.now(),
      } as Omit<Item, 'id'>)
    }
    setSaving(false)
    cancelForm()
  }

  async function handleDelete(id: string) {
    await deleteItem(id)
    setConfirmDelete(null)
  }

  async function handleCancelReservation(id: string) {
    await cancelReservation(id)
    setConfirmCancelReserv(null)
  }

  async function togglePurchased(item: Item) {
    await updateItem(item.id, { purchased: !item.purchased })
  }

  async function moveItem(index: number, direction: -1 | 1) {
    const target = items[index + direction]
    const current = items[index]
    if (!target) return
    await Promise.all([
      updateItem(current.id, { order: target.order }),
      updateItem(target.id, { order: current.order }),
    ])
  }

  function exportCSV() {
    const header = ['Nom', 'Marque', 'Catégorie', 'Réservé par', 'Message', 'Acheté']
    const rows = items.map((i) => [
      i.name,
      i.brand ?? '',
      i.category,
      i.reservedBy ?? '',
      i.reservedMessage ?? '',
      i.purchased ? 'Oui' : 'Non',
    ])
    const csv = [header, ...rows].map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'liste-naissance.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const reservedCount = items.filter((i) => i.reserved || i.purchased).length

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--cream)' }}>
      {/* Header */}
      <header className="px-4 py-6" style={{ borderBottom: '1px solid var(--sand)', background: 'white' }}>
        <div className="mx-auto" style={{ maxWidth: '800px' }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="font-bold" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brown)', fontSize: 'clamp(1.1rem, 4vw, 1.4rem)' }}>
                Admin · Liste de naissance
              </h1>
              <p className="text-xs mt-0.5" style={{ color: '#bbb' }}>
                {items.length} articles · {reservedCount} réservés
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button onClick={exportCSV} style={{ border: '1px solid var(--sand)', color: 'var(--brown)', background: 'white', padding: '7px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                CSV
              </button>
              <button onClick={handleLogout} style={{ border: '1px solid var(--sand)', color: '#aaa', background: 'white', padding: '7px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Déconnexion
              </button>
              <button onClick={startAdd} style={{ background: 'var(--brown)', color: 'white', padding: '7px 14px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                <Plus size={13} /> Ajouter
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto px-4 py-5 pb-16" style={{ maxWidth: '800px' }}>

        {/* Formulaire add/edit */}
        {showForm && (
          <div className="bg-white rounded-xl p-5 mb-5" style={{ border: '1px solid var(--sand)' }}>
            <h2 className="font-semibold mb-4" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brown)', fontSize: '1.05rem' }}>
              {editingId ? 'Modifier l\'article' : 'Nouvel article'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--brown)' }}>Nom *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Transat bébé" maxLength={60} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ borderColor: 'var(--sand)' }} />
                <p style={{ fontSize: '11px', color: '#ccc', marginTop: '3px', textAlign: 'right' }}>{form.name.length}/60</p>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--brown)' }}>
                  Marque(s) <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '0.7rem', color: '#bbb' }}>— séparées par virgule</span>
                </label>
                <input type="text" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="Cybex, Babymoov" maxLength={40} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ borderColor: 'var(--sand)' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--brown)' }}>Catégorie</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none bg-white" style={{ borderColor: 'var(--sand)' }}>
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--brown)' }}>Image <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '0.7rem', color: '#bbb' }}>— URL</span></label>
                <input type="url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ borderColor: 'var(--sand)' }} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--brown)' }}>URL boutique</label>
                <input type="url" value={form.shopUrl} onChange={(e) => setForm({ ...form, shopUrl: e.target.value })} placeholder="https://amazon.fr/..." className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none" style={{ borderColor: 'var(--sand)' }} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--brown)' }}>Note</label>
                <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Taille 6 mois de préférence..." maxLength={120} rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none resize-none" style={{ borderColor: 'var(--sand)' }} />
                <p style={{ fontSize: '11px', color: '#ccc', marginTop: '3px', textAlign: 'right' }}>{form.note.length}/120</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4 justify-end">
              <button onClick={cancelForm} style={{ border: '1px solid var(--sand)', color: '#888', padding: '7px 16px', borderRadius: '6px', fontSize: '0.82rem', cursor: 'pointer', background: 'white' }}>
                Annuler
              </button>
              <button onClick={handleSave} disabled={!form.name.trim() || saving} style={{ background: form.name.trim() ? 'var(--brown)' : '#ddd', color: 'white', padding: '7px 16px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600, border: 'none', cursor: form.name.trim() && !saving ? 'pointer' : 'not-allowed' }}>
                {saving ? 'Enregistrement...' : editingId ? 'Mettre à jour' : 'Ajouter'}
              </button>
            </div>
          </div>
        )}

        {/* Liste */}
        {loading ? (
          <div className="text-center py-16" style={{ color: '#bbb', fontSize: '0.85rem' }}>Chargement...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-16" style={{ color: '#bbb', fontSize: '0.85rem' }}>Aucun article.</div>
        ) : (
          <div className="space-y-2.5">
            {items.map((item, index) => (
              <div key={item.id} className="bg-white rounded-xl p-3 flex gap-3 items-start" style={{ border: '1px solid var(--sand)' }}>

                {/* Photo */}
                <div className="rounded-lg overflow-hidden flex-shrink-0" style={{ width: '52px', height: '52px', background: 'var(--cream)' }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--sand)', fontSize: '1.2rem' }}>○</div>
                  )}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div className="min-w-0">
                      {item.brand && <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--rose)', fontSize: '0.62rem' }}>{item.brand}</p>}
                      <p className="font-semibold text-sm truncate" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brown)' }}>{item.name}</p>
                      <p className="text-xs" style={{ color: '#bbb' }}>
                        {CATEGORIES.find((c) => c.value === item.category)?.label}
                      </p>
                    </div>

                    {/* Statut réservation */}
                    <div className="flex-shrink-0 text-right">
                      {item.purchased ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: 'var(--sand)', color: 'var(--brown)', fontSize: '0.68rem' }}>Acheté</span>
                      ) : item.reserved ? (
                        <div>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: 'var(--sage-light)', color: '#3d6b4f', fontSize: '0.68rem' }}>Réservé</span>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--sage)', fontWeight: 600 }}>{item.reservedBy}</p>
                          {item.reservedMessage && <p className="text-xs italic" style={{ color: '#bbb', maxWidth: '120px' }}>« {item.reservedMessage} »</p>}
                        </div>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--rose-light)', color: 'var(--rose)', fontSize: '0.68rem' }}>Disponible</span>
                      )}
                    </div>
                  </div>
                  {item.note && <p className="text-xs mt-1 truncate" style={{ color: '#ccc' }}>{item.note}</p>}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button onClick={() => startEdit(item)} title="Modifier" style={{ padding: '5px', border: '1px solid var(--sand)', borderRadius: '6px', background: 'white', cursor: 'pointer', color: 'var(--brown)', display: 'flex' }}>
                    <Pencil size={13} />
                  </button>

                  <button
                    onClick={() => togglePurchased(item)}
                    title={item.purchased ? 'Marquer disponible' : 'Marquer acheté'}
                    style={{ padding: '5px', border: '1px solid var(--sand)', borderRadius: '6px', background: item.purchased ? 'var(--sage-light)' : 'white', cursor: 'pointer', color: item.purchased ? '#3d6b4f' : '#bbb', display: 'flex' }}
                  >
                    <Check size={13} />
                  </button>

                  {/* Annuler réservation */}
                  {item.reserved && !item.purchased && (
                    confirmCancelReserv === item.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => handleCancelReservation(item.id)} title="Confirmer annulation" style={{ padding: '5px', background: '#fff0e8', border: '1px solid #f0c8a0', borderRadius: '6px', cursor: 'pointer', color: '#c07030', display: 'flex' }}>
                          <Check size={13} />
                        </button>
                        <button onClick={() => setConfirmCancelReserv(null)} title="Annuler" style={{ padding: '5px', border: '1px solid var(--sand)', borderRadius: '6px', background: 'white', cursor: 'pointer', color: '#bbb', display: 'flex' }}>
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setConfirmCancelReserv(item.id)} title="Annuler la réservation" style={{ padding: '5px', border: '1px solid #f0c8a0', borderRadius: '6px', background: 'white', cursor: 'pointer', color: '#c07030', display: 'flex' }}>
                        <Ban size={13} />
                      </button>
                    )
                  )}

                  {/* Supprimer */}
                  {confirmDelete === item.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleDelete(item.id)} title="Confirmer suppression" style={{ padding: '5px', background: '#fdd', border: '1px solid #fbb', borderRadius: '6px', cursor: 'pointer', color: '#e55', display: 'flex' }}>
                        <Check size={13} />
                      </button>
                      <button onClick={() => setConfirmDelete(null)} title="Annuler" style={{ padding: '5px', border: '1px solid var(--sand)', borderRadius: '6px', background: 'white', cursor: 'pointer', color: '#bbb', display: 'flex' }}>
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setConfirmDelete(item.id)} title="Supprimer" style={{ padding: '5px', border: '1px solid #fdd', borderRadius: '6px', background: 'white', cursor: 'pointer', color: '#e88', display: 'flex' }}>
                      <Trash2 size={13} />
                    </button>
                  )}

                  <button onClick={() => moveItem(index, -1)} disabled={index === 0} title="Monter" style={{ padding: '5px', border: '1px solid var(--sand)', borderRadius: '6px', background: 'white', cursor: index === 0 ? 'default' : 'pointer', color: index === 0 ? '#e0d8d0' : 'var(--brown)', display: 'flex' }}>
                    <ArrowUp size={13} />
                  </button>
                  <button onClick={() => moveItem(index, 1)} disabled={index === items.length - 1} title="Descendre" style={{ padding: '5px', border: '1px solid var(--sand)', borderRadius: '6px', background: 'white', cursor: index === items.length - 1 ? 'default' : 'pointer', color: index === items.length - 1 ? '#e0d8d0' : 'var(--brown)', display: 'flex' }}>
                    <ArrowDown size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="text-center py-6" style={{ borderTop: '1px solid var(--sand)' }}>
        <a href="/" style={{ fontSize: '0.72rem', color: '#ccc', letterSpacing: '0.08em', textDecoration: 'none' }}>
          ← Retour à la liste
        </a>
      </footer>
    </main>
  )
}
