import type { Link, LinkStats } from './types'

const BASE = '/api'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `HTTP ${res.status}`)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  getLinks: () => request<Link[]>('/links'),
  createLink: (data: { url: string; name?: string; customCode?: string }) =>
    request<Link>('/links', { method: 'POST', body: JSON.stringify(data) }),
  deleteLink: (id: string) => request<void>(`/links/${id}`, { method: 'DELETE' }),
  getLinkStats: (id: string, days = 30) =>
    request<LinkStats>(`/links/${id}/stats?days=${days}`),
}
