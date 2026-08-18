'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { hashFile, probeDuration } from '@/lib/clientAudio'

type FileStatus = 'queued' | 'hashing' | 'checking' | 'uploading' | 'saving' | 'done' | 'duplicate' | 'failed'

type QueueItem = {
  file: File
  status: FileStatus
  cosmicName?: string
  error?: string
}

const CONCURRENCY = 4

export default function OwnerUploader({ initialTotal }: { initialTotal: number }) {
  const [items, setItems] = useState<QueueItem[]>([])
  const [running, setRunning] = useState(false)
  const [total, setTotal] = useState(initialTotal)
  const inputRef = useRef<HTMLInputElement>(null)

  const summary = useMemo(() => {
    const imported = items.filter((i) => i.status === 'done').length
    const duplicates = items.filter((i) => i.status === 'duplicate').length
    const failed = items.filter((i) => i.status === 'failed').length
    const inProgress = items.filter((i) => !['done', 'duplicate', 'failed'].includes(i.status)).length
    return { imported, duplicates, failed, inProgress, total: items.length }
  }, [items])

  const updateItem = useCallback((idx: number, patch: Partial<QueueItem>) => {
    setItems((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], ...patch }
      return next
    })
  }, [])

  async function processOne(idx: number, file: File) {
    try {
      updateItem(idx, { status: 'hashing' })
      const [hash, durationSeconds] = await Promise.all([hashFile(file), probeDuration(file)])

      updateItem(idx, { status: 'checking' })
      const initRes = await fetch('/api/upload/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          hash,
          sizeBytes: file.size
        })
      })
      const initData = await initRes.json()
      if (!initRes.ok) throw new Error(initData.error || 'Could not prepare upload')

      if (initData.duplicate) {
        updateItem(idx, { status: 'duplicate', cosmicName: initData.existing?.cosmicName })
        return
      }

      updateItem(idx, { status: 'uploading' })
      const putRes = await fetch(initData.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'audio/mpeg' },
        body: file
      })
      if (!putRes.ok) throw new Error('Upload to storage failed')

      updateItem(idx, { status: 'saving' })
      const finalizeRes = await fetch('/api/upload/finalize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: initData.key,
          hash,
          originalFilename: file.name,
          sizeBytes: file.size,
          durationSeconds
        })
      })
      const finalizeData = await finalizeRes.json()
      if (!finalizeRes.ok) throw new Error(finalizeData.error || 'Could not save track')

      if (finalizeData.duplicate) {
        updateItem(idx, { status: 'duplicate', cosmicName: finalizeData.song?.cosmicName })
      } else {
        updateItem(idx, { status: 'done', cosmicName: finalizeData.song?.cosmicName })
        setTotal((t) => t + 1)
      }
    } catch (err: any) {
      updateItem(idx, { status: 'failed', error: err?.message ?? 'Unknown error' })
    }
  }

  async function startImport(files: File[]) {
    const queue: QueueItem[] = files.map((file) => ({ file, status: 'queued' }))
    setItems(queue)
    setRunning(true)

    let cursor = 0
    async function worker() {
      while (cursor < queue.length) {
        const myIndex = cursor
        cursor += 1
        await processOne(myIndex, queue[myIndex].file)
      }
    }
    await Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker))
    setRunning(false)
  }

  function onFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    const files = Array.from(fileList).filter((f) => f.type.startsWith('audio/') || /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(f.name))
    startImport(files)
  }

  const finished = items.length > 0 && !running

  return (
    <div className="rounded-2xl border border-white/10 bg-panel p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted">owner import</p>
          <h2 className="font-display text-2xl text-starlight">{total} tracks · a trip to the stars</h2>
        </div>
        <button
          disabled={running}
          onClick={() => inputRef.current?.click()}
          className="rounded-full bg-gold px-5 py-2 font-display text-sm text-void disabled:opacity-50"
        >
          {running ? 'importing…' : 'select ~300 songs'}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac"
          className="hidden"
          onChange={(e) => onFilesSelected(e.target.files)}
        />
      </div>

      {items.length > 0 && (
        <>
          <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gold transition-[width]"
              style={{
                width: `${((summary.imported + summary.duplicates + summary.failed) / summary.total) * 100}%`
              }}
            />
          </div>

          {finished && (
            <div className="mb-4 rounded-xl border border-white/10 bg-void/60 p-4 font-mono text-sm">
              <div className="text-starlight">Imported: {summary.imported}</div>
              <div className="text-muted">Duplicates skipped: {summary.duplicates}</div>
              <div className={summary.failed > 0 ? 'text-rose' : 'text-muted'}>Failed: {summary.failed}</div>
            </div>
          )}

          <div className="max-h-80 space-y-1 overflow-y-auto pr-1">
            {items.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-3 border-b border-white/5 py-1.5 font-mono text-xs">
                <span className="min-w-0 flex-1 truncate text-starlight/80">{item.file.name}</span>
                <span
                  className={
                    item.status === 'done'
                      ? 'text-gold'
                      : item.status === 'failed'
                      ? 'text-rose'
                      : item.status === 'duplicate'
                      ? 'text-muted'
                      : 'text-nebula'
                  }
                >
                  {item.status === 'done' && item.cosmicName ? item.cosmicName : item.status}
                  {item.status === 'failed' && item.error ? ` — ${item.error}` : ''}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
