import { mkdir, readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import sharp from 'sharp'
import { event } from '../src/data/event'
import { speakers } from '../src/data/speakers'

const publicDir = join(process.cwd(), 'public')
const outputPath = join(publicDir, 'ogp', 'event.png')

const escapeXml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;')

const shortText = (value: string, maxChars: number) => {
  const chars = [...value.replace(/\s+/g, ' ').trim()]
  return chars.length > maxChars ? `${chars.slice(0, maxChars - 1).join('')}…` : chars.join('')
}

const colorFor = (index: number) => ['#2f80ed', '#ff5f50', '#39b86b', '#ffcc2f'][index % 4]

const fallbackImage = (label: string, color: string) => {
  const initial = escapeXml([...label].slice(0, 2).join(''))
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="400"><rect width="320" height="400" fill="${color}"/><circle cx="160" cy="140" r="72" fill="#fff" opacity=".9"/><text x="160" y="155" text-anchor="middle" font-family="Arial, sans-serif" font-size="42" font-weight="800" fill="#203040">${initial}</text><rect x="58" y="260" width="204" height="18" rx="9" fill="#fff" opacity=".85"/><rect x="92" y="294" width="136" height="12" rx="6" fill="#fff" opacity=".65"/></svg>`
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`
}

const imageDataUri = async (path: string | undefined, label: string, color: string) => {
  if (!path) return fallbackImage(label, color)
  try {
    let buffer: Buffer
    let remoteMime: string | undefined
    const parsedPath = new URL(path, 'https://local.invalid')
    const localPath = parsedPath.origin === 'https://sglt.under18.dev' ? parsedPath.pathname : undefined
    if (localPath) {
      buffer = await readFile(join(publicDir, localPath.replace(/^\//, '')))
    } else if (/^https?:\/\//.test(path)) {
      const response = await fetch(path)
      if (!response.ok) throw new Error(`Image request failed: ${response.status}`)
      buffer = Buffer.from(await response.arrayBuffer())
      remoteMime = response.headers.get('content-type')?.split(';')[0]
    } else {
      buffer = await readFile(join(publicDir, path.replace(/^\//, '')))
    }
    const extension = extname(new URL(path, 'https://local.invalid').pathname).toLowerCase()
    const mime = remoteMime ?? (extension === '.jpg' || extension === '.jpeg' ? 'image/jpeg' : extension === '.png' ? 'image/png' : 'image/webp')
    return `data:${mime};base64,${buffer.toString('base64')}`
  } catch {
    return fallbackImage(label, color)
  }
}

const speakersForOgp = event.ogpSpeakerIds.map((id) => speakers.find((speaker) => speaker.id === id)).filter((speaker): speaker is (typeof speakers)[number] => Boolean(speaker))
const selected = [...speakersForOgp, ...speakers].filter((speaker, index, all) => all.findIndex((candidate) => candidate.id === speaker.id) === index)
const images = await Promise.all(selected.map((speaker, index) => imageDataUri(speaker.icon, speaker.name, colorFor(index))))

const speakerTiles = selected.map((speaker, index) => {
  const column = index % 3
  const row = Math.floor(index / 3)
  const x = 875 + column * 78
  const y = 152 + row * 78
  return `<g transform="translate(${x} ${y})"><rect width="70" height="70" rx="15" fill="#fff" stroke="#203040" stroke-width="3"/><image href="${images[index]}" x="3" y="3" width="64" height="64" preserveAspectRatio="xMidYMid slice" clip-path="url(#tileClip)"/></g>`
}).join('')

const title = escapeXml(shortText(event.title, 28))
const subtitle = escapeXml(shortText(event.description, 34))
const dateLabel = escapeXml(shortText(event.dateLabel.replace('（月）', ' (Mon)').replace('（火）', ' (Tue)'), 40))
const venue = escapeXml(shortText(event.venue, 18))

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs>
  <clipPath id="tileClip"><rect x="3" y="3" width="64" height="64" rx="12"/></clipPath>
  <pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="2.2" fill="#203040" opacity=".28"/></pattern>
</defs>
<rect width="1200" height="630" fill="#fff"/>
<circle cx="-12" cy="-12" r="162" fill="#2f80ed"/>
<circle cx="1190" cy="-20" r="112" fill="#ffcc2f"/>
<circle cx="1160" cy="614" r="150" fill="#39b86b"/>
<circle cx="92" cy="558" r="34" fill="#ff5f50"/>
<circle cx="1070" cy="96" r="16" fill="#203040"/>
<rect x="1018" y="520" width="110" height="56" rx="28" fill="url(#dots)"/>
<text x="190" y="58" font-family="Arial, 'Noto Sans JP', sans-serif" font-size="26" font-weight="800" letter-spacing="2" fill="#203040">SANDA GAKUEN CULTURAL FESTIVAL</text>
<rect x="190" y="82" width="430" height="38" rx="19" fill="#203040"/>
<text x="405" y="108" text-anchor="middle" font-family="Arial, 'Noto Sans JP', sans-serif" font-size="17" font-weight="700" fill="#fff">${subtitle}</text>
<rect x="190" y="150" width="170" height="32" rx="16" fill="#ff5f50"/>
<text x="275" y="172" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="800" letter-spacing="2" fill="#fff">EVENT / 2026</text>
<text x="190" y="245" font-family="Arial, 'Noto Sans JP', sans-serif" font-size="49" font-weight="900" fill="#203040">知らなかった世界に、</text>
<text x="190" y="302" font-family="Arial, 'Noto Sans JP', sans-serif" font-size="49" font-weight="900" fill="#2f80ed">出会おう。</text>
<rect x="190" y="332" width="390" height="46" rx="23" fill="#ffcc2f"/>
<text x="385" y="362" text-anchor="middle" font-family="Arial, 'Noto Sans JP', sans-serif" font-size="21" font-weight="800" fill="#203040">10分のLT × 2日間</text>
<text x="875" y="130" font-family="Arial, sans-serif" font-size="15" font-weight="800" letter-spacing="1.5" fill="#203040">ALL SPEAKERS / ${selected.length}</text>
${speakerTiles}
<text x="190" y="518" font-family="Arial, 'Noto Sans JP', sans-serif" font-size="20" font-weight="700" fill="#203040">${title}</text>
<text x="190" y="552" font-family="Arial, 'Noto Sans JP', sans-serif" font-size="19" font-weight="700" fill="#203040">${dateLabel}  /  ${venue}</text>
<text x="190" y="589" font-family="Arial, sans-serif" font-size="16" font-weight="800" letter-spacing="1.5" fill="#2f80ed">FREE ENTRY  ·  TALK  ·  CULTURE</text>
<path d="M1124 548 l8 22 22 8-22 8-8 22-8-22-22-8 22-8z" fill="#ff5f50"/>
</svg>`

await mkdir(join(publicDir, 'ogp'), { recursive: true })
await sharp(Buffer.from(svg)).png().toFile(outputPath)
console.log(`Generated ${outputPath}`)
