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
  { id: 'break-1100', date: '2026-11-02', start: '11:00', end: '11:05', title: '休憩・転換', speakerIds: [], category: 'break', color: 'white', summary: '次の発表に向けた5分間の休憩です。', detail: '水分補給や座席の移動、登壇準備にお使いください。' },
  tbd('tbd-1105', '11:05', '11:15', 'yellow'),
  tbd('tbd-1115', '11:15', '11:25', 'blue'),
  tbd('tbd-1125', '11:25', '11:35', 'green'),
  tbd('tbd-1135', '11:35', '11:45', 'red'),
  { id: 'google-cloud-behind-scenes', date: '2026-11-02', start: '11:45', end: '12:05', title: 'Google Cloudの裏側（仮）', speakerIds: ['satoluxx'], category: 'talk', color: 'yellow', summary: 'なかむらさとるさんによるLTです。', detail: 'Google Cloudの裏側について紹介します。' },
  tbd('tbd-1205', '12:05', '12:15', 'blue'),
  tbd('tbd-1215', '12:15', '12:25', 'green'),
  tbd('tbd-1225', '12:25', '12:35', 'red'),
  tbd('tbd-1235', '12:35', '12:45', 'yellow'),
  tbd('tbd-1245', '12:45', '12:55', 'blue'),
  { id: 'break-1255', date: '2026-11-02', start: '12:55', end: '13:00', title: '休憩・AI人狼準備', speakerIds: [], category: 'break', color: 'white', summary: 'AI人狼の準備を含む5分間の休憩です。', detail: '13:00からのAI人狼に向けて、休憩と準備を行います。' },
  { id: 'ai-werewolf-play', date: '2026-11-02', start: '13:00', end: '14:00', title: 'AI人狼を実際に遊んでみよう！', speakerIds: ['tanahiro2010'], category: 'special', color: 'red', summary: '参加者が実際にAI人狼をプレイします。', detail: '生成AIを使って作ったAI人狼を、参加者のみなさんに遊んでもらいます。' },
  { id: 'ai-werewolf-making', date: '2026-11-02', start: '14:00', end: '15:00', title: 'AI人狼はどうやって作った？ ― 制作過程・仕組み解説', speakerIds: ['tanahiro2010'], category: 'special', color: 'red', summary: 'PLAYの後に、制作過程と仕組みを解説します。', detail: 'ほとんどコードを書かず、生成AIにどこまでアプリを作らせられるか。その過程と内部の仕組みを紹介します。' },
  { id: 'break-1500', date: '2026-11-02', start: '15:00', end: '15:05', title: '休憩・転換', speakerIds: [], category: 'break', color: 'white', summary: '次の発表に向けた5分間の休憩です。', detail: '水分補給や座席の移動、登壇準備にお使いください。' },
  tbd('tbd-1505', '15:05', '15:15', 'yellow'),
  { id: 'ai-era-technology', date: '2026-11-02', start: '15:15', end: '15:25', title: 'AI時代だからこそ技術にこだわってみないか？', speakerIds: ['taramanji'], category: 'talk', color: 'blue', summary: 'taramanjiさんによる10分LTです。', detail: '発表内容は決まり次第更新します。' },
  { id: 'closing-1102', date: '2026-11-02', start: '15:25', end: '15:35', title: 'クロージング', speakerIds: ['tanahiro2010'], category: 'talk', color: 'green', summary: 'イベントの締めくくりです。', detail: 'イベントを振り返り、次の交流につなげます。' },
  { id: 'social-1102', date: '2026-11-02', start: '15:35', end: '16:00', title: '雑談・交流タイム', speakerIds: [], category: 'break', color: 'white', summary: '発表の感想や興味のある分野を自由に話せます。', detail: '参加者同士でイベントの感想や興味のある分野を話す時間です。' },
]

export const sessionDates = [
  { id: '2026-11-02' as const, label: '11.02 MON' },
  { id: '2026-11-03' as const, label: '11.03 TUE' },
]
