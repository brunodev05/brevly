import type { Link } from './types'

const BASE = `${import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3333'}/api`

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
  getLink: (shortCode: string) => request<Link>(`/links/${shortCode}`),
  createLink: (data: { url: string; shortCode?: string }) =>
    request<Link>('/links', { method: 'POST', body: JSON.stringify(data) }),
  deleteLink: (shortCode: string) =>
    request<void>(`/links/${shortCode}`, { method: 'DELETE' }),
  exportLinks: () => request<{ url: string }>('/links/export'),
}
