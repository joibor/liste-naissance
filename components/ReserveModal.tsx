'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Item } from '@/lib/types'
import { reserveItem } from '@/lib/items'

interface Props {
  item: Item
  onClose: () => void
}

export default function ReserveModal({ item, onClose }: Props) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  async function handleReserve() {
    if (!name.trim()) return
    setLoading(true)
    await reserveItem(item.id, name.trim(), message.trim())

    // Notification email en arrière-plan (non bloquant)
    fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemName: item.name,
        reservedBy: name.trim(),
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
        }}
      >
        {/* Fermer */}
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
              Votre réservation pour <strong style={{ color: 'var(--brown)' }}>{item.name}</strong> a bien été enregistrée.
              Géraldine & Jonathan seront touchés par votre geste.
            </p>
            <button
              onClick={onClose}
              style={{ background: 'var(--brown)', color: 'white', padding: '12px 32px', borderRadius: '6px', fontWeight: 600, fontSize: '14px', border: 'none', cursor: 'pointer', minHeight: '44px' }}
            >
              Fermer
            </button>
          </div>

        ) : item.reserved ? (
          /* ── Déjà réservé ── */
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '20px', fontWeight: 700, color: 'var(--brown)', marginBottom: '8px' }}>
              Déjà réservé
            </h2>
            <p style={{ fontSize: '14px', color: '#999', marginBottom: '4px' }}>
              <strong style={{ color: 'var(--brown)' }}>{item.reservedBy}</strong> a réservé cet article.
            </p>
            {item.reservedMessage && (
              <p style={{ fontSize: '14px', color: '#bbb', fontStyle: 'italic', marginBottom: '8px' }}>
                « {item.reservedMessage} »
              </p>
            )}
            <p style={{ fontSize: '13px', color: '#ccc', lineHeight: 1.6, margin: '16px 0 24px' }}>
              Vous avez réservé cet article par erreur ? <br />
              Contactez-nous et nous nous en occuperons.
            </p>
            <button
              onClick={onClose}
              style={{ border: '1px solid var(--sand)', color: 'var(--brown)', padding: '12px 32px', borderRadius: '6px', fontSize: '14px', cursor: 'pointer', background: 'white', minHeight: '44px' }}
            >
              Fermer
            </button>
          </div>

        ) : (
          /* ── Formulaire ── */
          <>
            {/* En-tête article */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {item.imageUrl && (
                  <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, border: '1px solid var(--sand)' }}>
                    <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div>
                  {item.brand && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginBottom: '2px' }}>
                      {item.brand.split(',').map((b) => b.trim()).filter(Boolean).map((b, i) => (
                        <span key={i} style={{
                          fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                          color: 'var(--rose)', background: 'var(--rose-light)',
                          padding: '2px 6px', borderRadius: '4px',
                        }}>
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                  <h2 style={{ fontFamily: 'var(--font-playfair)', fontSize: '16px', fontWeight: 700, color: 'var(--brown)', margin: 0, lineHeight: 1.3 }}>
                    {item.name}
                  </h2>
                </div>
              </div>
              <div style={{ height: '1px', background: 'var(--sand)', marginTop: '16px' }} />
            </div>

            {/* Champs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                  style={{
                    width: '100%', border: '1px solid var(--sand)', borderRadius: '6px',
                    padding: '12px 14px', fontSize: '16px', outline: 'none',
                    fontFamily: 'var(--font-lato)', color: 'var(--text)',
                    minHeight: '48px', transition: 'border-color 0.15s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--brown)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--sand)'}
                />
              </div>

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
                  style={{
                    width: '100%', border: '1px solid var(--sand)', borderRadius: '6px',
                    padding: '12px 14px', fontSize: '16px', outline: 'none',
                    fontFamily: 'var(--font-lato)', color: 'var(--text)',
                    resize: 'none', lineHeight: 1.5, transition: 'border-color 0.15s',
                    boxSizing: 'border-box',
                  }}
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
                {loading ? 'Enregistrement...' : 'Réserver cet article'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  )
}
