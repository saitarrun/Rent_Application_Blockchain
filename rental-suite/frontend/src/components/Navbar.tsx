import { switchToLocal, switchToSepolia, getChainIdHex } from '../lib/env'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { listLeases } from '../lib/api'

export function Navbar({ route }: { route: string; onNav?: (r: any) => void }) {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const is = (path: string) => (location.pathname === '/' && path==='dashboard') || location.pathname.startsWith(`/${path}`) ? 'text-blue-600' : 'text-slate-700'
  const [net, setNet] = useState<string>('Unknown')
  const { data: leases } = useQuery({ queryKey: ['leases'], queryFn: listLeases })

  useEffect(() => {
    (async () => {
      try {
        const cid = await getChainIdHex()
        setNet(cid === '0x539' ? 'Local' : cid === '0xaa36a7' ? 'Sepolia' : 'Unknown')
      } catch {}
    })()
  }, [])

  return (
    <nav className="flex items-center gap-6 p-4 bg-white rounded-xl shadow-sm">
      <span className="font-semibold">Rental Suite</span>
      <Link className={is('dashboard')} to="/">Dashboard</Link>
      <Link className={is('create')} to="/create">Create</Link>
      <Link className={is('agreements')} to="/agreements">Agreements{leases?.length? ` (${leases.length})`: ''}</Link>
      <Link className={is('settings')} to="/settings">Settings</Link>
      <div className="ml-auto flex items-center gap-3">
        <button className="btn-ghost" onClick={() => setOpen(o => !o)} aria-label="Environment settings">⚙️</button>
      </div>
      {open && (
        <div className="absolute right-6 top-16 w-64 card">
          <div className="text-sm font-medium">Environment</div>
          <div className="mt-2 text-xs text-slate-600">Current: {net}</div>
          <div className="mt-3 flex gap-2">
            <button className="btn-secondary" onClick={() => switchToLocal().then(() => setNet('Local')).catch(()=>{})}>Local</button>
            <button className="btn-secondary" onClick={() => switchToSepolia().then(() => setNet('Sepolia')).catch(()=>{})}>Sepolia</button>
          </div>
          <div className="mt-2 text-xs text-slate-500">No chain IDs shown to users.</div>
        </div>
      )}
    </nav>
  )
}
