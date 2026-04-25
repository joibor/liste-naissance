'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Minus, Plus } from 'lucide-react'
import { Item } from '@/lib/types'
import { reserveItem } from '@/lib/items'

interface Props {
  item: Item
  onClose: () => void
}

export default function ReserveModal({ item, onClose }: Props) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [mounted, setMounted] = useState(false)

  const itemQty = item.quantity ?? 1
  const reservedQty = item.reservedQuantity ?? 0
  const remaining = itemQty - reservedQty
  const hasMultipleQty = itemQty > 1
  const existingReservations = item.reservations ?? []

  useEffect(() => { setMounted(true) }, [])
  useEffect(() => { setQty(Math.min(remaining, 1)) }, [remaining])

  async function handleReserve() {
    if (!name.trim() || qty < 1) return
    setLoading(true)
    await reserveItem(item.id, name.trim(), qty, message.trim(), existingReservations, itemQty)

    fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemName: item.name,
        reservedBy: name.trim(),
        quantity: qty,
        totalQuantity: itemQty,
        message: message.trim() || undefined,
      }),
    }).catch(() => {})

    setLoading(false)
    setDone(true)
  }

  if (!mounted) return null

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div className="absolute inset-0" style={{ background: 'rgba(60,35,20,0.4)', backdropFilter: 'blur(4px)' }} onClick={onClose} />

      <div
        className="relative w-full"
        style={{
          background: 'white',
          borderRadius: '12px',
          border: '1px solid var(--sand)',
          maxWidth: '480px',
          padding: '24px 24px 32px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '16px', right: '16px', color: '#bbb', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '8px', borderRadius: '4px' }}
        >
          <X size={18} />
        </button>

        {done ? (
          /* ── Confirmation ── */
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🎁</div>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '20px', fontWeight: 700, color: 'var(--brown)', marginBottom: '8px' }}>
              Merci {name} !
            </h2>
            <p style={{ fontSize: '14px', color: '#999', lineHeight: 1.6, marginBottom: '24px' }}>
              {hasMultipleQty
                ? <><strong style={{ color: 'var(--brown)' }}>{qty} × {item.name}</strong> ont bien été réservés.</>
                : <>Votre réservation pour <strong style={{ color: 'var(--brown)' }}>{item.name}</strong> a bien été enregistrée.</>
              }
              <br />Géraldine & Jonathan seront touchés par votre geste.
            </p>
            <button
              onClick={onClose}
              style={{ background: 'var(--brown)', color: 'white', padding: '12px 32px', borderRadius: '6px', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer', minHeight: '44px' }}
            >
              Fermer
            </button>
          </div>

        ) : (
          <>
            {/* En-tête article */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {item.imageUrl && (
                  <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--sand)' }}>
                    <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {item.brand && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginBottom: '2px' }}>
                      {item.brand.split(',').map((b) => b.trim()).filter(Boolean).map((b, i) => (
                        <span key={i} style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--rose)', background: 'var(--rose-light)', padding: '2px 6px', borderRadius: '4px' }}>
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                  <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '16px', fontWeight: 700, color: 'var(--brown)', margin: 0, lineHeight: 1.3 }}>
                    {item.name}
                  </h2>
                  {hasMultipleQty && (
                    <p style={{ fontSize: '12px', color: remaining <= 2 ? 'var(--rose)' : 'var(--sage)', fontWeight: 600, margin: '2px 0 0' }}>
                      {remaining} restant{remaining > 1 ? 's' : ''} sur {itemQty}
                    </p>
                  )}
                </div>
              </div>
              <div style={{ height: '1px', background: 'var(--sand)', marginTop: '16px' }} />
            </div>

            {/* Réservations existantes */}
            {existingReservations.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#bbb', marginBottom: '8px' }}>
                  Déjà réservé par
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {existingReservations.map((r, i) => (
                    <div key={i} style={{ background: 'var(--cream)', border: '1px solid var(--sand)', borderRadius: '8px', padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--brown)' }}>{r.name}</span>
                        {hasMultipleQty && (
                          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--sage)', background: 'var(--sage-light)', padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                            × {r.quantity}
                          </span>
                        )}
                      </div>
                      {r.message && (
                        <p style={{ fontSize: '13px', color: '#aaa', fontStyle: 'italic', margin: '4px 0 0', lineHeight: 1.5 }}>
                          « {r.message} »
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ height: '1px', background: 'var(--sand)', marginTop: '16px' }} />
              </div>
            )}

            {/* Formulaire */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Quantité */}
              {hasMultipleQty && (
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--brown)', marginBottom: '8px' }}>
                    Quantité souhaitée
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      disabled={qty <= 1}
                      style={{ width: '36px', height: '36px', borderRadius: '6px', border: '1px solid var(--sand)', background: 'white', cursor: qty <= 1 ? 'not-allowed' : 'pointer', color: qty <= 1 ? '#ddd' : 'var(--brown)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    >
                      <Minus size={14} />
                    </button>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-playfair)', fontSize: '22px', fontWeight: 700, color: 'var(--brown)' }}>{qty}</span>
                      <span style={{ fontSize: '13px', color: '#bbb', marginLeft: '6px' }}>/ {remaining} dispo</span>
                    </div>
                    <button
                      onClick={() => setQty((q) => Math.min(remaining, q + 1))}
                      disabled={qty >= remaining}
                      style={{ width: '36px', height: '36px', borderRadius: '6px', border: '1px solid var(--sand)', background: 'white', cursor: qty >= remaining ? 'not-allowed' : 'pointer', color: qty >= remaining ? '#ddd' : 'var(--brown)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  {remaining > 1 && (
                    <button
                      onClick={() => setQty(remaining)}
                      style={{ marginTop: '8px', width: '100%', padding: '8px', border: '1px dashed var(--sand)', borderRadius: '6px', background: 'none', color: '#aaa', fontSize: '12px', cursor: 'pointer' }}
                    >
                      Prendre les {remaining} restants
                    </button>
                  )}
                </div>
              )}

              {/* Prénom */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--brown)', marginBottom: '8px' }}>
                  Votre prénom *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Marie"
                  autoFocus
                  style={{ width: '100%', border: '1px solid var(--sand)', borderRadius: '6px', padding: '12px 14px', fontSize: '16px', outline: 'none', fontFamily: 'var(--font-lato)', color: 'var(--text)', minHeight: '48px', boxSizing: 'border-box' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--brown)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--sand)'}
                />
              </div>

              {/* Message */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--brown)', marginBottom: '8px' }}>
                  Message <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#bbb', fontSize: '12px' }}>optionnel</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hâte de vous l'offrir !"
                  rows={3}
                  maxLength={150}
                  style={{ width: '100%', border: '1px solid var(--sand)', borderRadius: '6px', padding: '12px 14px', fontSize: '16px', outline: 'none', fontFamily: 'var(--font-lato)', color: 'var(--text)', resize: 'none', lineHeight: 1.5, boxSizing: 'border-box' }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--brown)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--sand)'}
                />
                <p style={{ fontSize: '11px', color: '#ccc', marginTop: '4px', textAlign: 'right' }}>
                  {message.length}/150
                </p>
              </div>

              <button
                onClick={handleReserve}
                disabled={!name.trim() || loading}
                style={{
                  width: '100%',
                  background: name.trim() ? 'var(--brown)' : '#ddd',
                  color: 'white',
                  padding: '14px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '14px',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  border: 'none',
                  minHeight: '48px',
                  cursor: name.trim() && !loading ? 'pointer' : 'not-allowed',
                  transition: 'background 0.18s',
                }}
              >
                {loading ? 'Enregistrement...' : hasMultipleQty ? `Réserver ${qty} article${qty > 1 ? 's' : ''}` : 'Réserver cet article'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}
