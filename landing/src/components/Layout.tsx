import type { Child } from 'hono/jsx'
import { event, sessions, sponsors } from '../data/runtime'

const assetVersion = '2026-09-27-22'

type LayoutProps = {
  title?: string
  description?: string
  ogImage?: string
  url?: string
  children: Child
  active?: string
}

export const Layout = ({ title, description = event.description, ogImage = event.defaultOgpImage, url, children, active }: LayoutProps) => {
  const pageTitle = title ? `${title} | ${event.title}` : event.title
  const requestPath = url ? new URL(url).pathname : '/'
  const canonicalUrl = new URL(requestPath, event.siteUrl).toString()
  const absoluteOgImage = ogImage ? new URL(ogImage, event.siteUrl).toString() : undefined
  const metaDescription = shorten(description, 155)
  const structuredData = title ? {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageTitle,
    description: metaDescription,
    url: canonicalUrl,
    isPartOf: { '@type': 'WebSite', name: event.title, url: event.siteUrl },
  } : {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description,
    url: canonicalUrl,
    image: [new URL(event.ogpImage, event.siteUrl).toString()],
    startDate: '2026-11-02T09:30:00+09:00',
    endDate: '2026-11-02T16:00:00+09:00',
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: event.venue,
      address: { '@type': 'PostalAddress', streetAddress: '南が丘2-13-65', postalCode: '669-1535', addressLocality: '三田市', addressRegion: '兵庫県', addressCountry: 'JP' },
    },
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY', availability: 'https://schema.org/InStock', url: event.connpassUrl },
    organizer: { '@type': 'Person', name: event.organizer, url: event.siteUrl },
  }

  return <html lang="ja">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content={metaDescription} />
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="theme-color" content="#ededf0" />
      <title>{pageTitle}</title>
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={event.title} />
      <meta property="og:locale" content="ja_JP" />
      {absoluteOgImage && <meta property="og:image" content={absoluteOgImage} />}
      {absoluteOgImage && <meta property="og:image:width" content="1200" />}
      {absoluteOgImage && <meta property="og:image:height" content="630" />}
      {absoluteOgImage && <meta property="og:image:alt" content={`${pageTitle} OGP`} />}
      <meta name="twitter:card" content={absoluteOgImage ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {absoluteOgImage && <meta name="twitter:image" content={absoluteOgImage} />}
      {absoluteOgImage && <meta name="twitter:image:alt" content={`${pageTitle} OGP`} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <link rel="stylesheet" href={`/assets/app.css?v=${assetVersion}`} />
    </head>
    <body>
      <div class="site-shell">
        <Header active={active} />
        {children}
        <Footer />
      </div>
      <div id="client-root" data-active={active ?? ''}></div>
      <script type="application/json" id="runtime-sessions" dangerouslySetInnerHTML={{ __html: JSON.stringify(sessions).replaceAll('<', '\\u003c') }} />
      <script type="application/json" id="runtime-sponsors" dangerouslySetInnerHTML={{ __html: JSON.stringify(sponsors).replaceAll('<', '\\u003c') }} />
      <script type="module" src={`/assets/client.js?v=${assetVersion}`}></script>
    </body>
  </html>
}

const shorten = (value: string, maxLength: number) => {
  const normalized = value.replace(/\s+/g, ' ').trim()
  return normalized.length > maxLength ? `${[...normalized].slice(0, maxLength - 1).join('')}…` : normalized
}

export const Header = ({ active }: { active?: string }) => (
  <header class="site-header wrap">
    <a class="brand" href="/" aria-label="知らない世界の話をしよう トップページ">{event.shortTitle}</a>
    <nav class="site-nav" aria-label="メインナビゲーション">
      <a class={active === 'timetable' ? 'is-active' : ''} href="/timetable">PROGRAM</a>
      <a class={active === 'speakers' ? 'is-active' : ''} href="/speakers">SPEAKERS</a>
      <a class={active === 'special' ? 'is-active' : ''} href="/#special">SPECIAL</a>
      <a class={active === 'sponsors' ? 'is-active' : ''} href="/sponsors">SPONSORS</a>
      <a class={active === 'faq' ? 'is-active' : ''} href="/faq">FAQ</a>
    </nav>
    <a class="pill header-join" href={event.connpassUrl} target="_blank" rel="noreferrer">参加登録 ↗</a>
    <button class="menu-trigger" type="button" data-menu-trigger aria-expanded="false" aria-controls="mobile-menu">MENU</button>
  </header>
)

export const Footer = () => (
  <footer class="site-footer wrap">
    <span>{event.title} / 三田学園文化祭LT会</span>
    <span>{event.dateLabel} / {event.fee}</span>
  </footer>
)

export const PageIntro = ({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) => (
  <section class="page-intro wrap">
    <div class="eyebrow">{eyebrow}</div>
    <h1>{title}</h1>
    <p>{description}</p>
  </section>
)

export const SectionHeading = ({ title, description }: { title: string; description?: string }) => (
  <div class="section-heading">
    <h2>{title}</h2>
    {description && <p>{description}</p>}
  </div>
)
