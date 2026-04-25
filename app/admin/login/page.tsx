'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin() {
    if (!password) return
    setLoading(true)
    setError(false)

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/admin')
    } else {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: 'var(--cream)' }}>
      <div className="bg-white rounded-2xl p-8 w-full max-w-sm text-center" style={{ border: '1px solid var(--sand)' }}>
        <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: 'var(--font-playfair)', color: 'var(--brown)' }}>
          Espace admin
        </h1>
        <p className="text-sm mb-6" style={{ color: '#bbb' }}>Géraldine & Jonathan</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          placeholder="Mot de passe"
          autoFocus
          className="w-full border rounded-lg px-4 py-3 text-base mb-3 focus:outline-none"
          style={{ borderColor: error ? '#f0a0a0' : 'var(--sand)', fontSize: '16px' }}
        />
        {error && <p className="text-sm mb-3" style={{ color: '#e08080' }}>Mot de passe incorrect.</p>}
        <button
          onClick={handleLogin}
          disabled={!password || loading}
          style={{
            width: '100%', background: password ? 'var(--brown)' : '#ddd',
            color: 'white', padding: '13px', borderRadius: '6px',
            fontWeight: 600, fontSize: '14px', border: 'none',
            cursor: password && !loading ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            minHeight: '48px',
          }}
        >
          <Lock size={14} />
          {loading ? 'Vérification...' : 'Connexion'}
        </button>
      </div>
    </main>
  )
}
