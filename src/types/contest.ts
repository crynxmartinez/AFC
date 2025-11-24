// Contest category types
export type ContestCategory = 'art' | 'cosplay' | 'photography' | 'music' | 'video'

// Phase configuration interface
export interface PhaseConfig {
  number: number
  name: string
  description: string
  required: boolean
}

// Contest interface (extends existing)
export interface Contest {
  id: string
  title: string
  description: string | null
  cover_image_url: string | null
  start_date: string
  end_date: string
  voting_end_date: string | null
  status: 'upcoming' | 'active' | 'voting' | 'completed' | 'cancelled'
  category: ContestCategory
  max_entries_per_user: number
  prize_pool: string | null
  rules: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

// Entry interface (extends existing)
export interface Entry {
  id: string
  user_id: string
  contest_id: string
  title: string | null
  description: string | null
  phase_1_url: string | null
  phase_2_url: string | null
  phase_3_url: string | null
  phase_4_url: string | null
  current_phase: number
  status: 'draft' | 'pending_review' | 'approved' | 'rejected'
  vote_count: number
  comment_count: number
  share_count: number
  final_rank: number | null
  created_at: string
  updated_at: string
  users: {
    username: string
    display_name: string | null
    avatar_url: string | null
    level: number
  }
  contests: {
    title: string
    category: ContestCategory
  }
}

// Phase upload data
export interface PhaseUpload {
  phaseNumber: number
  file: File | null
  url: string | null
}
