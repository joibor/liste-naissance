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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }} className="admin-grid">
            {items.map((item, index) => (
              <div key={item.id} className="bg-white rounded-xl overflow-hidden" style={{ border: '1px solid var(--sand)', display: 'flex', flexDirection: 'column' }}>

                {/* Image */}
                <div style={{ position: 'relative', aspectRatio: '1', background: 'var(--cream)', flexShrink: 0 }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sand)', fontSize: '1.5rem' }}>○</div>
                  )}
                  {/* Badge statut */}
                  {item.purchased ? (
                    <span style={{ position: 'absolute', top: '7px', left: '7px', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'var(--brown)', color: 'white', padding: '3px 7px', borderRadius: '4px' }}>Acheté</span>
                  ) : item.reserved ? (
                    <span style={{ position: 'absolute', top: '7px', left: '7px', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', background: 'var(--sage)', color: 'white', padding: '3px 7px', borderRadius: '4px' }}>Réservé</span>
                  ) : null}
                  {/* Réordonner */}
                  <div style={{ position: 'absolute', top: '7px', right: '7px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    <button onClick={() => moveItem(index, -1)} disabled={index === 0} style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: '4px', background: 'rgba(255,255,255,0.85)', cursor: index === 0 ? 'default' : 'pointer', color: index === 0 ? '#ddd' : '#888' }}>
                      <ArrowUp size={11} />
                    </button>
                    <button onClick={() => moveItem(index, 1)} disabled={index === items.length - 1} style={{ width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', borderRadius: '4px', background: 'rgba(255,255,255,0.85)', cursor: index === items.length - 1 ? 'default' : 'pointer', color: index === items.length - 1 ? '#ddd' : '#888' }}>
                      <ArrowDown size={11} />
                    </button>
                  </div>
                </div>

                {/* Infos */}
                <div style={{ padding: '10px 10px 8px', flex: 1 }}>
                  {item.brand && (
                    <p style={{ fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--rose)', marginBottom: '2px' }}>{item.brand}</p>
                  )}
                  <p style={{ fontFamily: 'var(--font-playfair)', fontWeight: 700, color: 'var(--brown)', fontSize: '0.82rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name}</p>
                  <p style={{ fontSize: '0.65rem', color: '#bbb', marginTop: '3px' }}>{CATEGORIES.find((c) => c.value === item.category)?.label}</p>
                  {item.reserved && !item.purchased && item.reservedBy && (
                    <p style={{ fontSize: '0.65rem', color: 'var(--sage)', fontWeight: 600, marginTop: '2px' }}>→ {item.reservedBy}</p>
                  )}
                </div>

                {/* Barre d'actions */}
                <div style={{ borderTop: '1px solid var(--sand)', background: '#fdfaf7', display: 'flex', alignItems: 'stretch', marginTop: 'auto' }}>

                  {/* Modifier */}
                  <button onClick={() => startEdit(item)} title="Modifier" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 4px', background: 'none', border: 'none', borderRight: '1px solid var(--sand)', cursor: 'pointer', color: 'var(--brown)' }}>
                    <Pencil size={14} />
                  </button>

                  {/* Acheté */}
                  <button onClick={() => togglePurchased(item)} title={item.purchased ? 'Marquer disponible' : 'Marquer acheté'} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 4px', background: item.purchased ? 'var(--sage-light)' : 'none', border: 'none', borderRight: '1px solid var(--sand)', cursor: 'pointer', color: item.purchased ? '#3d6b4f' : '#bbb' }}>
                    <Check size={14} />
                  </button>

                  {/* Annuler réservation */}
                  {item.reserved && !item.purchased && (
                    confirmCancelReserv === item.id ? (
                      <>
                        <button onClick={() => handleCancelReservation(item.id)} title="Confirmer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 4px', background: '#fff4ec', border: 'none', borderRight: '1px solid var(--sand)', cursor: 'pointer', color: '#c07030' }}>
                          <Check size={14} />
                        </button>
                        <button onClick={() => setConfirmCancelReserv(null)} title="Annuler" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 4px', background: 'none', border: 'none', borderRight: '1px solid var(--sand)', cursor: 'pointer', color: '#bbb' }}>
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmCancelReserv(item.id)} title="Annuler la réservation" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 4px', background: 'none', border: 'none', borderRight: '1px solid var(--sand)', cursor: 'pointer', color: '#c07030' }}>
                        <Ban size={14} />
                      </button>
                    )
                  )}

                  {/* Supprimer */}
                  {confirmDelete === item.id ? (
                    <>
                      <button onClick={() => handleDelete(item.id)} title="Confirmer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 4px', background: '#fff0f0', border: 'none', borderRight: '1px solid #fdd', cursor: 'pointer', color: '#e55' }}>
                        <Check size={14} />
                      </button>
                      <button onClick={() => setConfirmDelete(null)} title="Annuler" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 4px', background: 'none', border: 'none', cursor: 'pointer', color: '#bbb' }}>
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setConfirmDelete(item.id)} title="Supprimer" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '9px 4px', background: 'none', border: 'none', cursor: 'pointer', color: '#e88' }}>
                      <Trash2 size={14} />
                    </button>
                  )}
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
