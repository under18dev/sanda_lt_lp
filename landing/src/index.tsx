import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { event } from './data/event'
import { sessions } from './data/sessions'
import { speakers } from './data/speakers'
import { createSessionOgp, createSpeakerOgp } from './ogp'
import { Layout } from './components/Layout'
import { About, AccessPage, AccessPreview, AiWerewolf, FaqPage, FaqPreview, Hero, SessionPage, SpeakersPage, SpeakersPreview, SpeakerPage, TimetablePage, TimetablePreview } from './components/Sections'

const app = new Hono()

const xmlEscape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&apos;')

app.get('/robots.txt', (c) => c.text(`User-agent: *\nAllow: /\nSitemap: ${event.siteUrl}/sitemap.xml\n`))

app.get('/sitemap.xml', (c) => {
  const paths = ['/', '/timetable', '/speakers', '/access', '/faq', ...sessions.map((session) => `/sessions/${session.id}`), ...speakers.map((speaker) => `/speakers/${speaker.id}`)]
  const body = paths.map((path) => `  <url><loc>${xmlEscape(new URL(path, event.siteUrl).toString())}</loc></url>`).join('\n')
  return c.body(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>`, 200, { 'Content-Type': 'application/xml; charset=UTF-8' })
})

app.use('/assets/*', serveStatic({ root: './dist' }))
app.use('/images/*', serveStatic({ root: './dist' }))

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
      <FaqPreview />
      <section class="final-cta wrap"><div><div class="eyebrow">JOIN THE FESTIVAL</div><h2>文化祭で、<br />会いましょう。</h2></div><a class="pill primary" href={event.connpassUrl} target="_blank" rel="noreferrer">connpassで参加する ↗</a></section>
    </main>
  </Layout>,
))

app.get('/timetable', (c) => c.html(<Layout title="タイムテーブル" url={c.req.url} active="timetable"><TimetablePage /></Layout>))
app.get('/speakers', (c) => c.html(<Layout title="登壇者" url={c.req.url} active="speakers"><SpeakersPage /></Layout>))
app.get('/access', (c) => c.html(<Layout title="アクセス" url={c.req.url} active="access"><AccessPage /></Layout>))
app.get('/faq', (c) => c.html(<Layout title="よくある質問" url={c.req.url} active="faq"><FaqPage /></Layout>))

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
