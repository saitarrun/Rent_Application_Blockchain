const BASE = 'http://localhost:3001'

function authHeader() {
  const t = localStorage.getItem('jwt')
  return t ? { Authorization: `Bearer ${t}` } : {}
}

export async function getToken(email = 'demo@local') {
  const res = await fetch(`${BASE}/api/auth/token`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
  const data = await res.json()
  localStorage.setItem('jwt', data.token)
  return data.token
}

export async function listLeases() {
  const res = await fetch(`${BASE}/api/leases`)
  if (!res.ok) return []
  return res.json()
}

export async function createLease(payload: any) {
  await ensureAuth()
  const res = await fetch(`${BASE}/api/leases`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(payload) })
  if (!res.ok) throw new Error('Failed to create lease')
  return res.json()
}

export async function updateLease(id: string, patch: any) {
  await ensureAuth()
  const res = await fetch(`${BASE}/api/leases/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(patch) })
  if (!res.ok) throw new Error('Failed to update lease')
  return res.json()
}

export async function uploadLeasePdf(id: string, file: File) {
  await ensureAuth()
  const fd = new FormData()
  fd.append('pdf', file)
  const res = await fetch(`${BASE}/api/leases/${id}/pdf`, { method: 'POST', headers: { ...authHeader() }, body: fd })
  if (!res.ok) throw new Error('Failed to upload PDF')
  return res.json()
}

async function ensureAuth() {
  if (!localStorage.getItem('jwt')) await getToken()
}

// Profile endpoints
export async function getProfile() {
  const res = await fetch(`${BASE}/api/profile`)
  if (!res.ok) return { name: '', contact: '' }
  return res.json()
}

export async function updateProfile(p: { name?: string; contact?: string }) {
  await ensureAuth()
  const res = await fetch(`${BASE}/api/profile`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...authHeader() }, body: JSON.stringify(p) })
  if (!res.ok) throw new Error('Failed to update profile')
  return res.json()
}
