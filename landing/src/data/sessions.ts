export type Session = {
  id: string
  date: '2026-11-02' | '2026-11-03'
  start: string
  end: string
  title: string
  speakerIds: string[]
  category: 'talk' | 'special' | 'break'
  color: 'white' | 'yellow' | 'blue' | 'green' | 'red'
  summary: string
  detail: string
}

export const sessions: Session[] = [
  {
    id: 'opening-1102', date: '2026-11-02', start: '10:00', end: '10:10', title: 'オープニング', speakerIds: ['tanahiro2010'], category: 'talk', color: 'white',
    summary: '知らない世界の話をしよう。イベントの楽しみ方を紹介します。', detail: 'イベントの趣旨と、2日間の過ごし方を短く紹介します。',
  },
  {
    id: 'distributed-sns', date: '2026-11-02', start: '10:30', end: '10:40', title: '分散型SNSのすゝめ', speakerIds: ['macchatee'], category: 'talk', color: 'yellow',
    summary: '内容は決まり次第更新します。', detail: '内容は決まり次第更新します。',
  },
  {
    id: 'medical-world', date: '2026-11-02', start: '11:30', end: '11:40', title: '「誰かの役に立つ」を掛け合わせる仕事', speakerIds: ['osumi-tomoya'], category: 'talk', color: 'blue',
    summary: '内容は決まり次第更新します。', detail: '内容は決まり次第更新します。',
  },
  {
    id: 'novel-world', date: '2026-11-02', start: '12:00', end: '12:10', title: 'TBD', speakerIds: ['musashinofenaga'], category: 'talk', color: 'green',
    summary: '内容は決まり次第更新します。', detail: '内容は決まり次第更新します。',
  },
  {
    id: 'ai-werewolf-play', date: '2026-11-02', start: '13:00', end: '14:00', title: 'AI人狼を遊ぶ', speakerIds: ['tanahiro2010'], category: 'special', color: 'red',
    summary: '参加者が実際にAI人狼をプレイします。', detail: '生成AIを使って作ったAI人狼を、参加者のみなさんに遊んでもらいます。',
  },
  {
    id: 'ai-werewolf-making', date: '2026-11-02', start: '14:00', end: '15:00', title: 'AI人狼のつくり方', speakerIds: ['tanahiro2010'], category: 'special', color: 'red',
    summary: 'PLAYの後に、HOW IT WAS MADEを見せます。', detail: 'ほとんどコードを書かず、生成AIにどこまでアプリを作らせられるか。その過程と内部の仕組みを紹介します。',
  },
  {
    id: 'unknown-world', date: '2026-11-03', start: '11:00', end: '11:10', title: 'ITエンジニアとして生きていくために自分がやってきたノウハウをお伝えします', speakerIds: ['kojima-yusuke'], category: 'talk', color: 'yellow',
    summary: '内容は決まり次第更新します。', detail: '内容は決まり次第更新します。',
  },
  {
    id: 'web-world', date: '2026-11-03', start: '13:00', end: '13:10', title: 'インフラ（サーバー・ネットワーク）の何かを話します。', speakerIds: ['taktin'], category: 'talk', color: 'blue',
    summary: '内容は決まり次第更新します。', detail: '内容は決まり次第更新します。',
  },
]

export const sessionDates = [
  { id: '2026-11-02' as const, label: '11.02 MON' },
  { id: '2026-11-03' as const, label: '11.03 TUE' },
]
