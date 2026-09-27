export type Sponsor = {
  id: string
  name: string
  tier: 'PLATINUM' | 'GOLD' | 'SUPPORT'
  description: string
  detail: string
  url?: string
  logo?: string
  sortOrder: number
}

// 掲載が決まったらこの配列へ追加します。未確定の状態でも募集枠を表示します。
export const sponsors: Sponsor[] = []

export const sponsorTiers = [
  { name: 'PLATINUM', color: 'blue', description: 'イベントを大きく支えてくださるパートナー' },
  { name: 'GOLD', color: 'yellow', description: '会場と発表の場を支えてくださるパートナー' },
  { name: 'SUPPORT', color: 'green', description: 'この場づくりに協力してくださるパートナー' },
] as const
