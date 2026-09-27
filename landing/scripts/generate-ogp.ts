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
    if (/^https?:\/\//.test(path)) {
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
const selected = [...speakersForOgp, ...speakers].filter((speaker, index, all) => all.findIndex((candidate) => candidate.id === speaker.id) === index).slice(0, 4)
const images = await Promise.all(selected.map((speaker, index) => imageDataUri(speaker.icon, speaker.name, colorFor(index))))
while (images.length < 4) images.push(fallbackImage('TBD', colorFor(images.length)))

const imageCard = (href: string, x: number, y: number, rotate: number) => `<g transform="translate(${x} ${y}) rotate(${rotate} 56 56)"><rect width="112" height="112" rx="22" fill="#fff" stroke="#203040" stroke-width="4"/><image href="${href}" x="8" y="8" width="96" height="96" preserveAspectRatio="xMidYMid slice" clip-path="url(#cardClip)"/></g>`
const mainImage = `<image href="${images[3]}" x="890" y="174" width="250" height="320" preserveAspectRatio="xMidYMid slice" clip-path="url(#photoClip)"/>`

const title = escapeXml(event.title)
const subtitle = escapeXml(event.description)
const dateLabel = escapeXml(event.dateLabel.replace('（月）', ' (Mon)').replace('（火）', ' (Tue)'))
const venue = escapeXml(event.venue)
const mainSpeaker = escapeXml(selected[3]?.name ?? '発表者 TBD')

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs>
  <clipPath id="cardClip"><rect x="8" y="8" width="96" height="96" rx="16"/></clipPath>
  <clipPath id="photoClip"><rect x="890" y="174" width="250" height="320" rx="34"/></clipPath>
  <pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="3" cy="3" r="2.2" fill="#203040" opacity=".28"/></pattern>
</defs>
<rect width="1200" height="630" fill="#fff"/>
<circle cx="-12" cy="-12" r="162" fill="#2f80ed"/>
<circle cx="1190" cy="-20" r="112" fill="#ffcc2f"/>
<circle cx="1160" cy="614" r="150" fill="#39b86b"/>
<circle cx="92" cy="558" r="34" fill="#ff5f50"/>
<circle cx="1070" cy="96" r="16" fill="#203040"/>
<rect x="1018" y="520" width="110" height="56" rx="28" fill="url(#dots)"/>
${imageCard(images[0], 48, 104, -8)}
${imageCard(images[1], 1018, 112, 7)}
${imageCard(images[2], 52, 462, 6)}
<text x="190" y="58" font-family="Arial, 'Noto Sans JP', sans-serif" font-size="26" font-weight="800" letter-spacing="2" fill="#203040">SANDA GAKUEN CULTURAL FESTIVAL</text>
<rect x="190" y="82" width="430" height="38" rx="19" fill="#203040"/>
<text x="405" y="108" text-anchor="middle" font-family="Arial, 'Noto Sans JP', sans-serif" font-size="17" font-weight="700" fill="#fff">${subtitle.slice(0, 34)}</text>
<rect x="190" y="150" width="170" height="32" rx="16" fill="#ff5f50"/>
<text x="275" y="172" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="800" letter-spacing="2" fill="#fff">EVENT / 2026</text>
<text x="190" y="245" font-family="Arial, 'Noto Sans JP', sans-serif" font-size="49" font-weight="900" fill="#203040">知らなかった世界に、</text>
<text x="190" y="302" font-family="Arial, 'Noto Sans JP', sans-serif" font-size="49" font-weight="900" fill="#2f80ed">出会おう。</text>
<rect x="190" y="332" width="390" height="46" rx="23" fill="#ffcc2f"/>
<text x="385" y="362" text-anchor="middle" font-family="Arial, 'Noto Sans JP', sans-serif" font-size="21" font-weight="800" fill="#203040">10分のLT × 2日間</text>
${mainImage}
<rect x="908" y="458" width="214" height="36" rx="18" fill="#203040"/>
<text x="1015" y="482" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" font-weight="800" letter-spacing="1.5" fill="#fff">SPEAKER / ${mainSpeaker.slice(0, 10)}</text>
<text x="190" y="518" font-family="Arial, 'Noto Sans JP', sans-serif" font-size="20" font-weight="700" fill="#203040">${title}</text>
<text x="190" y="552" font-family="Arial, 'Noto Sans JP', sans-serif" font-size="19" font-weight="700" fill="#203040">${dateLabel}  /  ${venue}</text>
<text x="190" y="589" font-family="Arial, sans-serif" font-size="16" font-weight="800" letter-spacing="1.5" fill="#2f80ed">FREE ENTRY  ·  TALK  ·  CULTURE</text>
<path d="M1124 548 l8 22 22 8-22 8-8 22-8-22-22-8 22-8z" fill="#ff5f50"/>
</svg>`

await mkdir(join(publicDir, 'ogp'), { recursive: true })
await sharp(Buffer.from(svg)).png().toFile(outputPath)
console.log(`Generated ${outputPath}`)
