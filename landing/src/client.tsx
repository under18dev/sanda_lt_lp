/** @jsxImportSource hono/jsx/dom */
import { useEffect, useState } from 'hono/jsx/dom'
import { createRoot } from 'hono/jsx/dom/client'
import { sessionDates } from './data/sessions'
import { speakerCategories } from './data/speakers'
import './styles/app.css'

const SessionControls = () => {
  const [date, setDate] = useState<string>(sessionDates[0].id)
  const [category, setCategory] = useState('all')

  useEffect(() => {
    document.querySelectorAll<HTMLElement>('[data-session-card]').forEach((card) => {
      const matchesDate = card.dataset.date === date
      const matchesCategory = category === 'all' || card.dataset.category === category
      card.hidden = !(matchesDate && matchesCategory)
    })
  }, [date, category])

  return <div class="filter-panel" aria-label="タイムテーブルの絞り込み">
    <div class="filter-row"><span class="filter-label">DATE</span>{sessionDates.map((item) => <button class={date === item.id ? 'filter-button is-active' : 'filter-button'} type="button" onClick={() => setDate(item.id)}>{item.label}</button>)}</div>
    <div class="filter-row"><span class="filter-label">TYPE</span>{[{ id: 'all', label: 'ALL' }, { id: 'talk', label: 'TALKS' }, { id: 'special', label: 'SPECIAL' }].map((item) => <button class={category === item.id ? 'filter-button is-active' : 'filter-button'} type="button" onClick={() => setCategory(item.id)}>{item.label}</button>)}</div>
  </div>
}

const SpeakerControls = () => {
  const [category, setCategory] = useState('all')

  useEffect(() => {
    document.querySelectorAll<HTMLElement>('[data-speaker-card]').forEach((card) => {
      card.hidden = !(category === 'all' || card.dataset.category === category)
    })
  }, [category])

  return <div class="filter-panel" aria-label="登壇者の絞り込み"><div class="filter-row"><span class="filter-label">FIELD</span>{speakerCategories.map((item) => <button class={category === item.id ? 'filter-button is-active' : 'filter-button'} type="button" onClick={() => setCategory(item.id)}>{item.label}</button>)}</div></div>
}

const MobileMenu = () => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const trigger = document.querySelector<HTMLButtonElement>('[data-menu-trigger]')
    if (!trigger) return
    const toggle = () => setOpen((current) => !current)
    trigger.addEventListener('click', toggle)
    return () => trigger.removeEventListener('click', toggle)
  }, [])

  useEffect(() => {
    const trigger = document.querySelector<HTMLButtonElement>('[data-menu-trigger]')
    trigger?.setAttribute('aria-expanded', String(open))
  }, [open])

  if (!open) return null
  return <nav class="mobile-menu" id="mobile-menu" aria-label="モバイルナビゲーション"><a href="/timetable">PROGRAM</a><a href="/speakers">SPEAKERS</a><a href="/#special">SPECIAL</a><a href="/sponsors">SPONSORS</a><a href="/faq">FAQ</a></nav>
}

const SessionDialog = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const data = document.getElementById('runtime-sessions')?.textContent
  const sessions = data ? JSON.parse(data) as Array<{ id: string; category: string; title: string; detail: string; date: string; start: string; end: string }> : []
  const selected = sessions.find((session) => session.id === selectedId)

  useEffect(() => {
    const open = (event: Event) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const link = target.closest<HTMLAnchorElement>('[data-session-id]')
      if (!link) return
      const id = link.dataset.sessionId
      if (!id) return
      event.preventDefault()
      setSelectedId(id)
    }
    document.addEventListener('click', open)
    return () => document.removeEventListener('click', open)
  }, [])

  if (!selected) return null
  return <div class="modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setSelectedId(null) }}><section class="session-modal" role="dialog" aria-modal="true" aria-labelledby="session-modal-title"><button class="modal-close" type="button" aria-label="閉じる" onClick={() => setSelectedId(null)}>×</button><div class="session-label">{selected.category === 'special' ? 'SPECIAL' : '10 MIN TALK'}</div><h2 id="session-modal-title">{selected.title}</h2><p>{selected.detail}</p><div class="detail-meta"><span>{selected.date}</span><span>{selected.start} — {selected.end}</span></div><a class="pill" href={`/sessions/${selected.id}`}>詳細ページを見る ↗</a></section></div>
}

const SponsorDialog = () => {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const data = document.getElementById('runtime-sponsors')?.textContent
  const sponsors = data ? JSON.parse(data) as Array<{ id: string; name: string; tier: string; description: string; detail: string; logo?: string; url?: string }> : []
  const selected = sponsors.find((sponsor) => sponsor.id === selectedId)
  useEffect(() => {
    const open = (event: Event) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const card = target.closest<HTMLAnchorElement>('[data-sponsor-id]')
      if (!card?.dataset.sponsorId) return
      event.preventDefault()
      setSelectedId(card.dataset.sponsorId)
    }
    document.addEventListener('click', open)
    return () => document.removeEventListener('click', open)
  }, [])
  if (!selected) return null
  return <div class="modal-backdrop" role="presentation" onClick={(event) => { if (event.target === event.currentTarget) setSelectedId(null) }}><section class="session-modal sponsor-modal" role="dialog" aria-modal="true" aria-labelledby="sponsor-modal-title"><button class="modal-close" type="button" aria-label="閉じる" onClick={() => setSelectedId(null)}>×</button><div class="session-label">{selected.tier} / SPONSOR</div>{selected.logo && <img class="sponsor-modal-logo" src={selected.logo} alt={`${selected.name} ロゴ`} />}<h2 id="sponsor-modal-title">{selected.name}</h2><p class="preserve-line-breaks">{selected.detail}</p><div class="sponsor-modal-actions">{selected.url && <a class="pill primary" href={selected.url} target="_blank" rel="noreferrer">Webサイトを見る ↗</a>}<a class="pill" href={`/sponsors/${selected.id}`}>詳細ページを見る ↗</a></div></section></div>
}

const App = () => {
  useEffect(() => {
    const cleanups = Array.from(document.querySelectorAll<HTMLElement>('.sponsor-groups')).map((group) => {
      const images = Array.from(group.querySelectorAll<HTMLImageElement>('.sponsor-logo img'))
      const updateRatio = () => {
        const ratios = images.filter((image) => image.naturalWidth > 0 && image.naturalHeight > 0)
          .map((image) => image.naturalWidth / image.naturalHeight)
        if (ratios.length > 0) group.style.setProperty('--logo-aspect-ratio', String(Math.max(...ratios)))
      }
      images.forEach((image) => image.addEventListener('load', updateRatio))
      updateRatio()
      return () => images.forEach((image) => image.removeEventListener('load', updateRatio))
    })
    return () => cleanups.forEach((cleanup) => cleanup())
  }, [])

  useEffect(() => {
    const reveal = () => document.querySelectorAll<HTMLElement>('.section').forEach((section) => section.classList.add('is-visible'))
    reveal()

    const loader = document.querySelector<HTMLElement>('[data-page-loader]')
    if (!loader) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      loader.remove()
      return
    }
    const hideTimer = window.setTimeout(() => loader.classList.add('is-hidden'), 1050)
    const removeTimer = window.setTimeout(() => loader.remove(), 1500)
    return () => {
      window.clearTimeout(hideTimer)
      window.clearTimeout(removeTimer)
    }
  }, [])
  return <><MobileMenu /><SessionDialog /><SponsorDialog /></>
}

const clientRoot = document.getElementById('client-root')
if (clientRoot) {
  createRoot(clientRoot).render(<App />)
}

const sessionControls = document.getElementById('session-controls')
if (sessionControls) createRoot(sessionControls).render(<SessionControls />)

const speakerControls = document.getElementById('speaker-controls')
if (speakerControls) createRoot(speakerControls).render(<SpeakerControls />)
