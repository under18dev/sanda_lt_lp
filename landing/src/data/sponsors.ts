export type Sponsor = {
  id: string
  name: string
  tier: 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE' | 'SUPPORT'
  description: string
  detail: string
  url?: string
  logo?: string
  sortOrder: number
}

// 掲載が決まったらこの配列へ追加します。未確定の状態でも募集枠を表示します。
export const sponsors: Sponsor[] = []

export const sponsorTiers = [
  { name: 'PLATINUM', color: 'blue', price: '10万円', description: 'Goldの内容に加え、Web・会場で上位表示。現地参加枠2-3名程度、紹介ページ、実績レポートを提供します。' },
  { name: 'GOLD', color: 'yellow', price: '5万円', description: 'Silverの内容に加え、現地参加枠1-2名程度、資料設置、Opening / Closingでの紹介、交流会参加を想定しています。' },
  { name: 'SILVER', color: 'silver', price: '3万円', description: '公式サイトロゴ掲載、会場スポンサー一覧掲載、SNSスポンサー紹介、オンライン視聴案内を行います。' },
  { name: 'BRONZE', color: 'green', price: '応相談', description: '個人・団体など、小さくこの場づくりに参加したい方向けの協力枠です。掲載内容は個別に相談します。' },
] as const
