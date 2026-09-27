export type Speaker = {
  id: string
  name: string
  handle?: string
  role: string
  category: string
  bio: string
  /** Relative URL under public/, for example /images/speakers/name.webp. */
  icon?: string
  /** Relative URL under public/, used for this speaker's detail-page OGP. */
  ogpImage?: string
  online: boolean
}

const absoluteUrl = (path: string) => new URL(path, 'https://sglt.under18.dev').toString()

export const speakers: Speaker[] = [
  {
    id: 'tanahiro2010',
    name: '田中博悠',
    handle: 'tanahiro2010',
    role: 'Organizer / Web developer',
    category: 'web',
    bio: 'GDGなどでコミュニティ活動もしながら個人開発もしている高校生Webエンジニア。',
    icon: absoluteUrl('/images/speakers/tanahiro2010.png'),
    online: false,
  },
  {
    id: 'musashinofenaga',
    name: 'ムサシノ・F・エナガ',
    role: 'Novelist',
    category: 'culture',
    icon: absoluteUrl('/images/speakers/musashinofenaga.jpg'),
    bio: `Web小説家。
    『俺だけデイリーミッションがあるダンジョン生活』『俺だけが魔法使い族の異世界』『島に取り残されて10年〜』『努力好きの天才錬金術師』などで書籍化している。`,
    online: true,
  },
  {
    id: 'kojima-yusuke',
    name: '小島優介',
    role: 'Speaker',
    category: 'other',
    bio: `30代後半から発信活動を始めて人生が楽しくなりました。
「ハピネスチームビルディング」のテーマで発信。
月刊誌「Software Design」で3年間連載。デブサミ2020関西ベストスピーカー賞1位。Microsoft Build 2022発表。デブサミ2026夏発表。
弥生株式会社所属。発言は個人の見解です。`,
    icon: absoluteUrl('/images/speakers/kojima-yusuke.jpg'),
    online: true,
  },
  {
    id: 'macchatee',
    name: 'まっちゃてぃー',
    role: 'Misskey developer',
    category: 'sns',
    bio: 'Misskey開発者 / S高等学校3年生',
    icon: absoluteUrl('/images/speakers/macchatee.webp'),
    online: false,
  },
  {
    id: 'osumi-tomoya',
    name: '大角知也',
    role: 'Medical',
    category: 'medical',
    icon: absoluteUrl('/images/speakers/osumi-tomoya.jpg'),
    bio: `医療・ヘルスケア領域を中心に、医療データ・リアルワールドデータ（RWD）、生成AI・医療DX、Patient Support Program（PSP）、
    新規事業開発、人材育成、コミュニティ運営に取り組んでいます。`,
    online: false,
  },
  {
    id: 'taktin',
    name: 'たくてぃん',
    role: 'GDG organizer / Full-stack engineer',
    category: 'web',
    icon: absoluteUrl('/images/speakers/taktin.jpg'),
    bio: `神戸出身のエンジニア。
    専門学校でIT技術を学び、授業内外問わず Webサイト・モバイルアプリなどのフロントエンド、WebAPI バックエンド、サーバーなどのITインフラ など幅広く製作・構築を行ってきました。
    また、ソフトウェア開発における設計やDevOpsの実践にも力を入れています。`,
    online: true,
  },
  {
    id: 'satoluxx',
    name: 'なかむら さとる',
    role: 'Google Developer Expert',
    category: 'web',
    icon: absoluteUrl('/images/speakers/satoluxx.jpg'),
    bio: `GCPとBigQueryとガンダムと旅行と姪っ子が大好きなおっさんエンジニアです。
今は出前館のデータエンジニアリンググループでわちゃわちゃ。
 Google Developers Expert(GCP)。
バイクはアフリカツインとトライアンフ スラクストンを乗っております。`,
    online: false,
  },
  {
    id: 'okaz02',
    name: 'Okaz02',
    handle: '0kaz02',
    role: 'Speaker',
    category: 'other',
    bio: 'こんにちは！普段暇で、やりたいことを思いついたらなんでもやってます！',
    icon: absoluteUrl('/images/speakers/okaz02.jpg'),
    online: false,
  },
  {
    id: 'ikkia-atsu',
    name: '一気圧',
    role: 'Speaker',
    category: 'other',
    bio: `やりたいことができる状況でやりたくないことを優先しなきゃ行けないことってありますよね。いつもその中で生きています`,
    icon: absoluteUrl('/images/speakers/ikkia-atsu.jpg'),
    online: false,
  },
  {
    id: 'taramanji',
    name: 'taramanji',
    handle: 'JavaLangRuntime',
    role: 'Engineer',
    category: 'web',
    icon: absoluteUrl('/images/speakers/taramanji.jpg'),
    bio: `締切駆動📷マン/SWE/XR研究者 
立命館大学大学院M1・RM2C・クラスターメタ研RA・RCC・ CyberAgent・JINEN・888・
CATechLounge・NxTEND戦略事業本部・TechSelect+メンター・運営STECH 
GoCon TSKaigi kyoto.go biwako.go・りえ高生`,
    online: false,
  }
]

export const speakerCategories = [
  { id: 'all', label: 'ALL' },
  { id: 'web', label: 'WEB' },
  { id: 'sns', label: 'SNS' },
  { id: 'culture', label: 'CULTURE' },
  { id: 'medical', label: 'MEDICAL' },
  { id: 'other', label: 'OTHER' },
]
