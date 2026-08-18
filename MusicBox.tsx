'use client'

import { useEffect, useMemo, useState } from 'react'
import Tape, { SongLite } from './Tape'
import Player from './Player'

export default function MusicBox() {
  const [open, setOpen] = useState(false)
  const [songs, setSongs] = useState<SongLite[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    fetch('/api/songs')
      .then((r) => r.json())
      .then((d) => setSongs(d.songs ?? []))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return songs
    const q = query.toLowerCase()
    return songs.filter(
      (s) => s.cosmicName.toLowerCase().includes(q) || s.originalFilename.toLowerCase().includes(q)
    )
  }, [songs, query])

  const activeSong = songs.find((s) => s.id === activeId) ?? null
  const activeIndexInFiltered = filtered.findIndex((s) => s.id === activeId)

  function playSong(id: string) {
    if (id === activeId) {
      setPlaying((p) => !p)
    } else {
      setActiveId(id)
      setPlaying(true)
    }
  }

  function step(delta: number) {
    if (filtered.length === 0) return
    const nextIndex = ((activeIndexInFiltered < 0 ? 0 : activeIndexInFiltered) + delta + filtered.length) % filtered.length
    setActiveId(filtered[nextIndex].id)
    setPlaying(true)
  }

  if (!open) {
    return (
      <div className="starfield relative flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-muted">
          {loading ? 'counting the stars…' : `${songs.length} tracks · a trip to the stars`}
        </p>
        <h1 className="mb-8 font-display text-4xl text-starlight sm:text-5xl">the music box</h1>
        <button
          onClick={() => setOpen(true)}
          className="animate-drift rounded-full border border-gold/60 bg-panel px-8 py-3 font-display text-lg text-gold transition hover:bg-gold hover:text-void"
        >
          open the music box
        </button>
      </div>
    )
  }

  return (
    <div className="starfield min-h-screen px-4 pb-28 pt-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">
              {songs.length} tracks · a trip to the stars
            </p>
            <h1 className="font-display text-2xl text-starlight sm:text-3xl">choose a tape</h1>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="search the stars…"
            className="w-full max-w-xs rounded-full border border-white/15 bg-panel px-4 py-2 text-sm text-starlight placeholder:text-muted focus:border-gold focus:outline-none sm:w-64"
          />
        </div>

        {loading ? (
          <p className="font-mono text-sm text-muted">loading tapes…</p>
        ) : filtered.length === 0 ? (
          <p className="font-mono text-sm text-muted">no tapes match "{query}".</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filtered.map((s, i) => (
              <Tape
                key={s.id}
                song={s}
                index={i}
                active={s.id === activeId}
                playing={s.id === activeId && playing}
                onClick={() => playSong(s.id)}
              />
            ))}
          </div>
        )}
      </div>

      <Player
        song={activeSong}
        playing={playing}
        onTogglePlay={() => setPlaying((p) => !p)}
        onNext={() => step(1)}
        onPrev={() => step(-1)}
      />
    </div>
  )
}
