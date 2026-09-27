import { event, faqs, sessionDates, sessions, speakers, speakerCategories } from '../data/runtime'
import { SectionHeading } from './Layout'
import { SessionCard, SpeakerCard, SpeakerList, TimetableRow } from './Cards'

export const Hero = () => (
  <section class="hero wrap">
    <div class="page-loader" data-page-loader aria-hidden="true">
      <div class="page-loader-signal"><span></span><span></span><span></span><span></span></div>
      <div class="page-loader-label">SIGNAL RECEIVED</div>
      <strong>知らない世界の話をしよう</strong>
    </div>
    <div class="hero-decoration" aria-hidden="true"><span></span><span></span><span></span></div>
    <div class="eyebrow">SANDA GAKUEN CULTURAL FESTIVAL</div>
    <h1>知らない世界の<br /><em>話をしよう。</em></h1>
    <p class="hero-copy">{event.description}</p>
    <EventFacts />
    <div class="hero-actions"><a class="pill primary" href={event.connpassUrl} target="_blank" rel="noreferrer">参加する ↗</a><a class="pill" href="#program">タイムテーブルを見る ↓</a></div>
  </section>
)

export const EventFacts = () => (
  <div class="info-row">
    <span class="info"><i class="dot-green"></i>{event.dateLabel}</span>
    <span class="info"><i class="dot-blue"></i>一般参加 {event.timeLabel}</span>
    <span class="info"><i class="dot-yellow"></i>{event.venue} / 中学校舎</span>
    <span class="info"><i class="dot-red"></i>参加費 {event.fee}</span>
  </div>
)

export const About = () => (
  <section class="section wrap" id="about"><SectionHeading title={'知らないから、\nおもしろい。'} description="技術、小説、SNS、医療、AI。分野も年齢も関係なく、「自分の好きな世界」を10分で紹介するイベントです。" /></section>
)

export const TimetablePreview = () => (
  <section class="section wrap" id="program">
    <SectionHeading title="Timetable" description="気になるタイトルから、知らない世界へ。詳細ページでは日付やカテゴリで絞り込めます。" />
    <div class="preview-grid">{sessions.slice(0, 6).map((session) => <SessionCard key={session.id} session={session} compact />)}</div>
    <div class="section-link"><a class="pill" href="/timetable">すべてのタイムテーブルを見る →</a></div>
  </section>
)

export const SpeakersPreview = () => (
  <section class="section wrap" id="speakers"><SectionHeading title="Speakers" description="話す人が違えば、見える世界も変わる。" /><SpeakerList ids={speakers.map((speaker) => speaker.id)} /><div class="section-link"><a class="pill" href="/speakers">登壇者一覧を見る →</a></div></section>
)

export const AiWerewolf = () => (
  <section class="section wrap" id="special">
    <SectionHeading title="Special" description="このイベントでしか覗けない、つくる側の世界。" />
    <div class="feature-grid"><article class="feature-main"><span class="pill pill-dark">13:00 — 15:00</span><h3>AI人狼を遊んで、<br />つくり方を知る。</h3><p>まずは参加者としてゲームを体験。そのあと、生成AIにどう作らせたのか、どこまで作れたのかを見せます。</p><span class="feature-mark" aria-hidden="true">AI</span></article><article class="feature-side"><div class="eyebrow">PLAY → HOW IT WAS MADE</div><h3>ほとんどコードを書かずに、アプリを作る。</h3><p>プロンプト、ログ、内部の仕組み。AIと一緒に開発する現場を、そのまま紹介します。</p><a href="/sessions/ai-werewolf-making">詳細を見る ↗</a></article></div>
  </section>
)

export const AccessPreview = () => (
  <section class="section wrap" id="access"><SectionHeading title="Access" description="一般参加は09:30から。スタッフ準備時間とは分けて案内しています。" /><div class="access-grid"><div class="access-item"><span>DATE</span><strong>{event.dateLabel}</strong><p>一般参加 {event.timeLabel}<br />{event.setupTimeLabel}</p></div><div class="access-item"><span>PLACE</span><strong>{event.venue}</strong><p>{event.venueDetail}</p></div><div class="access-item"><span>ENTRY</span><strong>{event.fee}</strong><p>定員 {event.capacity}</p></div></div><div class="section-link"><a class="pill" href="/access">アクセス・参加方法を見る →</a></div></section>
)

export const FaqPreview = () => (
  <section class="section wrap" id="faq"><SectionHeading title="FAQ" description="はじめてでも大丈夫。よくある質問をまとめています。" /><div class="faq-list">{faqs.slice(0, 4).map((faq) => <details key={faq.id}><summary>{faq.question}<span>＋</span></summary><p>{faq.answer}</p></details>)}</div><div class="section-link"><a class="pill" href="/faq">FAQをすべて見る →</a></div></section>
)

export const TimetablePage = () => (
  <main><PageDataIntro eyebrow="PROGRAM / TIMETABLE" title="Timetable" description="時間の流れに沿って、気になる世界を探せます。日付とカテゴリで絞り込めます。" /><section class="section wrap"><div class="client-island" id="session-controls" data-session-controls data-dates={JSON.stringify(sessionDates)}></div><div class="timetable" role="list" aria-label="タイムテーブル">{sessions.map((session) => <TimetableRow key={session.id} session={session} />)}</div></section></main>
)

export const SpeakersPage = () => (
  <main><PageDataIntro eyebrow="PEOPLE / SPEAKERS" title="Speakers" description="それぞれの好きな世界を持ち寄る人たち。" /><section class="section wrap"><div class="client-island" id="speaker-controls" data-speaker-controls></div><div class="speaker-grid speaker-grid-large">{speakers.map((speaker) => <SpeakerCard key={speaker.id} speakerId={speaker.id} />)}</div></section></main>
)

export const AccessPage = () => (
  <main><PageDataIntro eyebrow="PLACE / ACCESS" title="Access" description="三田学園文化祭の中学校舎で開催します。一般参加は09:30から、スタッフ準備は09:00からです。" /><section class="section wrap"><div class="access-detail-grid"><div><span>DATE</span><h2>{event.dateLabel}</h2><p>一般参加 {event.timeLabel}<br />{event.setupTimeLabel}</p></div><div><span>VENUE</span><h2>{event.venue}</h2><p>{event.venueDetail}</p></div><div><span>ENTRY</span><h2>{event.fee}</h2><p>定員 {event.capacity} / connpass登録制</p></div><div><span>STREAM</span><h2>{event.streamUrl ? 'YouTube' : 'TBD'}</h2><p>{event.streamUrl ? <a href={event.streamUrl}>配信を見る ↗</a> : '配信URLは準備中です。'}</p></div></div><div class="notice"><strong>文化祭への入場について</strong><p>文化祭側の入場ルールに従ってください。詳細は決まり次第、connpassとこのサイトでお知らせします。</p></div><a class="pill primary" href={event.connpassUrl} target="_blank" rel="noreferrer">connpassで参加する ↗</a></section></main>
)

export const FaqPage = () => (
  <main><PageDataIntro eyebrow="QUESTIONS / FAQ" title="FAQ" description="参加前に気になることをまとめました。" /><section class="section wrap"><div class="faq-list faq-list-large">{faqs.map((faq) => <details key={faq.id}><summary>{faq.question}<span>＋</span></summary><p>{faq.answer}</p></details>)}</div></section></main>
)

export const SessionPage = ({ session }: { session: (typeof sessions)[number] }) => (
  <main><PageDataIntro eyebrow={`${session.category.toUpperCase()} / ${session.start} — ${session.end}`} title={session.title} description={session.summary} compactTitle /><section class="section wrap detail-copy"><div class={`detail-color detail-color-${session.color}`}></div><p class="detail-lead">{session.detail}</p><div class="detail-meta"><span>DATE {session.date}</span><span>TIME {session.start} — {session.end}</span><span>SPEAKER {session.speakerIds.map((id) => speakers.find((speaker) => speaker.id === id)?.name).join(' / ')}</span></div><a class="pill" href="/timetable">タイムテーブルに戻る →</a></section></main>
)

export const SpeakerPage = ({ speakerId }: { speakerId: string }) => {
  const speaker = speakers.find((candidate) => candidate.id === speakerId)
  if (!speaker) return <main><PageDataIntro eyebrow="404 / SPEAKER" title="Speaker not found" description="登壇者が見つかりませんでした。" /></main>
  const speakerSessions = sessions.filter((session) => session.speakerIds.includes(speaker.id))
  return (
    <main>
      <PageDataIntro eyebrow={`${speaker.category.toUpperCase()} / SPEAKER`} title={speaker.name} description={speaker.bio} preserveLineBreaks />
      <section class="section wrap speaker-detail">
        <div class={`speaker-detail-avatar ${speaker.icon ? 'has-image' : ''}`}>
          {speaker.icon ? <img src={speaker.icon} alt="" /> : <span aria-hidden="true">{speaker.name.slice(0, 1)}</span>}
        </div>
        <div>
          <div class="eyebrow">PROFILE</div>
          <p class="detail-lead preserve-line-breaks">{speaker.bio}</p>
          <p>{speaker.role}{speaker.online ? ' / ONLINE' : ''}</p>
          <h2>Sessions</h2>
          <div class="detail-grid">{speakerSessions.map((session) => <SessionCard key={session.id} session={session} compact />)}</div>
          <a class="pill" href="/speakers">登壇者一覧に戻る →</a>
        </div>
      </section>
    </main>
  )
}

const PageDataIntro = ({ eyebrow, title, description, preserveLineBreaks = false, compactTitle = false }: { eyebrow: string; title: string; description: string; preserveLineBreaks?: boolean; compactTitle?: boolean }) => {
  const titleLengthClass = title.length > 52 ? 'page-intro-title-extra-long' : title.length > 30 ? 'page-intro-title-long' : ''
  return <section class={`page-intro wrap ${compactTitle ? `page-intro-session ${titleLengthClass}` : ''}`}><div class="eyebrow">{eyebrow}</div><h1>{title}</h1><p class={preserveLineBreaks ? 'preserve-line-breaks' : undefined}>{description}</p></section>
}
