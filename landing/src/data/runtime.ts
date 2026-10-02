import { Database } from 'bun:sqlite'
import { mkdirSync } from 'node:fs'
import { event as seedEvent } from './event'
import { speakers as seedSpeakers, type Speaker } from './speakers'
import { sessions as seedSessions, type Session } from './sessions'
import { faqs as seedFaqs } from './faq'
import { sponsors as seedSponsors, type Sponsor } from './sponsors'

export type EventRecord = {
  siteUrl: string
  title: string
  shortTitle: string
  description: string
  dates: { label: string; date: string }[]
  dateLabel: string
  timeLabel: string
  setupTimeLabel: string
  venue: string
  venueDetail: string
  fee: string
  capacity: string
  connpassUrl: string
  streamUrl: string | null
  organizer: string
  defaultOgpImage: string
  ogpImage: string
  ogpSpeakerIds: string[]
}

export type Faq = {
  id: string
  question: string
  answer: string
  sortOrder: number
}

const dataDir = process.env.DATA_DIR ?? './data'
const databasePath = process.env.DATABASE_PATH ?? `${dataDir}/event.db`

const openDatabase = () => {
  try {
    mkdirSync(dataDir, { recursive: true })
    return new Database(databasePath, { create: true })
  } catch (error) {
    console.error(
      `[runtime] データディレクトリ "${dataDir}" に書き込めませんでした。` +
        `ホスト側ディレクトリの所有権を確認してください（rootless podmanでは \`chown -R "$(id -u):$(id -g)" <DATA_DIR>\` が必要です）。`,
    )
    throw error
  }
}

export const db = openDatabase()

export let event: EventRecord = structuredClone(seedEvent) as unknown as EventRecord
export let speakers: Speaker[] = structuredClone(seedSpeakers)
export let sessions: Session[] = structuredClone(seedSessions)
export let faqs: Faq[] = structuredClone(seedFaqs).map((faq, index) => ({ ...faq, sortOrder: index }))
export let sponsors: Sponsor[] = structuredClone(seedSponsors)
export let sessionDates = structuredClone([
  { id: '2026-11-02' as const, label: '11.02 MON' },
  { id: '2026-11-03' as const, label: '11.03 TUE' },
])

export const speakerCategories = [
  { id: 'all', label: 'ALL' },
  { id: 'web', label: 'WEB' },
  { id: 'sns', label: 'SNS' },
  { id: 'culture', label: 'CULTURE' },
  { id: 'medical', label: 'MEDICAL' },
  { id: 'other', label: 'OTHER' },
]

const ensureSchema = () => {
  db.run(`CREATE TABLE IF NOT EXISTS event_settings (id INTEGER PRIMARY KEY CHECK (id = 1), data TEXT NOT NULL, updated_at TEXT NOT NULL)`)
  db.run(`CREATE TABLE IF NOT EXISTS speakers (id TEXT PRIMARY KEY, name TEXT NOT NULL, handle TEXT, role TEXT NOT NULL, category TEXT NOT NULL, bio TEXT NOT NULL, icon TEXT, ogp_image TEXT, online INTEGER NOT NULL DEFAULT 0, sort_order INTEGER NOT NULL DEFAULT 0, published INTEGER NOT NULL DEFAULT 1)`)
  db.run(`CREATE TABLE IF NOT EXISTS sessions (id TEXT PRIMARY KEY, date TEXT NOT NULL, start TEXT NOT NULL, end TEXT NOT NULL, title TEXT NOT NULL, category TEXT NOT NULL, color TEXT NOT NULL, summary TEXT NOT NULL, detail TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, published INTEGER NOT NULL DEFAULT 1)`)
  db.run(`CREATE TABLE IF NOT EXISTS session_speakers (session_id TEXT NOT NULL, speaker_id TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (session_id, speaker_id))`)
  db.run(`CREATE TABLE IF NOT EXISTS admin_sessions (id TEXT PRIMARY KEY, csrf TEXT NOT NULL, expires_at INTEGER NOT NULL)`)
  db.run(`CREATE TABLE IF NOT EXISTS faqs (id TEXT PRIMARY KEY, question TEXT NOT NULL, answer TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0, published INTEGER NOT NULL DEFAULT 1)`)
  db.run(`CREATE TABLE IF NOT EXISTS sponsors (id TEXT PRIMARY KEY, name TEXT NOT NULL, tier TEXT NOT NULL, description TEXT NOT NULL, detail TEXT NOT NULL, url TEXT, logo TEXT, sort_order INTEGER NOT NULL DEFAULT 0, published INTEGER NOT NULL DEFAULT 1)`)
  db.run(`CREATE TABLE IF NOT EXISTS app_migrations (id TEXT PRIMARY KEY, applied_at TEXT NOT NULL)`)
}

const seed = () => {
  const existing = db.query('SELECT id FROM event_settings WHERE id = 1').get()
  if (!existing) {
    const now = new Date().toISOString()
    db.query('INSERT INTO event_settings (id, data, updated_at) VALUES (1, ?, ?)').run(JSON.stringify(seedEvent), now)
    const insertSpeaker = db.query('INSERT INTO speakers (id, name, handle, role, category, bio, icon, ogp_image, online, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    seedSpeakers.forEach((speaker, index) => insertSpeaker.run(speaker.id, speaker.name, speaker.handle ?? null, speaker.role, speaker.category, speaker.bio, speaker.icon ?? null, speaker.ogpImage ?? null, speaker.online ? 1 : 0, index))
    const insertSession = db.query('INSERT INTO sessions (id, date, start, end, title, category, color, summary, detail, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    const insertRelation = db.query('INSERT INTO session_speakers (session_id, speaker_id, sort_order) VALUES (?, ?, ?)')
    seedSessions.forEach((session, index) => {
      insertSession.run(session.id, session.date, session.start, session.end, session.title, session.category, session.color, session.summary, session.detail, index)
      session.speakerIds.forEach((speakerId, speakerIndex) => insertRelation.run(session.id, speakerId, speakerIndex))
    })
  }
  const faqCount = db.query('SELECT COUNT(*) AS count FROM faqs').get() as { count: number }
  if (faqCount.count === 0) {
    const insertFaq = db.query('INSERT INTO faqs (id, question, answer, sort_order) VALUES (?, ?, ?, ?)')
    seedFaqs.forEach((faq, index) => insertFaq.run(faq.id, faq.question, faq.answer, index))
  }
  const sponsorCount = db.query('SELECT COUNT(*) AS count FROM sponsors').get() as { count: number }
  if (sponsorCount.count === 0 && seedSponsors.length > 0) {
    const insertSponsor = db.query('INSERT INTO sponsors (id, name, tier, description, detail, url, logo, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    seedSponsors.forEach((sponsor, index) => insertSponsor.run(sponsor.id, sponsor.name, sponsor.tier, sponsor.description, sponsor.detail, sponsor.url ?? null, sponsor.logo ?? null, index))
  }
}

const migrateSchedule = () => {
  const migrationId = '2026-10-01-lunch-ai-schedule'
  const applied = db.query('SELECT id FROM app_migrations WHERE id = ?').get(migrationId)
  if (applied) return

  // The schedule may already have been applied through the production admin UI.
  // Avoid creating duplicate slots when that database is deployed with this version.
  const productionAfternoon = db.query(`SELECT id FROM sessions WHERE date = '2026-11-02' AND start = '14:00' AND end = '14:10'`).get() as { id: string } | null
  if (productionAfternoon && productionAfternoon.id !== 'tbd-1400') {
    db.query('INSERT INTO app_migrations (id, applied_at) VALUES (?, ?)').run(migrationId, new Date().toISOString())
    return
  }

  const removedIds = [
    'tbd-1205', 'tbd-1215', 'tbd-1225', 'tbd-1235', 'tbd-1245', 'break-1255',
    'break-1500', 'tbd-1505',
  ]
  const changedIds = new Set([
    'lunch-1205', 'ai-werewolf-play', 'ai-werewolf-making',
    'tbd-1400', 'break-1410', 'tbd-1415', 'break-1425', 'tbd-1430',
    'break-1440', 'tbd-1445', 'break-1455', 'tbd-1500',
    'ai-era-technology', 'closing-1102', 'social-1102',
  ])
  const sessionsToUpsert = seedSessions.filter((session) => changedIds.has(session.id))
  const sortOrderById = new Map(seedSessions.map((session, index) => [session.id, index]))

  db.transaction(() => {
    const deleteRelations = db.query('DELETE FROM session_speakers WHERE session_id = ?')
    const deleteSession = db.query('DELETE FROM sessions WHERE id = ?')
    removedIds.forEach((id) => {
      deleteRelations.run(id)
      deleteSession.run(id)
    })

    const upsertSession = db.query(`
      INSERT INTO sessions (id, date, start, end, title, category, color, summary, detail, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        date=excluded.date,
        start=excluded.start,
        end=excluded.end,
        title=excluded.title,
        category=excluded.category,
        color=excluded.color,
        summary=excluded.summary,
        detail=excluded.detail,
        sort_order=excluded.sort_order
    `)
    const deleteChangedRelations = db.query('DELETE FROM session_speakers WHERE session_id = ?')
    const insertRelation = db.query('INSERT INTO session_speakers (session_id, speaker_id, sort_order) VALUES (?, ?, ?)')
    sessionsToUpsert.forEach((session) => {
      upsertSession.run(session.id, session.date, session.start, session.end, session.title, session.category, session.color, session.summary, session.detail, sortOrderById.get(session.id) ?? 0)
      deleteChangedRelations.run(session.id)
      session.speakerIds.forEach((speakerId, index) => insertRelation.run(session.id, speakerId, index))
    })
    db.query('INSERT INTO app_migrations (id, applied_at) VALUES (?, ?)').run(migrationId, new Date().toISOString())
  })()
}

export const refreshStore = () => {
  const eventRow = db.query('SELECT data FROM event_settings WHERE id = 1').get() as { data: string } | null
  if (eventRow) event = JSON.parse(eventRow.data) as EventRecord
  const speakerRows = db.query('SELECT id, name, handle, role, category, bio, icon, ogp_image, online FROM speakers WHERE published = 1 ORDER BY sort_order, id').all() as Array<Record<string, unknown>>
  speakers = speakerRows.map((row) => ({ id: String(row.id), name: String(row.name), handle: row.handle ? String(row.handle) : undefined, role: String(row.role), category: String(row.category), bio: String(row.bio), icon: row.icon ? String(row.icon) : undefined, ogpImage: row.ogp_image ? String(row.ogp_image) : undefined, online: Boolean(row.online) }))
  const sessionRows = db.query('SELECT id, date, start, end, title, category, color, summary, detail, sort_order FROM sessions WHERE published = 1 ORDER BY date, sort_order, start, id').all() as Array<Record<string, unknown>>
  sessions = sessionRows.map((row) => ({ id: String(row.id), date: String(row.date) as Session['date'], start: String(row.start), end: String(row.end), title: String(row.title), category: String(row.category) as Session['category'], color: String(row.color) as Session['color'], summary: String(row.summary), detail: String(row.detail), sortOrder: Number(row.sort_order), speakerIds: (db.query('SELECT speaker_id FROM session_speakers WHERE session_id = ? ORDER BY sort_order').all(String(row.id)) as Array<{ speaker_id: string }>).map((item) => item.speaker_id) }))
  sessionDates = event.dates.map((item, index) => {
    const match = item.date.match(/(\d+)年(\d+)月(\d+)日（(.)）/)
    const weekday = match ? ({ 月: 'MON', 火: 'TUE', 水: 'WED', 木: 'THU', 金: 'FRI', 土: 'SAT', 日: 'SUN' } as Record<string, string>)[match[4]] : ''
    return { id: index === 0 ? '2026-11-02' as const : '2026-11-03' as const, label: match ? `${match[2].padStart(2, '0')}.${match[3].padStart(2, '0')} ${weekday}` : item.date }
  })
  const faqRows = db.query('SELECT id, question, answer, sort_order FROM faqs WHERE published = 1 ORDER BY sort_order, id').all() as Array<Record<string, unknown>>
  faqs = faqRows.map((row) => ({ id: String(row.id), question: String(row.question), answer: String(row.answer), sortOrder: Number(row.sort_order) }))
  const sponsorRows = db.query('SELECT id, name, tier, description, detail, url, logo, sort_order FROM sponsors WHERE published = 1 ORDER BY sort_order, id').all() as Array<Record<string, unknown>>
  sponsors = sponsorRows.map((row) => ({ id: String(row.id), name: String(row.name), tier: String(row.tier) as Sponsor['tier'], description: String(row.description), detail: String(row.detail), url: row.url ? String(row.url) : undefined, logo: row.logo ? String(row.logo) : undefined, sortOrder: Number(row.sort_order) }))
}

ensureSchema()
seed()
migrateSchedule()
refreshStore()

export const saveEvent = (next: Partial<EventRecord>) => {
  event = { ...event, ...next }
  db.query('UPDATE event_settings SET data = ?, updated_at = ? WHERE id = 1').run(JSON.stringify(event), new Date().toISOString())
  refreshStore()
}

export const saveSpeaker = (speaker: Speaker) => {
  db.query(`INSERT INTO speakers (id, name, handle, role, category, bio, icon, ogp_image, online, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, handle=excluded.handle, role=excluded.role, category=excluded.category, bio=excluded.bio, icon=excluded.icon, ogp_image=excluded.ogp_image, online=excluded.online, sort_order=excluded.sort_order`).run(speaker.id, speaker.name, speaker.handle ?? null, speaker.role, speaker.category, speaker.bio, speaker.icon ?? null, speaker.ogpImage ?? null, speaker.online ? 1 : 0, speakers.findIndex((item) => item.id === speaker.id))
  refreshStore()
}

export const deleteSpeaker = (id: string) => { db.query('DELETE FROM speakers WHERE id = ?').run(id); refreshStore() }

export const reorderSpeakers = (orderedIds: string[]) => {
  const update = db.query('UPDATE speakers SET sort_order = ? WHERE id = ?')
  orderedIds.forEach((id, index) => update.run(index, id))
  refreshStore()
}

export const saveSession = (session: Session) => {
  const sortOrder = session.sortOrder ?? sessions.findIndex((item) => item.id === session.id)
  db.query(`INSERT INTO sessions (id, date, start, end, title, category, color, summary, detail, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET date=excluded.date, start=excluded.start, end=excluded.end, title=excluded.title, category=excluded.category, color=excluded.color, summary=excluded.summary, detail=excluded.detail, sort_order=excluded.sort_order`).run(session.id, session.date, session.start, session.end, session.title, session.category, session.color, session.summary, session.detail, sortOrder)
  db.query('DELETE FROM session_speakers WHERE session_id = ?').run(session.id)
  session.speakerIds.forEach((speakerId, index) => db.query('INSERT INTO session_speakers (session_id, speaker_id, sort_order) VALUES (?, ?, ?)').run(session.id, speakerId, index))
  refreshStore()
}

export const deleteSession = (id: string) => { db.query('DELETE FROM session_speakers WHERE session_id = ?').run(id); db.query('DELETE FROM sessions WHERE id = ?').run(id); refreshStore() }

export const reorderSessions = (orderedIds: string[]) => {
  const update = db.query('UPDATE sessions SET sort_order = ? WHERE id = ?')
  orderedIds.forEach((id, index) => update.run(index, id))
  refreshStore()
}

export const saveFaq = (faq: Faq) => {
  db.query(`INSERT INTO faqs (id, question, answer, sort_order) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET question=excluded.question, answer=excluded.answer, sort_order=excluded.sort_order`).run(faq.id, faq.question, faq.answer, faq.sortOrder)
  refreshStore()
}

export const deleteFaq = (id: string) => { db.query('DELETE FROM faqs WHERE id = ?').run(id); refreshStore() }

export const reorderFaqs = (orderedIds: string[]) => {
  const update = db.query('UPDATE faqs SET sort_order = ? WHERE id = ?')
  orderedIds.forEach((id, index) => update.run(index, id))
  refreshStore()
}

export const saveSponsor = (sponsor: Sponsor) => {
  db.query(`INSERT INTO sponsors (id, name, tier, description, detail, url, logo, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET name=excluded.name, tier=excluded.tier, description=excluded.description, detail=excluded.detail, url=excluded.url, logo=excluded.logo, sort_order=excluded.sort_order`).run(sponsor.id, sponsor.name, sponsor.tier, sponsor.description, sponsor.detail, sponsor.url ?? null, sponsor.logo ?? null, sponsor.sortOrder)
  refreshStore()
}

export const deleteSponsor = (id: string) => { db.query('DELETE FROM sponsors WHERE id = ?').run(id); refreshStore() }

export const reorderSponsors = (orderedIds: string[]) => {
  const update = db.query('UPDATE sponsors SET sort_order = ? WHERE id = ?')
  orderedIds.forEach((id, index) => update.run(index, id))
  refreshStore()
}
