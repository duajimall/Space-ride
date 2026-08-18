import { S3Client, PutObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

function env(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing required env var: ${name}`)
  return v
}

export const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${env('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env('R2_ACCESS_KEY_ID'),
    secretAccessKey: env('R2_SECRET_ACCESS_KEY')
  }
})

export const BUCKET = () => env('R2_BUCKET_NAME')
export const PUBLIC_URL_BASE = () => env('R2_PUBLIC_URL').replace(/\/$/, '')

/** Returns a short-lived URL the browser can PUT the raw audio bytes to directly. */
export async function createUploadUrl(key: string, contentType: string) {
  const cmd = new PutObjectCommand({
    Bucket: BUCKET(),
    Key: key,
    ContentType: contentType
  })
  return getSignedUrl(s3, cmd, { expiresIn: 60 * 10 })
}

export function publicUrlFor(key: string) {
  return `${PUBLIC_URL_BASE()}/${key}`
}

export async function bucketIsReachable() {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: BUCKET() }))
    return true
  } catch {
    return false
  }
}
