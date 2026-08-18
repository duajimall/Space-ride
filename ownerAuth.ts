import { NextRequest } from 'next/server'
import { createHash } from 'crypto'

function expectedToken() {
  const password = process.env.OWNER_PASSWORD ?? ''
  const secret = process.env.OWNER_SECRET ?? ''
  return createHash('sha256').update(password + ':' + secret).digest('hex')
}

export function tokenForPassword(password: string) {
  const secret = process.env.OWNER_SECRET ?? ''
  return createHash('sha256').update(password + ':' + secret).digest('hex')
}

export function isOwnerRequest(req: NextRequest) {
  const cookie = req.cookies.get('owner_token')?.value
  if (!cookie) return false
  return cookie === expectedToken()
}
