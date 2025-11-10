import { ethers } from 'ethers'
import RENT_ABI from '../abi/RENT.json'
import AGREEMENTS_ABI from '../abi/RentalAgreementNFT.json'
import STAKING_ABI from '../abi/DepositStaking.json'

// Provider / Signer
export function getProvider(): ethers.BrowserProvider {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ethereum = (window as any).ethereum
  if (!ethereum) throw new Error('Wallet not found')
  return new ethers.BrowserProvider(ethereum)
}

export async function getSigner() {
  const provider = getProvider()
  await provider.send('eth_requestAccounts', [])
  return provider.getSigner()
}

export function toWei(eth: string): bigint { return ethers.parseEther(eth || '0') }
export function fromWei(wei: bigint): string { return ethers.formatEther(wei) }

let contractsCache: any | null = null
async function getContractsMap(): Promise<any> {
  if (!contractsCache) {
    const res = await fetch('/contracts.json')
    if (!res.ok) throw new Error('contracts.json not found in public/')
    contractsCache = await res.json()
  }
  return contractsCache
}

export async function loadRentContract(chainId: string, signerOrProvider?: any) {
  const map = await getContractsMap()
  const addrs: any = map[chainId]
  if (!addrs || !addrs.RENT) return null
  const s = signerOrProvider || getProvider()
  // biome-ignore lint/suspicious/noExplicitAny: placeholder ABI allowed
  return new ethers.Contract(addrs.RENT, RENT_ABI as any, s)
}

export async function hashTerms(input: string | ArrayBuffer): Promise<string> {
  if (typeof input === 'string') return ethers.id(input)
  const text = new TextDecoder().decode(new Uint8Array(input))
  return ethers.id(text)
}

export async function loadAgreementsContract(chainId: string, signerOrProvider?: any) {
  const map = await getContractsMap()
  const addrs: any = map[chainId]
  if (!addrs || !addrs.RentalAgreementNFT) return null
  const s = signerOrProvider || getProvider()
  return new ethers.Contract(addrs.RentalAgreementNFT, AGREEMENTS_ABI as any, s)
}

export async function loadStakingContract(chainId: string, signerOrProvider?: any) {
  const map = await getContractsMap()
  const addrs: any = map[chainId]
  if (!addrs || !addrs.DepositStaking) return null
  const s = signerOrProvider || getProvider()
  return new ethers.Contract(addrs.DepositStaking, STAKING_ABI as any, s)
}

export async function getChainIdHex(): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ethereum = (window as any).ethereum
  if (!ethereum) throw new Error('Wallet not found')
  const cid: string = await ethereum.request({ method: 'eth_chainId' })
  return cid
}
