import { create } from 'zustand'
import { authApi } from '../lib/api'

interface User {
  id: string
  email: string
  username: string
  role: string
  displayName: string | null
  avatarUrl: string | null
  level: number
  xp: number
  pointsBalance: number
  emailVerified: boolean
}

type UserProfile = User

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  initialized: boolean
  signUp: (email: string, password: string, username: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  fetchProfile: () => Promise<void>
  initialize: () => Promise<void>
}

// Track if we've already initialized to prevent duplicates
let initialized = false

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    // Prevent multiple initializations
    if (get().initialized || initialized) {
      return
    }
    initialized = true

    try {
      const { data, error } = await authApi.getSession()
      if (!error && data?.user) {
        set({ user: data.user, profile: data.user })
      }
    } catch (error) {
      console.error('Initialize error:', error)
    } finally {
      set({ loading: false, initialized: true })
    }
  },

  signUp: async (email: string, password: string, username: string) => {
    const { data, error } = await authApi.signup(email, username, password)

    if (error) throw new Error(error)
    if (!data?.user) throw new Error('No user returned')

    // User is automatically logged in after signup
    set({ user: data.user, profile: data.user })
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await authApi.login(email, password)

    if (error) throw new Error(error)
    if (!data?.user) throw new Error('Login failed')

    set({ user: data.user, profile: data.user })
  },

  signOut: async () => {
    const { error } = await authApi.logout()
    if (error) throw new Error(error)
    set({ user: null, profile: null })
  },

  fetchProfile: async () => {
    const { user } = get()
    if (!user) return

    const { data, error } = await authApi.getSession()

    if (error || !data?.user) {
      console.error('Fetch profile error:', error)
      return
    }

    set({ user: data.user, profile: data.user })
  },
}))
