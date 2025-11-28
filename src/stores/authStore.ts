import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Database } from '../types/database'

type UserProfile = Database['public']['Tables']['users']['Row']

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

// Track if we've already set up the auth listener to prevent duplicates
let authListenerSetup = false

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    // Prevent multiple initializations
    if (get().initialized || authListenerSetup) {
      return
    }
    authListenerSetup = true

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        set({ user: session.user })
        await get().fetchProfile()
      }
    } catch (error) {
      console.error('Initialize error:', error)
    } finally {
      set({ loading: false, initialized: true })
    }

    // Listen for auth changes - only handle SIGNED_OUT
    // All other events are handled by getSession() above
    supabase.auth.onAuthStateChange(async (event) => {
      // Only handle sign out - everything else causes unnecessary re-renders
      if (event === 'SIGNED_OUT') {
        set({ user: null, profile: null })
      }
      // Ignore all other events - they fire too frequently and cause feed reloads
    })
  },

  signUp: async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username
        },
        emailRedirectTo: `${window.location.origin}/auth/confirm`
      }
    })

    if (error) throw error
    if (!data.user) throw new Error('No user returned')

    // Create user profile using database function (bypasses RLS)
    const { error: profileError } = await supabase.rpc('create_user_profile', {
      user_id: data.user.id,
      user_email: data.user.email!,
      user_username: username
    } as any)

    if (profileError) throw profileError

    // Don't set user or fetch profile yet - wait for email verification
    // set({ user: data.user })
    // await get().fetchProfile()
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    set({ user: data.user })
    await get().fetchProfile()
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    set({ user: null, profile: null })
  },

  fetchProfile: async () => {
    const { user } = get()
    if (!user) return

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Fetch profile error:', error)
      return
    }

    set({ profile: data })
  },
}))
