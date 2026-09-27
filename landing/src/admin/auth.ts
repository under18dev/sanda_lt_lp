import { deleteCookie, getCookie, setCookie } from 'hono/cookie'
import type { Context } from 'hono'
import { randomUUID } from 'node:crypto'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { db } from '../data/runtime'

const cookieName = 'sanda_admin'
const attempts = new Map<string, { count: number; resetAt: number }>()
const secret = () => process.env.SESSION_SECRET ?? ''
const signedCookie = (id: string) => `${id}.${createHmac('sha256', secret()).update(id).digest('hex')}`
const cookieId = (value: string | undefined) => {
  if (!value || !secret()) return undefined
  const [id, signature] = value.split('.')
  if (!id || !signature) return undefined
  const expected = createHmac('sha256', secret()).update(id).digest('hex')
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return undefined
  return id
}

export const issueCsrf = () => randomUUID()

export const login = async (c: Context, password: string) => {
  const address = c.req.header('x-forwarded-for') ?? 'unknown'
  const now = Date.now()
  const state = attempts.get(address)
  if (state && state.resetAt > now && state.count >= 5) return false
  const valid = Boolean(process.env.ADMIN_PASSWORD_HASH && secret()) && await Bun.password.verify(password, process.env.ADMIN_PASSWORD_HASH ?? '')
  if (!valid) {
    const next = state && state.resetAt > now ? { count: state.count + 1, resetAt: state.resetAt } : { count: 1, resetAt: now + 15 * 60 * 1000 }
    attempts.set(address, next)
    return false
  }
  attempts.delete(address)
  const id = randomUUID()
  const csrf = issueCsrf()
  db.query('INSERT INTO admin_sessions (id, csrf, expires_at) VALUES (?, ?, ?)').run(id, csrf, now + 12 * 60 * 60 * 1000)
  setCookie(c, cookieName, signedCookie(id), { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'Lax', path: '/', maxAge: 12 * 60 * 60 })
  return true
}

export const logout = (c: Context) => {
  const id = cookieId(getCookie(c, cookieName))
  if (id) db.query('DELETE FROM admin_sessions WHERE id = ?').run(id)
  deleteCookie(c, cookieName, { path: '/' })
}

export const adminSession = (c: Context) => {
  const id = cookieId(getCookie(c, cookieName))
  if (!id) return null
  const session = db.query('SELECT id, csrf, expires_at FROM admin_sessions WHERE id = ? AND expires_at > ?').get(id, Date.now()) as { id: string; csrf: string; expires_at: number } | null
  return session
}

export const requireAdmin = (c: Context) => {
  const session = adminSession(c)
  if (!session) return c.redirect('/admin/login')
  return session
}

export const validCsrf = (c: Context, value: unknown) => {
  const session = adminSession(c)
  return Boolean(session && typeof value === 'string' && value === session.csrf)
}
