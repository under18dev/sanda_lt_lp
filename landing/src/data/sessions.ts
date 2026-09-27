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

const tbd = (id: string, start: string, end: string, color: Session['color']): Session => ({
  id, date: '2026-11-02', start, end, title: 'LT枠 TBD', speakerIds: [], category: 'talk', color,
  summary: '登壇内容は決まり次第更新します。', detail: '登壇者と発表内容は決まり次第更新します。',
})

export const sessions: Session[] = [
  { id: 'opening-1102', date: '2026-11-02', start: '09:30', end: '10:20', title: '準備兼オープニング', speakerIds: ['tanahiro2010'], category: 'talk', color: 'white', summary: '会場準備とイベントのオープニングです。', detail: '会場の準備をしながら、イベントの流れを紹介します。' },
  { id: 'bokuchi', date: '2026-11-02', start: '10:20', end: '10:30', title: 'Bokuchiのすゝめ', speakerIds: ['tanahiro2010'], category: 'talk', color: 'yellow', summary: '田中博悠さんによる10分LTです。', detail: 'Bokuchiについて紹介します。' },
  { id: 'okaz02-tbd', date: '2026-11-02', start: '10:30', end: '10:40', title: 'LT枠 TBD', speakerIds: ['okaz02'], category: 'talk', color: 'blue', summary: 'Okaz02さんによるLTです。', detail: '発表内容は決まり次第更新します。' },
  { id: 'matlab-sports-engineering', date: '2026-11-02', start: '10:40', end: '10:50', title: 'MATLABを使ってスポーツエンジニアリング', speakerIds: ['ikkia-atsu'], category: 'talk', color: 'green', summary: 'MATLABとスポーツエンジニアリングのLTです。', detail: 'MATLABを使ったスポーツエンジニアリングについて紹介します。' },
  { id: 'video-retention', date: '2026-11-02', start: '10:50', end: '11:00', title: 'なぜこの動画、最後まで見ちゃうんだろう？――動画編集者がやっている“見る人を離脱させない工夫”', speakerIds: ['tm'], category: 'talk', color: 'red', summary: '動画編集者が実践する、見る人を離脱させない工夫についてのLTです。', detail: '動画編集者がやっている、見る人を離脱させない工夫について紹介します。' },
  tbd('tbd-1100', '11:00', '11:10', 'yellow'),
  tbd('tbd-1110', '11:10', '11:20', 'blue'),
  tbd('tbd-1120', '11:20', '11:30', 'green'),
  tbd('tbd-1130', '11:30', '11:40', 'red'),
  { id: 'google-cloud-behind-scenes', date: '2026-11-02', start: '11:40', end: '12:00', title: 'Google Cloudの裏側（仮）', speakerIds: ['satoluxx'], category: 'talk', color: 'yellow', summary: 'なかむらさとるさんによるLTです。', detail: 'Google Cloudの裏側について紹介します。' },
  tbd('tbd-1200', '12:00', '12:10', 'blue'),
  tbd('tbd-1210', '12:10', '12:20', 'green'),
  tbd('tbd-1220', '12:20', '12:30', 'red'),
  tbd('tbd-1230', '12:30', '12:40', 'yellow'),
  tbd('tbd-1240', '12:40', '12:50', 'blue'),
  tbd('tbd-1250', '12:50', '13:00', 'green'),
  { id: 'ai-werewolf-play', date: '2026-11-02', start: '13:00', end: '14:00', title: 'AI人狼を実際に遊んでみよう！', speakerIds: ['tanahiro2010'], category: 'special', color: 'red', summary: '参加者が実際にAI人狼をプレイします。', detail: '生成AIを使って作ったAI人狼を、参加者のみなさんに遊んでもらいます。' },
  { id: 'ai-werewolf-making', date: '2026-11-02', start: '14:00', end: '15:00', title: 'AI人狼はどうやって作った？ ― 制作過程・仕組み解説', speakerIds: ['tanahiro2010'], category: 'special', color: 'red', summary: 'PLAYの後に、制作過程と仕組みを解説します。', detail: 'ほとんどコードを書かず、生成AIにどこまでアプリを作らせられるか。その過程と内部の仕組みを紹介します。' },
  tbd('tbd-1500', '15:00', '15:10', 'yellow'),
  { id: 'ai-era-technology', date: '2026-11-02', start: '15:10', end: '15:20', title: 'AI時代だからこそ技術にこだわってみないか？', speakerIds: ['taramanji'], category: 'talk', color: 'blue', summary: 'taramanjiさんによるLTです。', detail: '発表内容は決まり次第更新します。' },
  { id: 'closing-1102', date: '2026-11-02', start: '15:20', end: '15:30', title: 'クロージング', speakerIds: ['tanahiro2010'], category: 'talk', color: 'green', summary: 'イベントの締めくくりです。', detail: 'イベントを振り返り、次の交流につなげます。' },
  { id: 'social-1102', date: '2026-11-02', start: '15:30', end: '16:00', title: '雑談・交流タイム', speakerIds: [], category: 'break', color: 'white', summary: '発表の感想や興味のある分野を自由に話せます。', detail: '参加者同士でイベントの感想や興味のある分野を話す時間です。' },
]

export const sessionDates = [
  { id: '2026-11-02' as const, label: '11.02 MON' },
  { id: '2026-11-03' as const, label: '11.03 TUE' },
]
