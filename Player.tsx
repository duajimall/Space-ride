'use client'

import { useEffect, useRef, useState } from 'react'
import { formatDuration } from '@/lib/clientAudio'
import type { SongLite } from './Tape'

export default function Player({
  song,
  playing,
  onTogglePlay,
  onNext,
  onPrev
}: {
  song: SongLite | null
  playing: boolean
  onTogglePlay: () => void
  onNext: () => void
  onPrev: () => void
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const el = audioRef.current
    if (!el || !song) return
    if (playing) el.play().catch(() => {})
    else el.pause()
  }, [playing, song])

  if (!song) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-panel/95 backdrop-blur px-4 py-3 sm:px-6">
      <audio
        ref={audioRef}
        src={song.publicUrl}
        autoPlay={playing}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={onNext}
      />
      <div className="mx-auto flex max-w-3xl items-center gap-4">
        <div className="min-w-0 flex-1">
          <div className="truncate font-display text-sm text-starlight">{song.cosmicName}</div>
          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gold transition-[width]"
              style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }}
            />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3 font-mono text-xs text-muted">
          <button onClick={onPrev} aria-label="Previous tape" className="hover:text-starlight">⏮</button>
          <button
            onClick={onTogglePlay}
            aria-label={playing ? 'Pause' : 'Play'}
            className="grid h-9 w-9 place-items-center rounded-full bg-gold text-void hover:brightness-110"
          >
            {playing ? '❚❚' : '▶'}
          </button>
          <button onClick={onNext} aria-label="Next tape" className="hover:text-starlight">⏭</button>
          <span className="w-16 text-right">{formatDuration(Math.floor(progress))} / {formatDuration(Math.floor(duration))}</span>
        </div>
      </div>
    </div>
  )
}
