import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'
import type { Database } from '../types/database'

type UserProfile = Database['public']['Tables']['users']['Row']

interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, username: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  fetchProfile: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        set({ user: session.user })
        await get().fetchProfile()
      }
    } catch (error) {
      console.error('Initialize error:', error)
    } finally {
      set({ loading: false })
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, 'Has session:', !!session)
      
      // Handle token refresh - don't refetch profile, just update user
      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed successfully')
        set({ user: session?.user ?? null })
        return
      }
      
      // Handle signed out
      if (event === 'SIGNED_OUT') {
        set({ user: null, profile: null })
        return
      }
      
      // Only fetch profile on INITIAL_SESSION (when app loads)
      if (event === 'INITIAL_SESSION') {
        console.log('INITIAL_SESSION: Setting user and fetching profile')
        set({ user: session?.user ?? null })
        if (session?.user) {
          await get().fetchProfile()
        } else {
          set({ profile: null })
        }
        return
      }
      
      // For SIGNED_IN, update user and fetch profile ONLY if we don't have one
      if (event === 'SIGNED_IN') {
        console.log('SIGNED_IN: Updating user')
        const currentProfile = get().profile
        set({ user: session?.user ?? null })
        
        // Only fetch profile if we don't have one yet
        if (session?.user && !currentProfile) {
          console.log('SIGNED_IN: No profile found, fetching...')
          await get().fetchProfile()
        }
      }
    })
  },

  signUp: async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
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

    set({ user: data.user })
    await get().fetchProfile()
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
