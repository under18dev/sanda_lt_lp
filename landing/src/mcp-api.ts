import type { Context, Hono } from 'hono'
import { timingSafeEqual } from 'node:crypto'
import {
  event,
  faqs,
  sessions,
  speakers,
  sponsors,
  refreshStore,
  reorderFaqs,
  reorderSessions,
  reorderSpeakers,
  reorderSponsors,
  saveEvent,
  saveFaq,
  saveSession,
  saveSpeaker,
  saveSponsor,
  deleteSession,
} from './data/runtime'
import type { Session } from './data/sessions'
import type { Speaker } from './data/speakers'
import type { Sponsor } from './data/sponsors'
import type { Faq } from './data/runtime'

type McpContext = Context

const tokenMatches = (provided: string, expected: string) => {
  const left = Buffer.from(provided)
  const right = Buffer.from(expected)
  return left.length === right.length && timingSafeEqual(left, right)
}

const bodyJson = async (c: McpContext) => {
  try {
    return await c.req.json<Record<string, unknown>>()
  } catch {
    return null
  }
}

const stringValue = (body: Record<string, unknown>, key: string) => typeof body[key] === 'string' ? body[key] as string : undefined
const stringList = (body: Record<string, unknown>, key: string) => Array.isArray(body[key]) ? body[key].filter((value): value is string => typeof value === 'string') : undefined
const numberValue = (body: Record<string, unknown>, key: string) => typeof body[key] === 'number' && Number.isFinite(body[key]) ? body[key] as number : undefined

const invalid = (c: McpContext, message: string) => c.json({ error: message }, 400)

export const registerMcpApi = (app: Hono) => {
  app.use('/api/mcp/*', async (c, next) => {
    const expected = process.env.MCP_API_TOKEN
    const authorization = c.req.header('Authorization') ?? ''
    const provided = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
    if (!expected || !tokenMatches(provided, expected)) return c.json({ error: 'Unauthorized' }, 401)
    await next()
  })

  app.get('/api/mcp/state', (c) => c.json({ event, speakers, sessions, faqs, sponsors }))

  app.get('/api/mcp/sessions', (c) => {
    const date = c.req.query('date')
    return c.json(date ? sessions.filter((session) => session.date === date) : sessions)
  })

  app.post('/api/mcp/sessions/upsert', async (c) => {
    const body = await bodyJson(c)
    if (!body) return invalid(c, 'Expected a JSON object')
    const id = stringValue(body, 'id')
    const date = stringValue(body, 'date')
    const start = stringValue(body, 'start')
    const end = stringValue(body, 'end')
    const title = stringValue(body, 'title')
    const category = stringValue(body, 'category')
    const color = stringValue(body, 'color')
    const summary = stringValue(body, 'summary')
    const detail = stringValue(body, 'detail')
    const speakerIds = stringList(body, 'speakerIds') ?? []
    if (!id || !date || !start || !end || !title || !category || !color || summary === undefined || detail === undefined) return invalid(c, 'id, date, start, end, title, category, color, summary, and detail are required')
    if (!['2026-11-02', '2026-11-03'].includes(date)) return invalid(c, 'date must be 2026-11-02 or 2026-11-03')
    if (!['talk', 'special', 'break'].includes(category)) return invalid(c, 'category must be talk, special, or break')
    if (!['white', 'yellow', 'blue', 'green', 'red'].includes(color)) return invalid(c, 'color is invalid')
    if (speakerIds.some((speakerId) => !speakers.some((speaker) => speaker.id === speakerId))) return invalid(c, 'speakerIds contains an unknown speaker')
    const current = sessions.find((session) => session.id === id)
    const next: Session = { id, date: date as Session['date'], start, end, title, category: category as Session['category'], color: color as Session['color'], summary, detail, sortOrder: numberValue(body, 'sortOrder') ?? current?.sortOrder ?? sessions.length, speakerIds }
    saveSession(next)
    return c.json({ ok: true, session: sessions.find((session) => session.id === id) ?? next })
  })

  app.delete('/api/mcp/sessions/:id', (c) => {
    const id = c.req.param('id')
    if (!sessions.some((session) => session.id === id)) return c.notFound()
    deleteSession(id)
    return c.json({ ok: true, deleted: id })
  })

  app.post('/api/mcp/sessions/reorder', async (c) => {
    const body = await bodyJson(c)
    const order = body ? stringList(body, 'order') : undefined
    if (!order) return invalid(c, 'order must be an array of session IDs')
    reorderSessions(order)
    return c.json({ ok: true })
  })

  app.get('/api/mcp/speakers', (c) => c.json(speakers))

  app.post('/api/mcp/speakers/upsert', async (c) => {
    const body = await bodyJson(c)
    if (!body) return invalid(c, 'Expected a JSON object')
    const id = stringValue(body, 'id')
    const name = stringValue(body, 'name')
    const role = stringValue(body, 'role')
    const category = stringValue(body, 'category')
    const bio = stringValue(body, 'bio')
    if (!id || !name || !role || !category || bio === undefined) return invalid(c, 'id, name, role, category, and bio are required')
    const current = speakers.find((speaker) => speaker.id === id)
    const next: Speaker = { id, name, handle: stringValue(body, 'handle') ?? current?.handle, role, category, bio, icon: stringValue(body, 'icon') ?? current?.icon, ogpImage: stringValue(body, 'ogpImage') ?? current?.ogpImage, online: body.online === undefined ? current?.online ?? false : Boolean(body.online) }
    saveSpeaker(next)
    return c.json({ ok: true, speaker: speakers.find((speaker) => speaker.id === id) ?? next })
  })

  app.post('/api/mcp/speakers/reorder', async (c) => {
    const body = await bodyJson(c)
    const order = body ? stringList(body, 'order') : undefined
    if (!order) return invalid(c, 'order must be an array of speaker IDs')
    reorderSpeakers(order)
    return c.json({ ok: true })
  })

  app.post('/api/mcp/event', async (c) => {
    const body = await bodyJson(c)
    if (!body) return invalid(c, 'Expected a JSON object')
    const allowed = ['title', 'shortTitle', 'description', 'dateLabel', 'timeLabel', 'setupTimeLabel', 'venue', 'venueDetail', 'fee', 'capacity', 'connpassUrl', 'streamUrl', 'organizer']
    const next = Object.fromEntries(Object.entries(body).filter(([key, value]) => allowed.includes(key) && (typeof value === 'string' || value === null)))
    saveEvent(next)
    return c.json({ ok: true, event })
  })

  app.get('/api/mcp/faqs', (c) => c.json(faqs))

  app.post('/api/mcp/faqs/upsert', async (c) => {
    const body = await bodyJson(c)
    if (!body) return invalid(c, 'Expected a JSON object')
    const id = stringValue(body, 'id')
    const question = stringValue(body, 'question')
    const answer = stringValue(body, 'answer')
    if (!id || !question || answer === undefined) return invalid(c, 'id, question, and answer are required')
    const next: Faq = { id, question, answer, sortOrder: numberValue(body, 'sortOrder') ?? faqs.find((faq) => faq.id === id)?.sortOrder ?? faqs.length }
    saveFaq(next)
    return c.json({ ok: true, faq: faqs.find((faq) => faq.id === id) ?? next })
  })

  app.post('/api/mcp/faqs/reorder', async (c) => {
    const body = await bodyJson(c)
    const order = body ? stringList(body, 'order') : undefined
    if (!order) return invalid(c, 'order must be an array of FAQ IDs')
    reorderFaqs(order)
    return c.json({ ok: true })
  })

  app.get('/api/mcp/sponsors', (c) => c.json(sponsors))

  app.post('/api/mcp/sponsors/upsert', async (c) => {
    const body = await bodyJson(c)
    if (!body) return invalid(c, 'Expected a JSON object')
    const id = stringValue(body, 'id')
    const name = stringValue(body, 'name')
    const tier = stringValue(body, 'tier')
    const description = stringValue(body, 'description')
    const detail = stringValue(body, 'detail')
    if (!id || !name || !tier || !description || detail === undefined) return invalid(c, 'id, name, tier, description, and detail are required')
    if (!['PLATINUM', 'GOLD', 'SILVER', 'BRONZE', 'SUPPORT'].includes(tier)) return invalid(c, 'tier is invalid')
    const current = sponsors.find((sponsor) => sponsor.id === id)
    const next: Sponsor = { id, name, tier: tier as Sponsor['tier'], description, detail, url: stringValue(body, 'url') ?? current?.url, logo: stringValue(body, 'logo') ?? current?.logo, sortOrder: numberValue(body, 'sortOrder') ?? current?.sortOrder ?? sponsors.length }
    saveSponsor(next)
    return c.json({ ok: true, sponsor: sponsors.find((sponsor) => sponsor.id === id) ?? next })
  })

  app.post('/api/mcp/sponsors/reorder', async (c) => {
    const body = await bodyJson(c)
    const order = body ? stringList(body, 'order') : undefined
    if (!order) return invalid(c, 'order must be an array of sponsor IDs')
    reorderSponsors(order)
    return c.json({ ok: true })
  })

  app.post('/api/mcp/refresh', (c) => {
    refreshStore()
    return c.json({ ok: true })
  })
}
