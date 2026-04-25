'use client'

import { useEffect, useState } from 'react'
import { subscribeToItems } from '@/lib/items'
import { Item, CATEGORIES } from '@/lib/types'
import ItemCard from '@/components/ItemCard'

export default function Home() {
  const [items, setItems] = useState<Item[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = subscribeToItems((data) => {
      setItems(data)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const filtered = activeCategory === 'all' ? items : items.filter((i) => i.category === activeCategory)
  const total = items.length
  const reserved = items.filter((i) => i.reserved || i.purchased).length
  const available = total - reserved

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'var(--cream)', position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto' }}>

      {/* Header */}
      <header className="text-center px-4 pt-12 pb-10 md:pt-16 md:pb-14">
        <div className="flex items-center justify-center gap-4 mb-7">
          <div style={{ height: '1px', width: '40px', background: 'var(--sand)' }} />
          <span style={{ fontSize: '0.62rem', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--brown-light)', fontFamily: 'var(--font-lato)' }}>
            Liste de naissance
          </span>
          <div style={{ height: '1px', width: '40px', background: 'var(--sand)' }} />
        </div>

        <h1 className="mb-3" style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(2.2rem, 8vw, 3.8rem)',
          fontWeight: 700,
          color: 'var(--brown)',
          lineHeight: 1.1,
          letterSpacing: '-0.01em',
        }}>
          Géraldine<br />& Jonathan
        </h1>

        <p className="mx-auto mb-3" style={{
          fontSize: 'clamp(0.8rem, 2.2vw, 0.88rem)',
          color: 'var(--brown-light)',
          letterSpacing: '0.03em',
          maxWidth: '340px',
          lineHeight: 1.7,
          fontStyle: 'italic',
          fontFamily: 'var(--font-playfair)',
        }}>
          Un bébé est en chemin…
        </p>

        <p className="mx-auto mb-8" style={{
          fontSize: 'clamp(0.75rem, 2vw, 0.82rem)',
          color: '#bbb',
          letterSpacing: '0.03em',
          maxWidth: '360px',
          lineHeight: 1.8,
          fontFamily: 'var(--font-lato)',
        }}>
          Rendez-vous le <strong style={{ color: 'var(--brown-light)', fontWeight: 600 }}>28 juin 2026</strong> pour découvrir si c'est une petite fille ou un petit garçon.
        </p>

        {!loading && (
          <div className="inline-flex items-center" style={{ border: '1px solid var(--sand)', borderRadius: '999px', background: 'white' }}>
            <div className="text-center px-5 py-2.5">
              <p style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)', fontWeight: 700, color: 'var(--brown)', fontFamily: 'var(--font-playfair)', lineHeight: 1 }}>{total}</p>
              <p style={{ fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#bbb', marginTop: '3px' }}>articles</p>
            </div>
            <div style={{ width: '1px', height: '28px', background: 'var(--sand)' }} />
            <div className="text-center px-5 py-2.5">
              <p style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)', fontWeight: 700, color: 'var(--sage)', fontFamily: 'var(--font-playfair)', lineHeight: 1 }}>{reserved}</p>
              <p style={{ fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#bbb', marginTop: '3px' }}>réservés</p>
            </div>
            <div style={{ width: '1px', height: '28px', background: 'var(--sand)' }} />
            <div className="text-center px-5 py-2.5">
              <p style={{ fontSize: 'clamp(1rem, 3vw, 1.2rem)', fontWeight: 700, color: 'var(--rose)', fontFamily: 'var(--font-playfair)', lineHeight: 1 }}>{available}</p>
              <p style={{ fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#bbb', marginTop: '3px' }}>disponibles</p>
            </div>
          </div>
        )}
      </header>

      {/* Séparateur */}
      <div className="px-4">
        <div className="mx-auto" style={{ maxWidth: '1200px', height: '1px', background: 'linear-gradient(to right, transparent, var(--sand), transparent)' }} />
      </div>

      {/* Filtres */}
      <div className="sticky top-0 z-10" style={{
        background: 'rgba(253,248,243,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--sand)',
      }}>
        <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'none', paddingLeft: '20px', paddingRight: '20px' }}>
          <FilterTab active={activeCategory === 'all'} onClick={() => setActiveCategory('all')}>
            Tout <span style={{ opacity: 0.5 }}>({total})</span>
          </FilterTab>
          {CATEGORIES.map((cat) => {
            const count = items.filter((i) => i.category === cat.value).length
            if (count === 0) return null
            return (
              <FilterTab key={cat.value} active={activeCategory === cat.value} onClick={() => setActiveCategory(cat.value)}>
                {cat.label} <span style={{ opacity: 0.5 }}>({count})</span>
              </FilterTab>
            )
          })}
        </div>
      </div>

      {/* Grille */}
      <div style={{ padding: '16px 12px 64px' }}>
        {loading ? (
          <div className="card-grid">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{ borderRadius: '8px', overflow: 'hidden', background: 'white', border: '1px solid var(--sand)' }}>
                <div className="skeleton" style={{ aspectRatio: '1/1', width: '100%' }} />
                <div style={{ padding: '12px 13px', display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  <div className="skeleton" style={{ height: '8px', width: '40%' }} />
                  <div className="skeleton" style={{ height: '12px', width: '75%' }} />
                  <div className="skeleton" style={{ height: '12px', width: '55%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p style={{ color: '#c0b0a8', fontSize: '0.85rem', letterSpacing: '0.04em' }}>Aucun article dans cette catégorie.</p>
          </div>
        ) : (
          <div className="card-grid">
            {filtered.map((item, i) => (
              <div key={item.id} className="item-appear" style={{ animationDelay: `${Math.min(i * 50, 350)}ms` }}>
                <ItemCard item={item} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="text-center px-4 py-8" style={{ borderTop: '1px solid var(--sand)' }}>
        <div className="flex items-center justify-center gap-4 mb-3">
          <div style={{ height: '1px', width: '28px', background: 'var(--sand)' }} />
          <span style={{ fontSize: '0.72rem', letterSpacing: '0.04em', color: '#ccc' }}>Fait par ❤️ par Géraldine et Jonathan</span>
          <div style={{ height: '1px', width: '28px', background: 'var(--sand)' }} />
        </div>
        <a href="/admin" style={{ fontSize: '0.68rem', color: '#d0c8c2', letterSpacing: '0.1em', textTransform: 'uppercase', textDecoration: 'none' }}>
          Admin
        </a>
      </footer>
    </main>
  )
}

function FilterTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        flexShrink: 0,
        padding: '14px 18px',
        background: 'none',
        border: 'none',
        borderBottom: active ? '2px solid var(--brown)' : '2px solid transparent',
        fontSize: '14px',
        fontWeight: active ? 600 : 400,
        color: active ? 'var(--brown)' : '#aaa',
        cursor: 'pointer',
        transition: 'color 0.18s ease, border-color 0.18s ease',
        whiteSpace: 'nowrap',
        letterSpacing: active ? '0.01em' : 0,
      }}
    >
      {children}
    </button>
  )
}
