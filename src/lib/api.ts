const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

interface ApiResponse<T = any> {
  data?: T
  error?: string
}

async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important for cookies
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error || 'An error occurred' }
    }

    return { data }
  } catch (error) {
    console.error('API request error:', error)
    return { error: 'Network error' }
  }
}

// Auth API
export const authApi = {
  signup: async (email: string, username: string, password: string) => {
    return apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    })
  },

  login: async (emailOrUsername: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrUsername, password }),
    })
  },

  logout: async () => {
    return apiRequest('/auth/logout', {
      method: 'POST',
    })
  },

  getSession: async () => {
    return apiRequest('/auth/session', {
      method: 'GET',
    })
  },
}

// Users API
export const usersApi = {
  getProfile: async (username: string) => {
    return apiRequest(`/users/by-username/${username}`)
  },

  updateProfile: async (userId: string, data: any) => {
    return apiRequest(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  updateAvatar: async (avatarUrl: string) => {
    return apiRequest('/users/avatar', {
      method: 'POST',
      body: JSON.stringify({ avatarUrl }),
    })
  },

  updateCoverPhoto: async (coverPhotoUrl: string) => {
    return apiRequest('/users/cover-photo', {
      method: 'POST',
      body: JSON.stringify({ coverPhotoUrl }),
    })
  },

  getFollowing: async (userId: string) => {
    return apiRequest(`/users/${userId}/following`)
  },

  getFollowers: async (userId: string) => {
    return apiRequest(`/users/${userId}/followers`)
  },

  getStats: async (userId: string) => {
    return apiRequest(`/users/${userId}/stats`)
  },

  getEntries: async (userId: string) => {
    return apiRequest(`/users/${userId}/entries`)
  },

  getBadges: async (userId: string) => {
    return apiRequest(`/users/${userId}/badges`)
  },

  getAchievements: async (userId: string) => {
    return apiRequest(`/users/${userId}/achievements`)
  },
}

// Contests API
export const contestsApi = {
  list: async (status?: string) => {
    const query = status ? `?status=${status}` : ''
    return apiRequest(`/contests${query}`)
  },

  get: async (id: string) => {
    return apiRequest(`/contests/${id}`)
  },

  create: async (data: any) => {
    return apiRequest('/contests', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id: string, data: any) => {
    return apiRequest(`/contests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  delete: async (id: string) => {
    return apiRequest(`/contests/${id}`, {
      method: 'DELETE',
    })
  },

  finalize: async (id: string) => {
    return apiRequest(`/contests/${id}/finalize`, {
      method: 'POST',
    })
  },

  getRecentWinners: async (days: number = 7) => {
    return apiRequest(`/contests/winners/recent?days=${days}`)
  },

  getContestWinners: async (id: string) => {
    return apiRequest(`/contests/${id}/winners`)
  },

  getEntries: async (id: string) => {
    return apiRequest(`/contests/${id}/entries`)
  },
}

// Entries API
export const entriesApi = {
  get: async (id: string) => {
    return apiRequest(`/entries/${id}`)
  },

  create: async (data: any) => {
    return apiRequest('/entries', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  update: async (id: string, data: any) => {
    return apiRequest(`/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  listByContest: async (contestId: string) => {
    return apiRequest(`/contests/${contestId}/entries`)
  },
}

// Reactions API
export const reactionsApi = {
  list: async (entryId: string) => {
    return apiRequest(`/entries/${entryId}/reactions`)
  },

  add: async (entryId: string, reactionType: string) => {
    return apiRequest(`/entries/${entryId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ reactionType }),
    })
  },

  remove: async (entryId: string) => {
    return apiRequest(`/entries/${entryId}/reactions`, {
      method: 'DELETE',
    })
  },
}

// Comments API
export const commentsApi = {
  list: async (entryId: string) => {
    return apiRequest(`/entries/${entryId}/comments`)
  },

  create: async (entryId: string, content: string, parentCommentId?: string) => {
    return apiRequest(`/entries/${entryId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content, parentCommentId }),
    })
  },

  update: async (commentId: string, content: string) => {
    return apiRequest(`/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    })
  },

  delete: async (commentId: string) => {
    return apiRequest(`/comments/${commentId}`, {
      method: 'DELETE',
    })
  },

  pin: async (commentId: string, isPinned: boolean) => {
    return apiRequest(`/comments/${commentId}/pin`, {
      method: 'PUT',
      body: JSON.stringify({ isPinned }),
    })
  },
}

// Follows API
export const followsApi = {
  follow: async (userId: string) => {
    return apiRequest('/follows', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    })
  },

  unfollow: async (userId: string) => {
    return apiRequest(`/follows/${userId}`, {
      method: 'DELETE',
    })
  },

  getFollowers: async (userId: string) => {
    return apiRequest(`/users/${userId}/followers`)
  },

  getFollowing: async (userId: string) => {
    return apiRequest(`/users/${userId}/following`)
  },
}

// Notifications API
export const notificationsApi = {
  list: async () => {
    return apiRequest('/notifications')
  },

  markAsRead: async (notificationId: string) => {
    return apiRequest(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    })
  },

  markAllAsRead: async () => {
    return apiRequest('/notifications/read-all', {
      method: 'PUT',
    })
  },

  delete: async (notificationId: string) => {
    return apiRequest(`/notifications/${notificationId}`, {
      method: 'DELETE',
    })
  },

  clearAll: async () => {
    return apiRequest('/notifications', {
      method: 'DELETE',
    })
  },
}

// Feed API
export const feedApi = {
  get: async (filter: 'latest' | 'popular' | 'following' = 'latest') => {
    return apiRequest(`/feed?filter=${filter}`)
  },

  getFeed: async (filter: 'latest' | 'popular' | 'following' = 'latest', timeRange?: number) => {
    const timeParam = timeRange ? `&timeRange=${timeRange}` : ''
    return apiRequest(`/feed?filter=${filter}${timeParam}`)
  },
}

// Search API
export const searchApi = {
  search: async (query: string, type?: 'all' | 'contests' | 'users' | 'entries') => {
    const typeParam = type ? `&type=${type}` : ''
    return apiRequest(`/search?q=${encodeURIComponent(query)}${typeParam}`)
  },
}

// XP API
export const xpApi = {
  getProgress: async (userId: string) => {
    return apiRequest(`/xp/progress/${userId}`)
  },

  awardXP: async (data: any) => {
    return apiRequest('/xp/award', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

// Auth API
export const authApi = {
  changePassword: async (currentPassword: string, newPassword: string) => {
    return apiRequest('/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    })
  },
}

// Contact API
export const contactApi = {
  submit: async (data: any) => {
    return apiRequest('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

// Leaderboard API
export const leaderboardApi = {
  get: async (limit?: number, timeframe?: string) => {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit.toString())
    if (timeframe) params.append('timeframe', timeframe)
    return apiRequest(`/leaderboard?${params.toString()}`)
  },
}

// Admin API
export const adminApi = {
  getStats: async () => {
    return apiRequest('/admin/stats')
  },

  getUsers: async () => {
    return apiRequest('/admin/users')
  },

  updateUserRole: async (userId: string, role: string) => {
    return apiRequest(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    })
  },

  banUser: async (userId: string, banned: boolean) => {
    return apiRequest(`/admin/users/${userId}/ban`, {
      method: 'PUT',
      body: JSON.stringify({ banned }),
    })
  },

  getXPRewards: async () => {
    return apiRequest('/admin/xp/rewards')
  },

  updateXPReward: async (action: string, xpAmount: number) => {
    return apiRequest(`/admin/xp/rewards/${action}`, {
      method: 'PUT',
      body: JSON.stringify({ xpAmount }),
    })
  },

  getLevels: async () => {
    return apiRequest('/admin/xp/levels')
  },

  updateLevel: async (level: number, xpRequired: number) => {
    return apiRequest(`/admin/xp/levels/${level}`, {
      method: 'PUT',
      body: JSON.stringify({ xpRequired }),
    })
  },
}

// Comment Reactions API
export const commentReactionsApi = {
  get: async (commentId: string) => {
    return apiRequest(`/comments/${commentId}/reactions`)
  },

  add: async (commentId: string, type: string) => {
    return apiRequest('/comment-reactions', {
      method: 'POST',
      body: JSON.stringify({ commentId, type }),
    })
  },

  update: async (reactionId: string, type: string) => {
    return apiRequest(`/comment-reactions/${reactionId}`, {
      method: 'PUT',
      body: JSON.stringify({ type }),
    })
  },

  delete: async (reactionId: string) => {
    return apiRequest(`/comment-reactions/${reactionId}`, {
      method: 'DELETE',
    })
  },
}

export default {
  auth: authApi,
  users: usersApi,
  contests: contestsApi,
  entries: entriesApi,
  reactions: reactionsApi,
  comments: commentsApi,
  follows: followsApi,
  notifications: notificationsApi,
  feed: feedApi,
  search: searchApi,
  xp: xpApi,
}
