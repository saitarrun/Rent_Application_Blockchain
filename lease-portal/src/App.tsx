import React, { useEffect, useMemo, useState } from 'react'
import dayjs from 'dayjs'
import contractsMap from '../contracts.json'
import RENT_ABI from './abi/RENT.json'
import NFT_ABI from './abi/RentalAgreementNFT.json'
import { ethers } from 'ethers'

type ChainKey = '1337' | '11155111'

function hexChain(id: number) {
  return '0x' + id.toString(16)
}

async function switchToLocal() {
  const ethereum = (window as any).ethereum
  if (!ethereum) throw new Error('Wallet not found')
  try {
    await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: hexChain(1337) }] })
  } catch (err: any) {
    if (err?.code === 4902) {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: hexChain(1337),
          chainName: 'Local (Ganache)',
          rpcUrls: [import.meta.env.VITE_LOCAL_RPC || 'http://127.0.0.1:8545'],
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
        }]
      })
    } else throw err
  }
}

async function switchToSepolia() {
  const ethereum = (window as any).ethereum
  if (!ethereum) throw new Error('Wallet not found')
  try {
    await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: hexChain(11155111) }] })
  } catch (err: any) {
    if (err?.code === 4902) {
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: hexChain(11155111),
          chainName: 'Sepolia',
          rpcUrls: [import.meta.env.VITE_SEPOLIA_RPC || 'https://rpc.sepolia.org'],
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }
        }]
      })
    } else throw err
  }
}

function useWallet() {
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)

  useEffect(() => {
    const ethereum = (window as any).ethereum
    if (!ethereum) return
    ethereum.request({ method: 'eth_accounts' }).then((accs: string[]) => setAccount(accs[0] || null)).catch(() => {})
    ethereum.request({ method: 'eth_chainId' }).then((cid: string) => setChainId(parseInt(cid, 16))).catch(() => {})
    const onAccountsChanged = (accs: string[]) => setAccount(accs[0] || null)
    const onChainChanged = (cid: string) => setChainId(parseInt(cid, 16))
    ethereum.on?.('accountsChanged', onAccountsChanged)
    ethereum.on?.('chainChanged', onChainChanged)
    return () => {
      ethereum.removeListener?.('accountsChanged', onAccountsChanged)
      ethereum.removeListener?.('chainChanged', onChainChanged)
    }
  }, [])

  const connect = async () => {
    const ethereum = (window as any).ethereum
    if (!ethereum) throw new Error('Wallet not found')
    const accs = await ethereum.request({ method: 'eth_requestAccounts' })
    setAccount(accs[0] || null)
  }

  return { account, chainId, connect }
}

type Wizard = {
  propertyAddress: string
  unit: string
  photos?: FileList | null
  start: string
  end: string
  monthlyRentFiat: string
  depositFiat: string
  dueDay: string
  landlordName: string
  landlordContact: string
  tenantName: string
  tenantContact: string
}

const initial: Wizard = {
  propertyAddress: '',
  unit: '',
  photos: null,
  start: '',
  end: '',
  monthlyRentFiat: '',
  depositFiat: '',
  dueDay: '1',
  landlordName: '',
  landlordContact: '',
  tenantName: '',
  tenantContact: ''
}

export default function App() {
  const { account, chainId, connect } = useWallet()
  const [step, setStep] = useState(1)
  const [w, setW] = useState<Wizard>(initial)
  // Conversion for demo: treat fiat as converted to test ETH using a user-set ETH price
  const [fiatPerEth, setFiatPerEth] = useState<string>('2000')
  const currentEnv = chainId === 11155111 ? 'Sepolia' : chainId === 1337 ? 'Local' : 'Unknown'

  const summary = useMemo(() => {
    if (!w.propertyAddress) return ''
    return `Lease for ${w.tenantName} at ${w.propertyAddress}${w.unit ? ', Unit ' + w.unit : ''} from ${w.start} to ${w.end}. Monthly rent ${w.monthlyRentFiat}, deposit ${w.depositFiat}, due day ${w.dueDay}. Landlord ${w.landlordName}. Contact ${w.landlordContact} / ${w.tenantContact}.`
  }, [w])

  const next = () => setStep((s) => Math.min(4, s + 1))
  const back = () => setStep((s) => Math.max(1, s - 1))

  const validateStep = (n: number): string | null => {
    if (n === 1) {
      if (!w.propertyAddress) return 'Property address is required'
      return null
    }
    if (n === 2) {
      if (!w.start || !w.end) return 'Start and end dates are required'
      if (!w.monthlyRentFiat) return 'Monthly rent is required'
      if (!w.depositFiat) return 'Deposit is required'
      return null
    }
    if (n === 3) {
      if (!w.landlordName || !w.landlordContact) return 'Landlord details are required'
      if (!w.tenantName || !w.tenantContact) return 'Tenant details are required'
      return null
    }
    return null
  }

  const [notice, setNotice] = useState<string | null>(null)
  const toast = (msg: string) => { setNotice(msg); setTimeout(() => setNotice(null), 3500) }

  const toWeiFromFiat = (amountFiat: string): bigint => {
    const price = parseFloat(fiatPerEth || '0')
    const amt = parseFloat(amountFiat || '0')
    const eth = !isFinite(price) || price <= 0 ? 0 : amt / price
    return ethers.parseUnits(Number.isFinite(eth) ? eth.toFixed(18) : '0', 18)
  }

  const createLease = async () => {
    try {
      const ethereum = (window as any).ethereum
      if (!ethereum) { toast('Please install MetaMask to continue.'); return }
      const cidHex: string = await ethereum.request({ method: 'eth_chainId' })
      const cid = parseInt(cidHex, 16) as ChainKey | number
      if (cid !== 1337 && cid !== 11155111) {
        toast('Please switch to Local or Sepolia in the header.')
        return
      }
      const startTs = dayjs(w.start).unix()
      const endTs = dayjs(w.end).unix()
      // Convert fiat to test ETH using the configured ETH price (fiat per ETH)
      const rentWei = toWeiFromFiat(w.monthlyRentFiat)
      const depositWei = toWeiFromFiat(w.depositFiat)
      const text = summary || JSON.stringify(w)
      const termsHash = ethers.id(text)

      const provider = new ethers.BrowserProvider(ethereum)
      const signer = await provider.getSigner()

      const addresses = (contractsMap as any)[String(cid)] || {}
      const rentAddr = addresses.RENT
      const nftAddr = addresses.RentalAgreementNFT

      if (!rentAddr || !nftAddr) {
        toast('Missing contract addresses for this network. Update contracts.json.')
        return
      }

      // Placeholders; replace ABIs with real ones later
      const rent = new ethers.Contract(rentAddr, RENT_ABI as any, signer)
      const nft = new ethers.Contract(nftAddr, NFT_ABI as any, signer)

      // Stub call: in a real app, call your contract method here
      // Example (placeholder):
      // await rent.createAgreement(tenant, rentWei, startTs, endTs, termsHash)
      console.log('Would call contract with:', { startTs, endTs, rentWei: rentWei.toString(), depositWei: depositWei.toString(), termsHash, rentAddr, nftAddr })
      toast('Lease prepared using Ganache test ETH conversion. Update ABIs/addresses to enable on-chain execution.')
    } catch (err: any) {
      console.error(err)
      toast('Could not create lease. Please check addresses/ABIs and try again.')
    }
  }

  const payRent = () => toast('Pay Rent is a stub in this demo.')
  const returnDeposit = () => toast('Return Deposit is a stub in this demo.')

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">Property</h2>
            <label className="label">Property address</label>
            <input className="input" value={w.propertyAddress} onChange={(e) => setW({ ...w, propertyAddress: e.target.value })} placeholder="Street, City, State" />
            <div className="row mt-3">
              <div>
                <label className="label">Unit (optional)</label>
                <input className="input" value={w.unit} onChange={(e) => setW({ ...w, unit: e.target.value })} placeholder="Apt / Unit" />
              </div>
              <div>
                <label className="label">Photos (optional)</label>
                <input className="input" type="file" multiple onChange={(e) => setW({ ...w, photos: e.target.files })} />
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">Lease terms</h2>
            <div className="row">
              <div>
                <label className="label">Start date</label>
                <input className="input" type="date" value={w.start} onChange={(e) => setW({ ...w, start: e.target.value })} />
              </div>
              <div>
                <label className="label">End date</label>
                <input className="input" type="date" value={w.end} onChange={(e) => setW({ ...w, end: e.target.value })} />
              </div>
            </div>
            <div className="row mt-3">
              <div>
                <label className="label">Monthly rent (₹/$)</label>
                <input className="input" type="number" placeholder="1200" value={w.monthlyRentFiat} onChange={(e) => setW({ ...w, monthlyRentFiat: e.target.value })} />
              </div>
              <div>
                <label className="label">Deposit (₹/$)</label>
                <input className="input" type="number" placeholder="1200" value={w.depositFiat} onChange={(e) => setW({ ...w, depositFiat: e.target.value })} />
              </div>
            </div>
            <div className="row mt-3">
              <div>
                <label className="label">ETH price for conversion (₹/$ per 1 ETH)</label>
                <input className="input" type="number" placeholder="2000" value={fiatPerEth} onChange={(e) => setFiatPerEth(e.target.value)} />
                <p className="text-xs text-slate-500 mt-1">We convert amounts to Ganache test ETH using this rate. No real money moves.</p>
              </div>
            </div>
            <div className="mt-3">
              <label className="label">Rent due day</label>
              <select className="input" value={w.dueDay} onChange={(e) => setW({ ...w, dueDay: e.target.value })}>
                {Array.from({ length: 28 }).map((_, i) => (
                  <option key={i + 1} value={String(i + 1)}>{i + 1}</option>
                ))}
              </select>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">Parties</h2>
            <div className="row">
              <div>
                <label className="label">Landlord name</label>
                <input className="input" value={w.landlordName} onChange={(e) => setW({ ...w, landlordName: e.target.value })} />
                <label className="label mt-2">Landlord contact (email/phone)</label>
                <input className="input" value={w.landlordContact} onChange={(e) => setW({ ...w, landlordContact: e.target.value })} />
              </div>
              <div>
                <label className="label">Tenant name</label>
                <input className="input" value={w.tenantName} onChange={(e) => setW({ ...w, tenantName: e.target.value })} />
                <label className="label mt-2">Tenant contact (email/phone)</label>
                <input className="input" value={w.tenantContact} onChange={(e) => setW({ ...w, tenantContact: e.target.value })} />
              </div>
            </div>
          </div>
        )
      case 4:
      default:
        return (
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">Review</h2>
            <p className="text-slate-700 text-sm whitespace-pre-wrap">{summary || 'Fill previous steps to preview.'}</p>
            <div className="mt-4 flex gap-3">
              <button className="btn-primary" onClick={createLease}>Create Lease</button>
              <button className="btn-secondary" onClick={payRent}>Pay Rent</button>
              <button className="btn-ghost" onClick={returnDeposit}>Return Deposit</button>
            </div>
          </div>
        )
    }
  }

  const error = validateStep(step)

  return (
    <div className="container py-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl font-semibold text-slate-800">Rental Portal</span>
          <span className="pill">Environment: {currentEnv}</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary" onClick={() => switchToLocal().catch(e => alert(e.message))}>Switch to Local</button>
          <button className="btn-secondary" onClick={() => switchToSepolia().catch(e => alert(e.message))}>Switch to Sepolia</button>
          {account ? (
            <span className="pill">Connected</span>
          ) : (
            <button className="btn-primary" onClick={() => connect().catch(e => alert(e.message))}>Connect</button>
          )}
        </div>
      </header>

      <div className="mb-4 flex items-center gap-3">
        <span className={`pill ${step === 1 ? 'bg-blue-100' : ''}`}>1. Property</span>
        <span className={`pill ${step === 2 ? 'bg-blue-100' : ''}`}>2. Lease terms</span>
        <span className={`pill ${step === 3 ? 'bg-blue-100' : ''}`}>3. Parties</span>
        <span className={`pill ${step === 4 ? 'bg-blue-100' : ''}`}>4. Review</span>
      </div>

      {notice && <div className="mb-4 rounded-lg bg-amber-100 text-amber-900 px-4 py-3 text-sm">{notice}</div>}
      {renderStep()}

      <div className="mt-4 flex items-center justify-between">
        <button className="btn-ghost" onClick={back} disabled={step === 1}>Back</button>
        <div className="flex items-center gap-3">
          {error && <span className="error">{error}</span>}
          {step < 4 && (
            <button className="btn-primary" onClick={() => { if (!validateStep(step)) next(); }}>{step === 3 ? 'Review' : 'Next'}</button>
          )}
        </div>
      </div>
    </div>
  )
}
