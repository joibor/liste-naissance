'use client'

import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { Item } from '@/lib/types'
import ReserveModal from './ReserveModal'

interface Props {
  item: Item
}

export default function ItemCard({ item }: Props) {
  const [showModal, setShowModal] = useState(false)

  const itemQty = item.quantity ?? 1
  const reservedQty = item.reservedQuantity ?? 0
  const remaining = itemQty - reservedQty
  const isFullyReserved = item.reserved || reservedQty >= itemQty
  const isUnavailable = isFullyReserved || item.purchased
  const isPartial = !isFullyReserved && reservedQty > 0
  const reservations = item.reservations ?? []

  return (
    <>
      <article
        className="item-card"
        onClick={() => !isUnavailable && setShowModal(true)}
        style={{
          position: 'relative',
          border: '1px solid var(--sand)',
          borderRadius: '10px',
          overflow: 'hidden',
          background: 'white',
          display: 'flex',
          flexDirection: 'column',
          cursor: isUnavailable ? 'default' : 'pointer',
          transition: 'border-color 0.2s ease',
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', overflow: 'hidden', background: '#f7f2ed', flexShrink: 0 }}>
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
              className="item-img"
              style={{
                width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                transition: 'transform 0.5s ease',
                filter: isUnavailable ? 'saturate(0.35) brightness(1.05)' : 'none',
              }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', color: 'var(--sand)' }}>
              ○
            </div>
          )}

          {/* Bandeau statut */}
          {(item.purchased || isFullyReserved) && (
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '10px',
              background: item.purchased ? 'var(--brown)' : 'var(--sage)',
              color: 'white',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              textAlign: 'center',
            }}>
              {item.purchased ? 'Acheté' : 'Complet'}
            </div>
          )}

          {/* Barre de progression partielle */}
          {isPartial && itemQty > 1 && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
              <div style={{ height: '4px', background: 'rgba(255,255,255,0.4)' }}>
                <div style={{ height: '100%', width: `${(reservedQty / itemQty) * 100}%`, background: 'var(--sage)', transition: 'width 0.3s' }} />
              </div>
            </div>
          )}
        </div>

        {/* Contenu */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, gap: '4px' }}>

          {item.brand && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '2px' }}>
              {item.brand.split(',').map((b) => b.trim()).filter(Boolean).map((b, i) => (
                <span key={i} style={{
                  fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--rose)', background: 'var(--rose-light)',
                  padding: '2px 7px', borderRadius: '4px',
                }}>
                  {b}
                </span>
              ))}
            </div>
          )}

          {/* Quantité souhaitée */}
          {itemQty > 1 && (
            <p style={{ fontSize: '11px', color: remaining === 0 ? 'var(--sage)' : remaining <= 2 ? 'var(--rose)' : '#aaa', fontWeight: 600, margin: 0 }}>
              {remaining === 0 ? `${itemQty} / ${itemQty} réservés` : `${remaining} restant${remaining > 1 ? 's' : ''} sur ${itemQty}`}
            </p>
          )}

          <h3 style={{
            fontFamily: 'var(--font-playfair)', fontSize: '15px', fontWeight: 600, lineHeight: 1.35,
            color: isUnavailable ? '#b5a89e' : 'var(--brown)', margin: 0,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {item.name}
          </h3>

          {item.note && (
            <p style={{
              fontSize: '12px', color: '#aaa', lineHeight: 1.5, margin: '2px 0 0',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {item.note}
            </p>
          )}

          {/* Lien boutique */}
          {item.shopUrl && (
            <div style={{ marginTop: '8px' }}>
              <a
                href={item.shopUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                title="Voir en boutique"
                className="shop-link"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#bbb', textDecoration: 'none' }}
              >
                <ExternalLink size={12} />
                Voir en boutique
              </a>
            </div>
          )}

          {/* Réservations empilées */}
          {reservations.length > 0 && (
            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--sand)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {reservations.map((r, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--sage)', fontWeight: 700, margin: 0 }}>
                      {r.name}
                    </p>
                    {itemQty > 1 && (
                      <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--sage)', background: 'var(--sage-light)', padding: '1px 6px', borderRadius: '3px', whiteSpace: 'nowrap' }}>
                        × {r.quantity}
                      </span>
                    )}
                  </div>
                  {r.message && (
                    <p style={{ fontSize: '12px', color: '#aaa', fontStyle: 'italic', margin: '1px 0 0', lineHeight: 1.4 }}>
                      « {r.message} »
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Bouton réserver */}
          {!isUnavailable && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowModal(true) }}
              className="reserve-btn"
              style={{
                marginTop: 'auto',
                paddingTop: '8px',
                width: '100%',
                height: '44px',
                border: `1px solid ${isPartial ? 'var(--sage)' : 'var(--brown)'}`,
                borderRadius: '6px',
                background: 'transparent',
                color: isPartial ? 'var(--sage)' : 'var(--brown)',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'background 0.18s ease, color 0.18s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isPartial ? `Réserver (${remaining} restant${remaining > 1 ? 's' : ''})` : 'Réserver'}
            </button>
          )}
        </div>
      </article>

      {showModal && <ReserveModal item={item} onClose={() => setShowModal(false)} />}

      <style>{`
        .item-card:hover { border-color: var(--brown-light); }
        .item-card:hover .item-img { transform: scale(1.03); }
        .reserve-btn:hover { background: var(--brown) !important; color: white !important; border-color: var(--brown) !important; }
        .shop-link:hover { color: var(--brown-light) !important; }
      `}</style>
    </>
  )
}
