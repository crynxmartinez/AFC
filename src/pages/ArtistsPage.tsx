// @ts-nocheck - Supabase type inference issues
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { formatNumber } from '@/lib/utils'
import { Users, Search, TrendingUp, Award, Calendar, Image } from 'lucide-react'

type Artist = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  xp: number
  level: number
  profile_title: string | null
  created_at: string
  total_entries?: number
  latest_entry_image?: string | null
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'xp' | 'level' | 'entries' | 'newest'>('xp')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchArtists()
  }, [sortBy])

  const fetchArtists = async () => {
    setLoading(true)
    try {
      // Determine sort column
      let orderColumn = 'xp'
      if (sortBy === 'level') orderColumn = 'level'
      else if (sortBy === 'newest') orderColumn = 'created_at'

      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, username, display_name, avatar_url, xp, level, profile_title, created_at')
        .order(orderColumn, { ascending: sortBy === 'newest' ? false : false })
        .limit(50)

      if (usersError) throw usersError

      // For each user, get their entry count and latest entry
      const artistsWithStats = await Promise.all(
        (usersData || []).map(async (user: any) => {
          // Get entry count
          const { count: entryCount } = await supabase
            .from('entries')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('status', 'approved')

          // Get latest entry image
          const { data: latestEntry } = await supabase
            .from('entries')
            .select('phase_4_url')
            .eq('user_id', user.id)
            .eq('status', 'approved')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          return {
            ...user,
            total_entries: entryCount || 0,
            latest_entry_image: latestEntry?.phase_4_url || null,
          }
        })
      )

      // Sort by entries if needed (since we can't do it in the query)
      if (sortBy === 'entries') {
        artistsWithStats.sort((a, b) => (b.total_entries || 0) - (a.total_entries || 0))
      }

      setArtists(artistsWithStats)
    } catch (error) {
      console.error('Error fetching artists:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter artists by search query
  const filteredArtists = artists.filter((artist) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      artist.username.toLowerCase().includes(query) ||
      artist.display_name?.toLowerCase().includes(query)
    )
  })

  if (loading) {
    return <div className="text-center py-12">Loading artists...</div>
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold">Artists</h1>
        </div>
        <p className="text-text-secondary text-lg">
          Discover talented Filipino digital artists
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search artists..."
            className="w-full pl-10 pr-4 py-2 bg-surface border border-border rounded-lg focus:outline-none focus:border-primary"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('xp')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              sortBy === 'xp'
                ? 'bg-primary text-white'
                : 'bg-surface hover:bg-border'
            }`}
          >
            <TrendingUp className="w-4 h-4 inline mr-2" />
            Top XP
          </button>
          <button
            onClick={() => setSortBy('level')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              sortBy === 'level'
                ? 'bg-primary text-white'
                : 'bg-surface hover:bg-border'
            }`}
          >
            <Award className="w-4 h-4 inline mr-2" />
            Level
          </button>
          <button
            onClick={() => setSortBy('entries')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              sortBy === 'entries'
                ? 'bg-primary text-white'
                : 'bg-surface hover:bg-border'
            }`}
          >
            <Image className="w-4 h-4 inline mr-2" />
            Entries
          </button>
          <button
            onClick={() => setSortBy('newest')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              sortBy === 'newest'
                ? 'bg-primary text-white'
                : 'bg-surface hover:bg-border'
            }`}
          >
            <Calendar className="w-4 h-4 inline mr-2" />
            Newest
          </button>
        </div>
      </div>

      {/* Artists Grid */}
      {filteredArtists.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-lg">
          <Users className="w-16 h-16 mx-auto mb-4 text-text-secondary" />
          <h3 className="text-xl font-bold mb-2">No artists found</h3>
          <p className="text-text-secondary">
            {searchQuery ? 'Try a different search term' : 'No artists have joined yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredArtists.map((artist) => (
            <Link
              key={artist.id}
              to={`/users/${artist.username}`}
              className="bg-surface rounded-lg overflow-hidden border border-border hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/20 group"
            >
              {/* Latest Entry Preview or Placeholder */}
              <div className="aspect-square bg-background relative overflow-hidden">
                {artist.latest_entry_image ? (
                  <img
                    src={artist.latest_entry_image}
                    alt={`${artist.username}'s work`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-16 h-16 text-text-secondary" />
                  </div>
                )}
                
                {/* Overlay with Avatar */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                  <div className="flex items-center gap-3 w-full">
                    <div className="relative flex-shrink-0">
                      {artist.avatar_url ? (
                        <img
                          src={artist.avatar_url}
                          alt={artist.username}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center border-2 border-white">
                          <span className="text-lg font-bold text-white">
                            {artist.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold border-2 border-surface">
                        {artist.level}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-white truncate">
                        {artist.display_name || artist.username}
                      </h3>
                      <p className="text-xs text-gray-300">@{artist.username}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="p-4">
                {artist.profile_title && (
                  <div className="mb-2">
                    <span className="px-2 py-1 bg-primary/20 text-primary rounded text-xs font-semibold">
                      {artist.profile_title}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-primary">{artist.level}</div>
                    <div className="text-xs text-text-secondary">Level</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary">{formatNumber(artist.xp)}</div>
                    <div className="text-xs text-text-secondary">XP</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-primary">{artist.total_entries}</div>
                    <div className="text-xs text-text-secondary">Entries</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Results Count */}
      <div className="mt-6 text-center text-sm text-text-secondary">
        Showing {filteredArtists.length} of {artists.length} artists
      </div>
    </div>
  )
}
