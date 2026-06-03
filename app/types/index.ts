export interface Player {
  id: string
  name: string
  number: number
  position: 'GK' | 'DF' | 'MF' | 'FW'
  club: string
}

export interface RecentRecord {
  matches: number
  win: number
  draw: number
  lose: number
  goalsFor: number
  goalsAgainst: number
  avgGoals: number
  avgConceded: number
  avgPoints: number
}

export interface Team {
  id: string
  name: string
  nameEn: string
  logo: string
  flag: string
  group: string
  fifaRank: number
  fifaPoint: number
  style: string
  strength: string[]
  weakness: string[]
  recentRecord: RecentRecord
}

export type MatchStage = 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'final' | 'third'
export type MatchStatus = 'pending' | 'live' | 'ended'

export interface MatchResult {
  homeScore: number
  awayScore: number
  endedAt: string
}

export interface Match {
  id: string
  homeTeamId: string
  awayTeamId: string
  group?: string
  stage: MatchStage
  matchTime: string
  venue: string
  status: MatchStatus
  result?: MatchResult
}

export interface Prediction {
  homeWin: number
  draw: number
  awayWin: number
  bestScore: string
  confidence: number
}

export interface GroupStanding {
  teamId: string
  played: number
  win: number
  draw: number
  lose: number
  goalsFor: number
  goalsAgainst: number
  goalDiff: number
  points: number
}

export interface ChampionRate {
  teamId: string
  rate: number
  trend: 'up' | 'down' | 'flat'
}
