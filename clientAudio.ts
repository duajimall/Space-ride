// Client-side helpers: content hashing (for de-dup) and duration probing.
// Both run entirely in the browser before a file is ever uploaded.

export async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  const digest = await crypto.subtle.digest('SHA-256', buffer)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function probeDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const audio = document.createElement('audio')
    const cleanup = () => URL.revokeObjectURL(url)
    audio.preload = 'metadata'
    audio.onloadedmetadata = () => {
      const d = Number.isFinite(audio.duration) ? Math.round(audio.duration) : null
      cleanup()
      resolve(d)
    }
    audio.onerror = () => {
      cleanup()
      resolve(null)
    }
    audio.src = url
  })
}

export function formatDuration(seconds?: number | null): string {
  if (!seconds && seconds !== 0) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}
