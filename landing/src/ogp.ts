import { readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import sharp from 'sharp'
import type { Speaker } from './data/speakers'

const publicDir = join(process.cwd(), 'public')
const imageCache = new Map<string, Promise<string>>()

const escapeXml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;')

const textLines = (value: string, maxChars: number, maxLines: number) => {
  const chars = [...value.replace(/\s+/g, ' ').trim()]
  const lines: string[] = []
  for (let index = 0; index < chars.length && lines.length < maxLines; index += maxChars) {
    lines.push(chars.slice(index, index + maxChars).join(''))
  }
  if (chars.length > maxChars * maxLines) {
    lines[maxLines - 1] = `${[...lines[maxLines - 1]].slice(0, maxChars - 1).join('')}…`
  }
  return lines
}

const svgText = (value: string, x: number, y: number, maxChars: number, maxLines: number, lineHeight: number) =>
  textLines(value, maxChars, maxLines).map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`).join('')

const fallbackImage = (label: string, color: string) => {
  const initial = escapeXml([...label].slice(0, 2).join(''))
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="400"><rect width="320" height="400" fill="${color}"/><circle cx="160" cy="140" r="72" fill="#fff" opacity=".9"/><text x="160" y="155" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="800" fill="#203040">${initial}</text></svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

const imageDataUri = (path: string | undefined, label: string, color: string) => {
  const cacheKey = path ?? `fallback:${label}:${color}`
  const cached = imageCache.get(cacheKey)
  if (cached) return cached
  const promise = (async () => {
    if (!path) return fallbackImage(label, color)
    try {
      let buffer: Buffer
      let remoteMime: string | undefined
      const parsedPath = new URL(path, 'https://local.invalid')
      const localPath = parsedPath.origin === 'https://sglt.under18.dev' ? parsedPath.pathname : undefined
      if (localPath) {
        buffer = await readFile(join(publicDir, localPath.replace(/^\//, '').split('?')[0]))
      } else if (/^https?:\/\//.test(path)) {
        const response = await fetch(path)
        if (!response.ok) throw new Error(`Image request failed: ${response.status}`)
        buffer = Buffer.from(await response.arrayBuffer())
        remoteMime = response.headers.get('content-type')?.split(';')[0]
      } else {
        buffer = await readFile(join(publicDir, path.replace(/^\//, '').split('?')[0]))
      }
      const extension = extname(new URL(path, 'https://local.invalid').pathname).toLowerCase()
      const mime = remoteMime ?? (extension === '.jpg' || extension === '.jpeg' ? 'image/jpeg' : extension === '.png' ? 'image/png' : 'image/webp')
      return `data:${mime};base64,${buffer.toString('base64')}`
    } catch {
      return fallbackImage(label, color)
    }
  })()
  imageCache.set(cacheKey, promise)
  return promise
}

const createOgp = async (options: { label: string; title: string; subtitle: string; meta: string; image?: string; accent: string }) => {
  const image = await imageDataUri(options.image, options.title, options.accent)
  const label = escapeXml(options.label)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><clipPath id="photo"><rect x="850" y="120" width="270" height="350" rx="34"/></clipPath><pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="2.2" fill="#203040" opacity=".28"/></pattern></defs>
<rect width="1200" height="630" fill="#fff"/><circle cx="-12" cy="-12" r="170" fill="#2f80ed"/><circle cx="1190" cy="-20" r="120" fill="#ffcc2f"/><circle cx="1160" cy="614" r="155" fill="#39b86b"/><rect x="1005" y="525" width="120" height="60" rx="30" fill="url(#dots)"/>
<text x="110" y="72" font-family="Arial, 'Noto Sans CJK JP', sans-serif" font-size="27" font-weight="800" letter-spacing="2" fill="#203040">SANDA GAKUEN CULTURAL FESTIVAL</text>
<rect x="110" y="112" width="190" height="36" rx="18" fill="${options.accent}"/><text x="205" y="136" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="800" letter-spacing="2" fill="#fff">${label}</text>
<text x="110" y="225" font-family="Arial, 'Noto Sans CJK JP', sans-serif" font-size="54" font-weight="900" fill="#203040">${svgText(options.title, 110, 225, 18, 2, 58)}</text>
<text x="110" y="350" font-family="Arial, 'Noto Sans CJK JP', sans-serif" font-size="25" font-weight="700" fill="#2f80ed">${svgText(options.subtitle, 110, 350, 30, 1, 0)}</text>
<rect x="110" y="385" width="600" height="2" fill="#203040"/><text x="110" y="440" font-family="Arial, 'Noto Sans CJK JP', sans-serif" font-size="22" font-weight="700" fill="#203040">${svgText(options.meta, 110, 440, 45, 1, 0)}</text>
<text x="110" y="548" font-family="Arial, 'Noto Sans CJK JP', sans-serif" font-size="20" font-weight="700" fill="#203040">知らない世界の話をしよう / 三田学園文化祭LT会</text>
<image href="${image}" x="850" y="120" width="270" height="350" preserveAspectRatio="xMidYMid slice" clip-path="url(#photo)"/>
<rect x="870" y="438" width="230" height="42" rx="21" fill="#203040"/><text x="985" y="465" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" font-weight="800" letter-spacing="1.5" fill="#fff">SPEAKER / PROFILE</text>
<path d="M1115 540 l8 22 22 8-22 8-8 22-8-22-22-8 22-8z" fill="#ff5f50"/></svg>`
  return sharp(Buffer.from(svg)).png().toBuffer()
}

export const createSpeakerOgp = (speaker: Speaker) => createOgp({
  label: 'SPEAKER',
  title: speaker.name,
  subtitle: speaker.role,
  meta: speaker.bio.replace(/\s+/g, ' ').trim(),
  image: speaker.icon,
  accent: '#ff5f50',
})

export const createSessionOgp = (session: { title: string; date: string; start: string; end: string; speakerIds: string[] }, speakers: Speaker[]) => {
  const speakerNames = session.speakerIds.map((id) => speakers.find((speaker) => speaker.id === id)?.name).filter(Boolean).join(' / ') || 'TBD'
  const speaker = speakers.find((candidate) => candidate.id === session.speakerIds[0])
  return createOgp({
    label: 'SESSION',
    title: session.title,
    subtitle: speakerNames,
    meta: `${session.date}  /  ${session.start} — ${session.end}`,
    image: speaker?.icon,
    accent: '#2f80ed',
  })
}
