import { useEffect, useState } from 'react'
import { Navbar } from './components/Navbar'
import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getProfile, listLeases } from './lib/api'
import dayjs from 'dayjs'
import { Wizard } from './components/Wizard'
import { useAppStore } from './lib/store'

function Dashboard() {
  const { data: leases } = useQuery({ queryKey: ['leases'], queryFn: listLeases })
  const active = (leases || []).filter(l => dayjs().isAfter(dayjs(l.startISO)) && dayjs().isBefore(dayjs(l.endISO)))
  const next = active[0]
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
      <div className="card">
        <div className="text-xs uppercase text-slate-500">Leases</div>
        <div className="mt-2 text-2xl font-semibold">{active.length} active</div>
        <a className="btn-ghost mt-3" href="#/agreements">View all →</a>
      </div>
      <div className="card">
        <div className="text-xs uppercase text-slate-500">Next payment due</div>
        <div className="mt-2 text-2xl font-semibold">{next ? dayjs(next.startISO).add(1,'month').format('MMM D') : '-'}</div>
        <a className="btn-ghost mt-3" href="#/agreements">Pay now →</a>
      </div>
      <div className="card">
        <div className="text-xs uppercase text-slate-500">Recent activity</div>
        <div className="mt-2 text-sm text-slate-600">New leases and payments will appear here.</div>
      </div>
    </div>
  )
}

function AgreementsList() {
  const { data: leases } = useQuery({ queryKey: ['leases'], queryFn: listLeases })
  const nav = useNavigate()
  const qc = useQueryClient()
  return (
    <div className="mt-6 grid gap-4">
      <div className="card flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">Agreements</div>
          <div className="text-sm text-slate-600">Create leases with plain dates and amounts. We’ll handle the technical details.</div>
        </div>
        <a className="btn-primary" href="#/create">Create Lease</a>
      </div>
      {!leases?.length && <div className="card">No agreements yet.</div>}
      {leases?.map((l) => (
        <div className="card cursor-pointer" key={l.id} onClick={() => nav(`/agreements/${l.id}`)}>
          <div className="flex items-center justify-between">
            <div className="text-sm text-slate-700">{l.propertyAddress}{l.unit ? `, Unit ${l.unit}` : ''}</div>
            <div className="pill">{dayjs().isBefore(dayjs(l.endISO)) ? 'Active' : 'Completed'}</div>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            <div>Landlord: {l.landlordName} ({l.landlordContact})</div>
            <div>Tenant: {l.tenantName} ({l.tenantContact})</div>
            <div>Start: {dayjs(l.startISO).format('YYYY-MM-DD')} · End: {dayjs(l.endISO).format('YYYY-MM-DD')}</div>
            <div>Monthly rent: {l.monthlyRentEth} ETH · Deposit: {l.securityDepositEth} ETH · Due day: {l.dueDay}</div>
          </div>
          {l.txHash && <div className="mt-2 text-xs text-slate-500">Reference: {l.txHash}</div>}
        </div>
      ))}
    </div>
  )
}

function AgreementDetail() {
  const { id } = useParams()
  const { data: leases } = useQuery({ queryKey: ['leases'], queryFn: listLeases })
  const lease = leases?.find((l) => l.id === id)
  if (!lease) return <div className="mt-6 card">Lease not found.</div>
  return (
    <div className="mt-6 card">
      <div className="text-lg font-semibold">Agreement Detail</div>
      <div className="mt-2 text-sm text-slate-700">{lease.propertyAddress}{lease.unit ? `, Unit ${lease.unit}` : ''}</div>
      <div className="mt-2 text-xs text-slate-500">
        <div>Landlord: {lease.landlordName} ({lease.landlordContact})</div>
        <div>Tenant: {lease.tenantName} ({lease.tenantContact})</div>
        <div>Start: {dayjs(lease.startISO).format('YYYY-MM-DD')} · End: {dayjs(lease.endISO).format('YYYY-MM-DD')}</div>
        <div>Monthly rent: {lease.monthlyRentEth} ETH · Deposit: {lease.securityDepositEth} ETH · Due day: {lease.dueDay}</div>
      </div>
      {lease.txHash && <div className="mt-2 text-xs text-slate-500">Reference: {lease.txHash}</div>}
    </div>
  )
}

function Settings() {
  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: getProfile })
  return (
    <div className="mt-6 card grid gap-2 sm:max-w-md">
      <div className="text-lg font-semibold">Settings</div>
      <label className="label">Name</label>
      <input className="input" defaultValue={profile?.name} placeholder="Your name" />
      <label className="label">Contact (email/phone)</label>
      <input className="input" defaultValue={profile?.contact} placeholder="you@example.com" />
    </div>
  )
}

export default function App() {
  return (
    <div className="container py-6">
      <Navbar route={''} onNav={() => {}} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<div className="mt-6"><Wizard onCreated={() => location.hash = '#/agreements'} /></div>} />
          <Route path="/agreements" element={<AgreementsList />} />
          <Route path="/agreements/:id" element={<AgreementDetail />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}
