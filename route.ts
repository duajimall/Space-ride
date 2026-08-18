import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createUploadUrl } from '@/lib/storage'
import { isOwnerRequest } from '@/lib/ownerAuth'

const ALLOWED_EXT = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac']

/**
 * Step 1 of import: client sends the file's hash + metadata.
 * We check for a duplicate by hash. If it's new, we hand back a
 * presigned URL the browser can upload the raw bytes to directly
 * (so a 300-file batch never round-trips through our own server).
 */
export async function POST(req: NextRequest) {
  if (!isOwnerRequest(req)) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 })
  }

  const { filename, contentType, hash, sizeBytes } = await req.json()

  if (!filename || !hash || !sizeBytes) {
    return NextResponse.json({ error: 'Missing filename, hash, or size' }, { status: 400 })
  }

  const ext = (filename.split('.').pop() || '').toLowerCase()
  if (!ALLOWED_EXT.includes(ext)) {
    return NextResponse.json({ error: `Unsupported file type: .${ext}` }, { status: 415 })
  }

  const existing = await db.song.findUnique({ where: { hash } })
  if (existing) {
    return NextResponse.json({ duplicate: true, existing: { cosmicName: existing.cosmicName } })
  }

  const key = `songs/${hash}.${ext}`
  const uploadUrl = await createUploadUrl(key, contentType || 'audio/mpeg')

  return NextResponse.json({ duplicate: false, uploadUrl, key })
}
