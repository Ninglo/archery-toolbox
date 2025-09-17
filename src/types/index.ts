export type BowType = '复合' | '反曲'
export type Distance = '18m' | '30m' | '50m' | '70m' | '90m'
export type Sets = 3 | 4 | 5 | 6 | 12
export type ArrowsPerSet = 3 | 6 | 9 | 12

export interface SessionConfig {
  bowType: BowType
  distance: Distance
  sets: Sets
  arrowsPerSet: ArrowsPerSet
}

export interface ArrowScore {
  value: 'X' | '10' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2' | '1' | 'M'
  selected?: boolean
}

export interface SetScore {
  arrows: ArrowScore[]
  note: string
  total: number
}

export interface Session {
  id: string
  config: SessionConfig
  sets: SetScore[]
  totalScore: number
  averageScore: number
  createdAt: string
  completedAt?: string
}

export interface ScoreDistribution {
  [key: string]: number
}