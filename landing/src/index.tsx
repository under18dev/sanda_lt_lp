import { Hono } from 'hono'
import { serveStatic } from 'hono/bun'
import { event } from './data/event'
import { sessions } from './data/sessions'
import { speakers } from './data/speakers'
import { Layout } from './components/Layout'
import { About, AccessPage, AccessPreview, AiWerewolf, FaqPage, FaqPreview, Hero, SessionPage, SpeakersPage, SpeakersPreview, SpeakerPage, TimetablePage, TimetablePreview } from './components/Sections'

const app = new Hono()

app.use('/assets/*', serveStatic({ root: './dist' }))

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

app.get('/timetable', (c) => c.html(<Layout title="Timetable" active="timetable"><TimetablePage /></Layout>))
app.get('/speakers', (c) => c.html(<Layout title="Speakers" active="speakers"><SpeakersPage /></Layout>))
app.get('/access', (c) => c.html(<Layout title="Access" active="access"><AccessPage /></Layout>))
app.get('/faq', (c) => c.html(<Layout title="FAQ" active="faq"><FaqPage /></Layout>))

app.get('/sessions/:id', (c) => {
  const session = sessions.find((candidate) => candidate.id === c.req.param('id'))
  if (!session) return c.html(<Layout title="Not found"><main><div class="not-found wrap"><div class="eyebrow">404 / SESSION</div><h1>Session not found</h1><a class="pill" href="/timetable">タイムテーブルに戻る →</a></div></main></Layout>, 404)
  return c.html(<Layout title={session.title} active="timetable"><SessionPage session={session} /></Layout>)
})

app.get('/speakers/:id', (c) => {
  const speaker = speakers.find((candidate) => candidate.id === c.req.param('id'))
  return c.html(<Layout title={speaker?.name ?? 'Speaker'} description={speaker?.bio} ogImage={speaker?.ogpImage} url={c.req.url} active="speakers"><SpeakerPage speakerId={c.req.param('id')} /></Layout>)
})

app.notFound((c) => c.html(<Layout title="Not found"><main><div class="not-found wrap"><div class="eyebrow">404 / UNKNOWN WORLD</div><h1>Page not found</h1><p>探しているページは見つかりませんでした。</p><a class="pill" href="/">トップに戻る →</a></div></main></Layout>, 404))

export default app
