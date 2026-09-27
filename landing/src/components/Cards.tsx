import { speakers } from '../data/speakers'
import type { Session } from '../data/sessions'

const speakerById = new Map(speakers.map((speaker) => [speaker.id, speaker]))

const sessionDuration = (session: Session) => {
  const toMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }
  return toMinutes(session.end) - toMinutes(session.start)
}

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

const SessionCardContent = ({ session }: { session: Session }) => <><div class="session-time"><time>{session.start}</time><span>—</span><time>{session.end}</time></div><div class="session-card-content"><div class="session-label">{session.category === 'special' ? 'SPECIAL' : session.category === 'break' ? 'BREAK' : `${sessionDuration(session)} MIN TALK`}</div><h3>{session.title}</h3><p>{session.summary}</p><div class="session-speakers">{session.speakerIds.map((id) => speakerById.get(id)?.name).filter(Boolean).join(' / ')}</div></div>{session.category !== 'break' && <span class="card-arrow" aria-hidden="true">↗</span>}</>

export const SessionCard = ({ session, compact = false }: { session: Session; compact?: boolean }) => (
  <article class={`session-card session-card-${session.color} ${compact ? 'session-card-compact' : ''} ${session.category === 'break' ? 'session-card-break' : ''}`} data-session-card data-date={session.date} data-category={session.category}>
    {session.category === 'break' ? <div class="session-card-link session-card-note"><SessionCardContent session={session} /></div> : <a class="session-card-link" href={`/sessions/${session.id}`} data-session-id={session.id}><SessionCardContent session={session} /></a>}
  </article>
)

export const TimetableRow = ({ session }: { session: Session }) => {
  const duration = sessionDuration(session)
  const label = session.category === 'special' ? 'SPECIAL' : session.category === 'break' ? 'BREAK' : `${duration} MIN TALK`
  const speakerNames = session.speakerIds.map((id) => speakerById.get(id)?.name).filter(Boolean).join(' / ')
  const content = <><div class="timetable-row-main"><div class="session-label">{label}</div><h3>{session.title}</h3><p>{session.summary}</p></div><div class="timetable-row-meta"><strong>{speakerNames || '―'}</strong>{session.category !== 'break' && <span aria-hidden="true">↗</span>}</div></>
  return <article class={`timetable-row timetable-row-${session.color} ${session.category === 'break' ? 'timetable-row-break' : ''}`} data-session-card data-date={session.date} data-category={session.category}>
    <div class="timetable-row-time"><time>{session.start}</time><span>{session.end}</span></div>
    {session.category === 'break' ? <div class="timetable-row-content">{content}</div> : <a class="timetable-row-content" href={`/sessions/${session.id}`} data-session-id={session.id}>{content}</a>}
  </article>
}

export const SpeakerList = ({ ids }: { ids: string[] }) => (
  <div class="speaker-grid">{ids.map((id) => <SpeakerCard key={id} speakerId={id} />)}</div>
)
