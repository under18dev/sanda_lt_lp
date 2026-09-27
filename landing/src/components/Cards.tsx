import { speakers } from '../data/speakers'
import type { Session } from '../data/sessions'

const speakerById = new Map(speakers.map((speaker) => [speaker.id, speaker]))

export const SpeakerCard = ({ speakerId }: { speakerId: string }) => {
  const speaker = speakerById.get(speakerId)
  if (!speaker) return null
  return (
    <article class="speaker-card" data-speaker-card data-category={speaker.category}>
      <a class="speaker-card-link" href={`/speakers/${speaker.id}`} aria-label={`${speaker.name}の詳細を見る`}>
        <div class={`speaker-avatar ${speaker.icon ? 'has-image' : ''}`}>
          {speaker.icon ? <img src={speaker.icon} alt="" loading="lazy" /> : <span aria-hidden="true">{speaker.name.slice(0, 1)}</span>}
        </div>
        <div class="speaker-card-body">
          <div class="speaker-meta">{speaker.category.toUpperCase()} {speaker.online && ' / ONLINE'}</div>
          <h3>{speaker.name}</h3>
          <p>{speaker.role}</p>
        </div>
        <span class="card-arrow" aria-hidden="true">↗</span>
      </a>
    </article>
  )
}

export const SessionCard = ({ session, compact = false }: { session: Session; compact?: boolean }) => (
  <article class={`session-card session-card-${session.color} ${compact ? 'session-card-compact' : ''}`} data-session-card data-date={session.date} data-category={session.category}>
    <a class="session-card-link" href={`/sessions/${session.id}`} data-session-id={session.id}>
      <div class="session-time"><time>{session.start}</time><span>—</span><time>{session.end}</time></div>
      <div class="session-card-content">
        <div class="session-label">{session.category === 'special' ? 'SPECIAL' : '10 MIN TALK'}</div>
        <h3>{session.title}</h3>
        <p>{session.summary}</p>
        <div class="session-speakers">{session.speakerIds.map((id) => speakerById.get(id)?.name).filter(Boolean).join(' / ')}</div>
      </div>
      <span class="card-arrow" aria-hidden="true">↗</span>
    </a>
  </article>
)

export const SpeakerList = ({ ids }: { ids: string[] }) => (
  <div class="speaker-grid">{ids.map((id) => <SpeakerCard key={id} speakerId={id} />)}</div>
)
