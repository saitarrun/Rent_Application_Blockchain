import { create } from 'zustand'

export type Env = 'local' | 'sepolia'

export type Profile = { name?: string; contact?: string }

type AppState = {
  session?: string
  profile: Profile
  env: Env
  chainId?: '1337' | '11155111' | string
  account?: string
  selection?: string
  setSession: (t?: string) => void
  setProfile: (p: Profile) => void
  setEnv: (e: Env) => void
  setChainId: (c?: AppState['chainId']) => void
  setAccount: (a?: string) => void
  setSelection: (id?: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  session: undefined,
  profile: {},
  env: 'local',
  setSession: (t) => set({ session: t }),
  setProfile: (p) => set({ profile: { ...p } }),
  setEnv: (e) => set({ env: e }),
  setChainId: (c) => set({ chainId: c }),
  setAccount: (a) => set({ account: a }),
  setSelection: (id) => set({ selection: id })
}))

