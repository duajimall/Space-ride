'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function OwnerLoginForm() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/owner/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    })
    setLoading(false)
    if (res.ok) {
      router.refresh()
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error || 'Incorrect password')
    }
  }

  return (
    <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-white/10 bg-panel p-6">
      <p className="mb-1 font-mono text-xs uppercase tracking-[0.3em] text-muted">owner access</p>
      <h1 className="mb-4 font-display text-2xl text-starlight">enter the music box</h1>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
        className="mb-3 w-full rounded-lg border border-white/15 bg-void px-3 py-2 text-sm text-starlight focus:border-gold focus:outline-none"
      />
      {error && <p className="mb-3 text-xs text-rose">{error}</p>}
      <button
        disabled={loading}
        className="w-full rounded-full bg-gold py-2 font-display text-sm text-void disabled:opacity-50"
      >
        {loading ? 'checking…' : 'unlock'}
      </button>
    </form>
  )
}
