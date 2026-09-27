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
    summary: 'ネットワークの向こう側にある、もうひとつのSNS。', detail: '分散型SNSとは何か、Misskeyを作る側から見える世界を紹介します。',
  },
  {
    id: 'medical-world', date: '2026-11-02', start: '11:30', end: '11:40', title: '医療の現場から', speakerIds: ['osumi-tomoya'], category: 'talk', color: 'blue',
    summary: '普段は見えにくい医療の世界を覗いてみる。', detail: '医療に関するテーマを予定しています。詳細はTBDです。',
  },
  {
    id: 'novel-world', date: '2026-11-02', start: '12:00', end: '12:10', title: '小説を書くということ', speakerIds: ['fantastic-novelist'], category: 'talk', color: 'green',
    summary: '物語が生まれる場所を覗いてみる。', detail: '小説を書くこと、物語を作ることについて紹介します。',
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
    id: 'unknown-world', date: '2026-11-03', start: '11:00', end: '11:10', title: '知らない世界の話', speakerIds: ['kojima-yusuke'], category: 'talk', color: 'yellow',
    summary: 'テーマTBD。新しい世界との出会い。', detail: '内容は決まり次第更新します。',
  },
  {
    id: 'web-world', date: '2026-11-03', start: '13:00', end: '13:10', title: 'Webの向こう側', speakerIds: ['taktin'], category: 'talk', color: 'blue',
    summary: 'Webを作る人から見える、もうひとつの景色。', detail: 'Web開発とコミュニティに関するテーマを予定しています。',
  },
]

export const sessionDates = [
  { id: '2026-11-02' as const, label: '11.02 MON' },
  { id: '2026-11-03' as const, label: '11.03 TUE' },
]
