export interface Link {
  id: string
  name: string | null
  url: string
  shortCode: string
  shortUrl: string
  accessCount: number
  createdAt: string
}

export interface AccessByDay {
  date: string
  count: number
}

export interface LinkStats {
  link: {
    id: string
    name: string | null
    url: string
    shortCode: string
    shortUrl: string
    createdAt: string
  }
  totalAccesses: number
  accessesInPeriod: number
  periodDays: number
  accessesByDay: AccessByDay[]
  recentAccesses: {
    accessedAt: string
    ip: string | null
    userAgent: string | null
  }[]
}
