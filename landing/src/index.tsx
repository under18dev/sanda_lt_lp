import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { event, faqs, sessions, speakers, sponsors, refreshStore, reorderFaqs, reorderSessions, reorderSpeakers, reorderSponsors, saveEvent, saveFaq, saveSession, saveSpeaker, saveSponsor, deleteFaq, deleteSession, deleteSpeaker, deleteSponsor } from './data/runtime'
import { createEventOgp, createSessionOgp, createSpeakerOgp } from './ogp'
import { Layout } from './components/Layout'
import { PrivacyPolicyPage } from './components/PrivacyPolicy'
import { About, AccessPage, AccessPreview, AiWerewolf, FaqPage, FaqPreview, Hero, SessionPage, SponsorPage, Sponsors, SponsorsPage, SpeakersPage, SpeakersPreview, SpeakerPage, TimetablePage, TimetablePreview } from './components/Sections'
import { Dashboard, EventForm, FaqForm, FaqList, Login, OgpForm, SessionForm, SessionList, SponsorForm, SponsorList, SpeakerForm, SpeakerList } from './admin/views'
import { SpeakerOgpGenerator } from './admin/speaker-ogp'
import { adminSession, login, logout, requireAdmin, validCsrf } from './admin/auth'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import { registerMcpApi } from './mcp-api'

const app = new Hono()

registerMcpApi(app)

refreshStore()

const dataDir = process.env.DATA_DIR ?? './data'
const field = (body: Record<string, unknown>, name: string) => typeof body[name] === 'string' ? body[name] as string : ''
const fieldList = (body: Record<string, unknown>, name: string) => { const value = body[name]; return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : typeof value === 'string' ? [value] : [] }
const adminGuard = (c: Parameters<typeof requireAdmin>[0]) => requireAdmin(c)
const reorderRequest = async (c: Parameters<typeof requireAdmin>[0], currentIds: string[], save: (ids: string[]) => void, redirectPath: string) => {
  const session = adminGuard(c); if (session instanceof Response) return session
  const body = await c.req.parseBody()
  if (!validCsrf(c, body.csrf)) return c.text('Invalid CSRF token', 403)
  let orderedIds: string[]
  try { orderedIds = JSON.parse(field(body, 'order')) as string[] } catch { return c.text('Invalid order', 400) }
  const validIds = new Set(currentIds)
  const uniqueIds = orderedIds.filter((id, index) => typeof id === 'string' && validIds.has(id) && orderedIds.indexOf(id) === index)
  save([...uniqueIds, ...currentIds.filter((id) => !uniqueIds.includes(id))])
  return c.redirect(redirectPath)
}

const saveUploadedImage = async (file: unknown, area: 'speakers' | 'event' | 'sponsors') => {
  if (!(file instanceof File) || file.size === 0) return undefined
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) throw new Error('画像はJPEG、PNG、WebPの5MB以下にしてください。')
  const buffer = await sharp(Buffer.from(await file.arrayBuffer())).rotate().resize(1000, 1000, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 86 }).toBuffer()
  const relative = `uploads/${area}/${crypto.randomUUID()}.webp`
  await mkdir(join(dataDir, 'uploads', area), { recursive: true })
  await writeFile(join(dataDir, relative), buffer)
  return `/${relative}`
}

const xmlEscape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;')

app.get('/robots.txt', (c) => c.text(`User-agent: *\nAllow: /\nSitemap: ${event.siteUrl}/sitemap.xml\n`))

app.get('/sitemap.xml', (c) => {
  const paths = ['/', '/timetable', '/speakers', '/access', '/faq', '/sponsors', '/privacy', ...sessions.map((session) => `/sessions/${session.id}`), ...speakers.map((speaker) => `/speakers/${speaker.id}`), ...sponsors.map((sponsor) => `/sponsors/${sponsor.id}`)]
  const body = paths.map((path) => `  <url><loc>${xmlEscape(new URL(path, event.siteUrl).toString())}</loc></url>`).join('\n')
  return c.body(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`, 200, { 'Content-Type': 'application/xml; charset=UTF-8' })
})

app.use('/assets/*', serveStatic({ root: './dist' }))
app.use('/images/*', serveStatic({ root: './dist' }))
app.use('/uploads/*', serveStatic({ root: dataDir }))

app.get('/healthz', (c) => c.json({ ok: true }))

app.get('/admin/login', (c) => c.html(<Login />))
app.post('/admin/login', async (c) => {
  const body = await c.req.parseBody()
  if (await login(c, field(body, 'password'))) return c.redirect('/admin')
  return c.html(<Login error="パスワードが正しくないか、ログイン試行が制限されています。" />, 401)
})
app.post('/admin/logout', (c) => { logout(c); return c.redirect('/admin/login') })

app.get('/admin', (c) => { const session = adminGuard(c); if (session instanceof Response) return session; return c.html(<Dashboard csrf={session.csrf} />) })
app.get('/admin/event', (c) => { const session = adminGuard(c); if (session instanceof Response) return session; return c.html(<EventForm csrf={session.csrf} />) })
app.get('/admin/ogp', (c) => { const session = adminGuard(c); if (session instanceof Response) return session; return c.html(<OgpForm csrf={session.csrf} />) })
app.get('/admin/ogp/speaker', (c) => { const session = adminGuard(c); if (session instanceof Response) return session; return c.html(<SpeakerOgpGenerator />) })
app.post('/admin/event', async (c) => {
  const session = adminGuard(c); if (session instanceof Response) return session
  const body = await c.req.parseBody()
  if (!validCsrf(c, body.csrf)) return c.text('Invalid CSRF token', 403)
  saveEvent({ title: field(body, 'title'), shortTitle: field(body, 'shortTitle'), description: field(body, 'description'), dateLabel: field(body, 'dateLabel'), timeLabel: field(body, 'timeLabel'), setupTimeLabel: field(body, 'setupTimeLabel'), venue: field(body, 'venue'), venueDetail: field(body, 'venueDetail'), fee: field(body, 'fee'), capacity: field(body, 'capacity'), connpassUrl: field(body, 'connpassUrl'), streamUrl: field(body, 'streamUrl') || null })
  return c.redirect('/admin/event')
})
app.post('/admin/ogp', async (c) => {
  const session = adminGuard(c); if (session instanceof Response) return session
  const body = await c.req.parseBody()
  if (!validCsrf(c, body.csrf)) return c.text('Invalid CSRF token', 403)
  const selectedSpeakerIds = fieldList(body, 'speakerIds')
  saveEvent({ title: field(body, 'title'), description: field(body, 'description'), dateLabel: field(body, 'dateLabel'), venue: field(body, 'venue'), ogpSpeakerIds: selectedSpeakerIds })
  const buffer = await createEventOgp(event, speakers)
  await mkdir(join(dataDir, 'ogp'), { recursive: true })
  await writeFile(join(dataDir, 'ogp', 'event.png'), buffer)
  saveEvent({ ogpImage: `/uploads/ogp/event.png?v=${Date.now()}` })
  return c.redirect('/admin/ogp')
})

app.get('/admin/speakers', (c) => { const session = adminGuard(c); if (session instanceof Response) return session; return c.html(<SpeakerList csrf={session.csrf} />) })
app.get('/admin/speakers/new', (c) => { const session = adminGuard(c); if (session instanceof Response) return session; return c.html(<SpeakerForm csrf={session.csrf} />) })
app.get('/admin/speakers/:id', (c) => { const session = adminGuard(c); if (session instanceof Response) return session; const speaker = speakers.find((item) => item.id === c.req.param('id')); if (!speaker) return c.notFound(); return c.html(<SpeakerForm csrf={session.csrf} speaker={speaker} />) })
app.post('/admin/speakers/new', async (c) => { const session = adminGuard(c); if (session instanceof Response) return session; return saveSpeakerRequest(c, undefined, session.csrf) })
app.post('/admin/speakers/reorder', async (c) => reorderRequest(c, speakers.map((item) => item.id), reorderSpeakers, '/admin/speakers'))
app.post('/admin/speakers/:id', async (c) => { const session = adminGuard(c); if (session instanceof Response) return session; return saveSpeakerRequest(c, c.req.param('id'), session.csrf) })
app.post('/admin/speakers/:id/delete', async (c) => { const session = adminGuard(c); if (session instanceof Response) return session; const body = await c.req.parseBody(); if (!validCsrf(c, body.csrf)) return c.text('Invalid CSRF token', 403); deleteSpeaker(c.req.param('id')); return c.redirect('/admin/speakers') })
const saveSpeakerRequest = async (c: Parameters<typeof requireAdmin>[0], existingId: string | undefined, csrf: string) => {
  const body = await c.req.parseBody()
  if (!validCsrf(c, body.csrf)) return c.text('Invalid CSRF token', 403)
  const id = field(body, 'id') || existingId || crypto.randomUUID()
  const existing = speakers.find((item) => item.id === existingId)
  let icon = existing?.icon
  try { icon = await saveUploadedImage(body.icon, 'speakers') ?? icon } catch (error) { return c.text(error instanceof Error ? error.message : '画像を保存できませんでした。', 400) }
  saveSpeaker({ id, name: field(body, 'name'), handle: field(body, 'handle') || undefined, role: field(body, 'role'), category: field(body, 'category'), bio: field(body, 'bio'), icon, online: body.online === 'on' })
  return c.redirect(`/admin/speakers/${id}`)
}

app.get('/admin/sponsors', (c) => { const session = adminGuard(c); if (session instanceof Response) return session; return c.html(<SponsorList csrf={session.csrf} />) })
app.get('/admin/sponsors/new', (c) => { const session = adminGuard(c); if (session instanceof Response) return session; return c.html(<SponsorForm csrf={session.csrf} />) })
app.get('/admin/sponsors/:id', (c) => { const session = adminGuard(c); if (session instanceof Response) return session; const sponsor = sponsors.find((item) => item.id === c.req.param('id')); if (!sponsor) return c.notFound(); return c.html(<SponsorForm csrf={session.csrf} sponsor={sponsor} />) })
app.post('/admin/sponsors/new', async (c) => { const session = adminGuard(c); if (session instanceof Response) return session; return saveSponsorRequest(c, undefined) })
app.post('/admin/sponsors/reorder', async (c) => reorderRequest(c, sponsors.map((item) => item.id), reorderSponsors, '/admin/sponsors'))
app.post('/admin/sponsors/:id', async (c) => { const session = adminGuard(c); if (session instanceof Response) return session; return saveSponsorRequest(c, c.req.param('id')) })
app.post('/admin/sponsors/:id/delete', async (c) => { const session = adminGuard(c); if (session instanceof Response) return session; const body = await c.req.parseBody(); if (!validCsrf(c, body.csrf)) return c.text('Invalid CSRF token', 403); deleteSponsor(c.req.param('id')); return c.redirect('/admin/sponsors') })
const saveSponsorRequest = async (c: Parameters<typeof requireAdmin>[0], existingId: string | undefined) => {
  const body = await c.req.parseBody()
  if (!validCsrf(c, body.csrf)) return c.text('Invalid CSRF token', 403)
  const id = field(body, 'id') || existingId || crypto.randomUUID()
  const existing = sponsors.find((item) => item.id === existingId)
  let logo = existing?.logo
  try { logo = await saveUploadedImage(body.logo, 'sponsors') ?? logo } catch (error) { return c.text(error instanceof Error ? error.message : '画像を保存できませんでした。', 400) }
  saveSponsor({ id, name: field(body, 'name'), tier: field(body, 'tier') as 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' | 'SUPPORT', description: field(body, 'description'), detail: field(body, 'detail'), url: field(body, 'url') || undefined, logo, sortOrder: Number(field(body, 'sortOrder')) || 0 })
  return c.redirect(`/admin/sponsors/${id}`)
}

app.get('/admin/sessions', (c) => { const session = adminGuard(c); if (session instanceof Response) return session; return c.html(<SessionList csrf={session.csrf} />) })
app.get('/admin/sessions/new', (c) => { const session = adminGuard(c); if (session instanceof Response) return session; return c.html(<SessionForm csrf={session.csrf} />) })
app.get('/admin/sessions/:id', (c) => { const session = adminGuard(c); if (session instanceof Response) return session; const item = sessions.find((candidate) => candidate.id === c.req.param('id')); if (!item) return c.notFound(); return c.html(<SessionForm csrf={session.csrf} session={item} />) })
app.post('/admin/sessions/new', async (c) => { const session = adminGuard(c); if (session instanceof Response) return session; return saveSessionRequest(c, undefined) })
app.post('/admin/sessions/reorder', async (c) => reorderRequest(c, sessions.map((item) => item.id), reorderSessions, '/admin/sessions'))
app.post('/admin/sessions/:id', async (c) => { const session = adminGuard(c); if (session instanceof Response) return session; return saveSessionRequest(c, c.req.param('id')) })
app.post('/admin/sessions/:id/delete', async (c) => { const session = adminGuard(c); if (session instanceof Response) return session; const body = await c.req.parseBody(); if (!validCsrf(c, body.csrf)) return c.text('Invalid CSRF token', 403); deleteSession(c.req.param('id')); return c.redirect('/admin/sessions') })
const saveSessionRequest = async (c: Parameters<typeof requireAdmin>[0], existingId: string | undefined) => {
  const body = await c.req.parseBody()
  if (!validCsrf(c, body.csrf)) return c.text('Invalid CSRF token', 403)
  const id = field(body, 'id') || existingId || crypto.randomUUID()
  saveSession({ id, date: field(body, 'date') as '2026-11-02' | '2026-11-03', start: field(body, 'start'), end: field(body, 'end'), title: field(body, 'title'), category: field(body, 'category') as 'talk' | 'special' | 'break', color: field(body, 'color') as 'white' | 'yellow' | 'blue' | 'green' | 'red', summary: field(body, 'summary'), detail: field(body, 'detail'), sortOrder: Number(field(body, 'sortOrder')) || 0, speakerIds: fieldList(body, 'speakerIds') })
  return c.redirect(`/admin/sessions/${id}`)
}

app.get('/admin/faqs', (c) => { const session = adminGuard(c); if (session instanceof Response) return session; return c.html(<FaqList csrf={session.csrf} />) })
app.get('/admin/faqs/new', (c) => { const session = adminGuard(c); if (session instanceof Response) return session; return c.html(<FaqForm csrf={session.csrf} />) })
app.get('/admin/faqs/:id', (c) => { const session = adminGuard(c); if (session instanceof Response) return session; const faq = faqs.find((item) => item.id === c.req.param('id')); if (!faq) return c.notFound(); return c.html(<FaqForm csrf={session.csrf} faq={faq} />) })
app.post('/admin/faqs/new', async (c) => { const session = adminGuard(c); if (session instanceof Response) return session; return saveFaqRequest(c, undefined) })
app.post('/admin/faqs/reorder', async (c) => reorderRequest(c, faqs.map((item) => item.id), reorderFaqs, '/admin/faqs'))
app.post('/admin/faqs/:id', async (c) => { const session = adminGuard(c); if (session instanceof Response) return session; return saveFaqRequest(c, c.req.param('id')) })
app.post('/admin/faqs/:id/delete', async (c) => { const session = adminGuard(c); if (session instanceof Response) return session; const body = await c.req.parseBody(); if (!validCsrf(c, body.csrf)) return c.text('Invalid CSRF token', 403); deleteFaq(c.req.param('id')); return c.redirect('/admin/faqs') })
const saveFaqRequest = async (c: Parameters<typeof requireAdmin>[0], existingId: string | undefined) => {
  const body = await c.req.parseBody()
  if (!validCsrf(c, body.csrf)) return c.text('Invalid CSRF token', 403)
  const id = field(body, 'id') || existingId || crypto.randomUUID()
  saveFaq({ id, question: field(body, 'question'), answer: field(body, 'answer'), sortOrder: Number(field(body, 'sortOrder')) || 0 })
  return c.redirect(`/admin/faqs/${id}`)
}

app.get('/ogp/speakers/:id', async (c) => {
  const speaker = speakers.find((candidate) => candidate.id === c.req.param('id'))
  if (!speaker) return c.notFound()
  return c.body(await createSpeakerOgp(speaker), 200, { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' })
})

app.get('/ogp/sessions/:id', async (c) => {
  const session = sessions.find((candidate) => candidate.id === c.req.param('id'))
  if (!session) return c.notFound()
  return c.body(await createSessionOgp(session, speakers), 200, { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600' })
})

app.use('/ogp/*', serveStatic({ root: './dist' }))

app.get('/', (c) => c.html(
  <Layout ogImage={event.ogpImage} url={c.req.url}>
    <main>
      <Hero />
      <About />
      <TimetablePreview />
      <AiWerewolf />
      <SpeakersPreview />
      <AccessPreview />
      <Sponsors />
      <FaqPreview />
      <section class="final-cta wrap"><div><div class="eyebrow">JOIN THE FESTIVAL</div><h2>文化祭で、<br />会いましょう。</h2></div><a class="pill primary" href={event.connpassUrl} target="_blank" rel="noreferrer">connpassで参加する ↗</a></section>
    </main>
  </Layout>,
))

app.get('/timetable', (c) => c.html(<Layout title="タイムテーブル" url={c.req.url} active="timetable"><TimetablePage /></Layout>))
app.get('/speakers', (c) => c.html(<Layout title="登壇者" url={c.req.url} active="speakers"><SpeakersPage /></Layout>))
app.get('/access', (c) => c.html(<Layout title="アクセス" url={c.req.url} active="access"><AccessPage /></Layout>))
app.get('/faq', (c) => c.html(<Layout title="よくある質問" url={c.req.url} active="faq"><FaqPage /></Layout>))
app.get('/privacy', (c) => c.html(<Layout title="プライバシーポリシー" description="イベントおよび公式サイトにおける個人情報の取り扱いについて。" url={c.req.url}><PrivacyPolicyPage /></Layout>))
app.get('/sponsors', (c) => c.html(<Layout title="協賛・スポンサー" url={c.req.url}><SponsorsPage /></Layout>))
app.get('/sponsors/:id', (c) => c.html(<Layout title={sponsors.find((item) => item.id === c.req.param('id'))?.name ?? 'スポンサー'} url={c.req.url}><SponsorPage sponsorId={c.req.param('id')} /></Layout>))

app.get('/sessions/:id', (c) => {
  const session = sessions.find((candidate) => candidate.id === c.req.param('id'))
  if (!session) return c.html(<Layout title="Not found"><main><div class="not-found wrap"><div class="eyebrow">404 / SESSION</div><h1>Session not found</h1><a class="pill" href="/timetable">タイムテーブルに戻る →</a></div></main></Layout>, 404)
  return c.html(<Layout title={session.title} ogImage={`/ogp/sessions/${session.id}`} url={c.req.url} active="timetable"><SessionPage session={session} /></Layout>)
})

app.get('/speakers/:id', (c) => {
  const speaker = speakers.find((candidate) => candidate.id === c.req.param('id'))
  return c.html(<Layout title={speaker?.name ?? 'Speaker'} description={speaker?.bio} ogImage={speaker ? `/ogp/speakers/${speaker.id}` : undefined} url={c.req.url} active="speakers"><SpeakerPage speakerId={c.req.param('id')} /></Layout>)
})

app.notFound((c) => c.html(<Layout title="Not found"><main><div class="not-found wrap"><div class="eyebrow">404 / UNKNOWN WORLD</div><h1>Page not found</h1><p>探しているページは見つかりませんでした。</p><a class="pill" href="/">トップに戻る →</a></div></main></Layout>, 404))

export default app
