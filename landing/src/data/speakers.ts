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

export const speakers: Speaker[] = [
  {
    id: 'tanahiro2010',
    name: '田中博悠',
    handle: 'tanahiro2010',
    role: 'Organizer / Web developer',
    category: 'web',
    bio: 'GDGなどでコミュニティ活動もしながら個人開発もしている高校生Webエンジニア。',
    icon: 'https://event.ospn.jp/event_images/sessions/kotob_tanaka.png',
    online: false,
  },
  {
    id: 'musashinofenaga',
    name: 'ムサシノ・F・エナガ',
    role: 'Novelist',
    category: 'culture',
    icon: 'https://pbs.twimg.com/profile_images/1650172221611192321/47KhKjwQ_400x400.jpg',
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
    icon: 'https://pbs.twimg.com/profile_images/1356194926908776452/EqYLvsKJ_400x400.jpg',
    online: true,
  },
  {
    id: 'macchatee',
    name: 'まっちゃてぃー',
    role: 'Misskey developer',
    category: 'sns',
    bio: 'Misskey開発者 / S高等学校3年生',
    icon: 'https://media.discordapp.net/attachments/1547033201774567538/1553380916775231609/8sm1qr9.jpg?ex=6ab9b2f6&is=6ab86176&hm=0de17b53c1d9fcb5979420ce5f7cea9e06b99b593d1d733ec526aae975f6d12e&=&format=webp',
    online: false,
  },
  {
    id: 'osumi-tomoya',
    name: '大角知也',
    role: 'Medical',
    category: 'medical',
    icon: 'https://assets.st-note.com/production/uploads/images/142596036/profile_7244d2df5df27cb710d170ebbfb684f9.png?fit=bounds&format=jpeg&quality=85&width=330',
    bio: `医療・ヘルスケア領域を中心に、医療データ・リアルワールドデータ（RWD）、生成AI・医療DX、Patient Support Program（PSP）、
    新規事業開発、人材育成、コミュニティ運営に取り組んでいます。`,
    online: false,
  },
  {
    id: 'taktin',
    name: 'たくてぃん',
    role: 'GDG organizer / Full-stack engineer',
    category: 'web',
    icon: 'https://pbs.twimg.com/profile_images/2090471659371388929/W20XdOHj_400x400.jpg',
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
    icon: 'https://pbs.twimg.com/profile_images/775498643184898049/9gYodSez_400x400.jpg',
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
    icon: 'https://pbs.twimg.com/profile_images/2073344638078091264/OISMkcfw_400x400.jpg',
    online: false,
  },
  {
    id: 'ikkia-atsu',
    name: '一気圧',
    role: 'Speaker',
    category: 'other',
    bio: `やりたいことができる状況でやりたくないことを優先しなきゃ行けないことってありますよね。いつもその中で生きています`,
    icon: '/images/speakers/ikkia-atsu.jpg',
    online: false,
  },
  {
    id: 'taramanji',
    name: 'taramanji',
    handle: 'JavaLangRuntime',
    role: 'Engineer',
    category: 'web',
    icon: 'https://pbs.twimg.com/profile_images/2099858796474691584/IYPxuDMo_400x400.jpg',
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
