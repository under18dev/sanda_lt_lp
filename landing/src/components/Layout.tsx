import type { Child } from 'hono/jsx'
import { event } from '../data/event'

const assetVersion = '2026-09-27-08'

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
  const absoluteUrl = url ? new URL(url).toString() : undefined
  const absoluteOgImage = ogImage && absoluteUrl ? new URL(ogImage, absoluteUrl).toString() : ogImage

  return <html lang="ja">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="description" content={description} />
      <meta name="theme-color" content="#ededf0" />
      <title>{pageTitle}</title>
      <meta property="og:type" content="website" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      {absoluteUrl && <meta property="og:url" content={absoluteUrl} />}
      {absoluteOgImage && <meta property="og:image" content={absoluteOgImage} />}
      <meta name="twitter:card" content={absoluteOgImage ? 'summary_large_image' : 'summary'} />
      {absoluteOgImage && <meta name="twitter:image" content={absoluteOgImage} />}
      <link rel="stylesheet" href={`/assets/app.css?v=${assetVersion}`} />
    </head>
    <body>
      <div class="site-shell">
        <Header active={active} />
        {children}
        <Footer />
      </div>
      <div id="client-root" data-active={active ?? ''}></div>
      <script type="module" src={`/assets/client.js?v=${assetVersion}`}></script>
    </body>
  </html>
}

export const Header = ({ active }: { active?: string }) => (
  <header class="site-header wrap">
    <a class="brand" href="/" aria-label="知らない世界の話をしよう トップページ">{event.shortTitle}</a>
    <nav class="site-nav" aria-label="メインナビゲーション">
      <a class={active === 'timetable' ? 'is-active' : ''} href="/timetable">PROGRAM</a>
      <a class={active === 'speakers' ? 'is-active' : ''} href="/speakers">SPEAKERS</a>
      <a class={active === 'special' ? 'is-active' : ''} href="/#special">SPECIAL</a>
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
