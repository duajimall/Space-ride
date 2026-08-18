'use client'

import { formatDuration } from '@/lib/clientAudio'

export type SongLite = {
  id: string
  cosmicName: string
  originalFilename: string
  durationSeconds: number | null
  publicUrl: string
}

export default function Tape({
  song,
  index,
  active,
  playing,
  onClick
}: {
  song: SongLite
  index: number
  active?: boolean
  playing?: boolean
  onClick?: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`group relative w-full text-left rounded-xl border transition-all duration-200 p-3
        ${active ? 'border-gold bg-panel shadow-[0_0_0_1px_#F2C879]' : 'border-white/10 bg-panel/60 hover:border-white/30'}`}
    >
      <div className="flex items-center justify-between text-[10px] font-mono text-muted tracking-wider mb-1.5">
        <span>№ {String(index + 1).padStart(3, '0')}</span>
        <span>{formatDuration(song.durationSeconds)}</span>
      </div>

      <svg viewBox="0 0 160 100" className="w-full h-auto rounded-md">
        <rect x="1" y="1" width="158" height="98" rx="6" fill="#1B2040" stroke="#333A66" strokeWidth="1" />
        <rect x="14" y="14" width="132" height="38" rx="3" fill="#0B0E1A" />
        <text
          x="80"
          y="35"
          textAnchor="middle"
          className="font-display"
          fill="#E9E4D6"
          fontSize="9.5"
        >
          {song.cosmicName}
        </text>
        <circle cx="46" cy="76" r="14" fill="#0B0E1A" stroke="#333A66" />
        <circle cx="114" cy="76" r="14" fill="#0B0E1A" stroke="#333A66" />
        <g className={playing ? 'reel reel-spin' : 'reel'} style={{ transformBox: 'fill-box' }}>
          <circle cx="46" cy="76" r="5" fill="#F2C879" />
          <rect x="45" y="66" width="2" height="6" fill="#F2C879" />
          <rect x="45" y="80" width="2" height="6" fill="#F2C879" />
        </g>
        <g className={playing ? 'reel reel-spin' : 'reel'} style={{ transformBox: 'fill-box' }}>
          <circle cx="114" cy="76" r="5" fill="#F2C879" />
          <rect x="113" y="66" width="2" height="6" fill="#F2C879" />
          <rect x="113" y="80" width="2" height="6" fill="#F2C879" />
        </g>
        <line x1="68" y1="76" x2="92" y2="76" stroke="#333A66" strokeWidth="2" />
      </svg>

      <div className="mt-1.5 truncate text-[10px] font-mono text-muted/70" title={song.originalFilename}>
        {song.originalFilename}
      </div>
    </button>
  )
}
