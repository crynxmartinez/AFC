export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          avatar_url: string | null
          bio: string | null
          role: 'user' | 'admin'
          points_balance: number
          total_spent: number
          xp: number
          level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username: string
          avatar_url?: string | null
          bio?: string | null
          role?: 'user' | 'admin'
          points_balance?: number
          total_spent?: number
          xp?: number
          level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          avatar_url?: string | null
          bio?: string | null
          role?: 'user' | 'admin'
          points_balance?: number
          total_spent?: number
          xp?: number
          level?: number
          created_at?: string
          updated_at?: string
        }
      }
      contests: {
        Row: {
          id: string
          title: string
          description: string
          thumbnail_url: string | null
          start_date: string
          end_date: string
          status: 'draft' | 'active' | 'voting' | 'ended'
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          thumbnail_url?: string | null
          start_date: string
          end_date: string
          status?: 'draft' | 'active' | 'voting' | 'ended'
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          thumbnail_url?: string | null
          start_date?: string
          end_date?: string
          status?: 'draft' | 'active' | 'voting' | 'ended'
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      entries: {
        Row: {
          id: string
          contest_id: string
          user_id: string
          phase_1_url: string | null
          phase_2_url: string | null
          phase_3_url: string | null
          phase_4_url: string | null
          status: 'draft' | 'pending_review' | 'approved' | 'rejected'
          rejection_reason: string | null
          vote_count: number
          final_rank: number | null
          submitted_at: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contest_id: string
          user_id: string
          phase_1_url?: string | null
          phase_2_url?: string | null
          phase_3_url?: string | null
          phase_4_url?: string | null
          status?: 'draft' | 'pending_review' | 'approved' | 'rejected'
          rejection_reason?: string | null
          vote_count?: number
          final_rank?: number | null
          submitted_at?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          contest_id?: string
          user_id?: string
          phase_1_url?: string | null
          phase_2_url?: string | null
          phase_3_url?: string | null
          phase_4_url?: string | null
          status?: 'draft' | 'pending_review' | 'approved' | 'rejected'
          rejection_reason?: string | null
          vote_count?: number
          final_rank?: number | null
          submitted_at?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      votes: {
        Row: {
          id: string
          entry_id: string
          user_id: string
          points_spent: number
          voted_at: string
        }
        Insert: {
          id?: string
          entry_id: string
          user_id: string
          points_spent?: number
          voted_at?: string
        }
        Update: {
          id?: string
          entry_id?: string
          user_id?: string
          points_spent?: number
          voted_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'purchase' | 'payout' | 'vote'
          amount: number
          points: number
          status: 'pending' | 'completed' | 'failed'
          payment_method: string | null
          reference_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'purchase' | 'payout' | 'vote'
          amount: number
          points: number
          status?: 'pending' | 'completed' | 'failed'
          payment_method?: string | null
          reference_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'purchase' | 'payout' | 'vote'
          amount?: number
          points?: number
          status?: 'pending' | 'completed' | 'failed'
          payment_method?: string | null
          reference_id?: string | null
          created_at?: string
        }
      }
      follows: {
        Row: {
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          entry_id: string
          user_id: string
          text: string
          created_at: string
        }
        Insert: {
          id?: string
          entry_id: string
          user_id: string
          text: string
          created_at?: string
        }
        Update: {
          id?: string
          entry_id?: string
          user_id?: string
          text?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          content: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          content: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          content?: string
          read?: boolean
          created_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          user_id: string
          badge_type: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_type: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_type?: string
          earned_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
