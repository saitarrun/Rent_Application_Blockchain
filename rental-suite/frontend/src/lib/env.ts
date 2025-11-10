export async function getChainIdHex(): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ethereum = (window as any).ethereum
  if (!ethereum) throw new Error('Wallet not found')
  const cid: string = await ethereum.request({ method: 'eth_chainId' })
  return cid
}

function hex(n: number) { return '0x' + n.toString(16) }

export async function switchToLocal(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ethereum = (window as any).ethereum
  if (!ethereum) throw new Error('Wallet not found')
  try {
    await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: hex(1337) }] })
  } catch (err: any) {
    if (err?.code === 4902) {
      await ethereum.request({ method: 'wallet_addEthereumChain', params: [{
        chainId: hex(1337), chainName: 'Local', rpcUrls: ['http://127.0.0.1:8545'], nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }
      }] })
    } else throw err
  }
}

export async function switchToSepolia(): Promise<void> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ethereum = (window as any).ethereum
  if (!ethereum) throw new Error('Wallet not found')
  try {
    await ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: hex(11155111) }] })
  } catch (err: any) {
    if (err?.code === 4902) {
      await ethereum.request({ method: 'wallet_addEthereumChain', params: [{
        chainId: hex(11155111), chainName: 'Sepolia', rpcUrls: [(import.meta as any).env.VITE_SEPOLIA_RPC || 'https://rpc.sepolia.org'], nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 }
      }] })
    } else throw err
  }
}

