import { ethers } from 'ethers'
import contracts from '../../contracts.json'
import RENT_ABI from '../abi/RENT.json'

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

export async function loadRentContract(chainId: string, signerOrProvider?: any) {
  const addrs: any = (contracts as any)[chainId]
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

