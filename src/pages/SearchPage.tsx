// @ts-nocheck - Supabase type inference issues
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Trophy, User, Image } from 'lucide-react'
import { searchApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'

type SearchResult = {
  type: 'contest' | 'user' | 'entry'
  id: string
  title?: string
  username?: string
  display_name?: string
  avatar_url?: string
  thumbnail_url?: string
  phase_4_url?: string
  description?: string
  level?: number
  contest_title?: string
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'contests' | 'users' | 'entries'>('all')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const searchResults: SearchResult[] = []

      // Search contests
      if (filter === 'all' || filter === 'contests') {
        const { data: contests } = await supabase
          .from('contests')
          .select('id, title, description, thumbnail_url')
          .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(10)

        if (contests) {
          searchResults.push(
            ...contests.map((c) => ({
              type: 'contest' as const,
              id: c.id,
              title: c.title,
              description: c.description,
              thumbnail_url: c.thumbnail_url,
            }))
          )
        }
      }

      // Search users
      if (filter === 'all' || filter === 'users') {
        // Search by username OR display_name
        const searchPattern = `%${query.toLowerCase()}%`
        const { data: users, error: usersError } = await supabase
          .from('users')
          .select('id, username, display_name, avatar_url, level')
          .or(`username.ilike.${searchPattern},display_name.ilike.${searchPattern}`)
          .limit(10)

        if (usersError) {
              supabase.from('contests').select('title').eq('id', e.contest_id).single(),
              supabase.from('users').select('username').eq('id', e.user_id).single()
            ])
            return { ...e, contests: contest, users: user }
          })
        )

        if (entriesWithData) {
          // Filter entries where contest title matches
          const matchingEntries = entriesWithData.filter((e: any) =>
            e.contests?.title?.toLowerCase().includes(query.toLowerCase())
          )

          searchResults.push(
            ...matchingEntries.map((e: any) => ({
              type: 'entry' as const,
              id: e.id,
              phase_4_url: e.phase_4_url,
              contest_title: e.contests?.title,
              username: e.users?.username,
            }))
          )
        }
      }

      setResults(searchResults)
    } catch (error) {
      console.error('Error searching:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Search</h1>
        <p className="text-text-secondary text-lg">
          Find contests, artists, and artwork
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for contests, artists, or entries..."
              className="w-full pl-12 pr-4 py-3 bg-surface border border-border rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="px-6 py-3 bg-primary hover:bg-primary-hover rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {/* Filter Tabs */}
      <div className="flex gap-3 mb-6 border-b border-border">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'all'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('contests')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'contests'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Contests
        </button>
        <button
          onClick={() => setFilter('users')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'users'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Artists
        </button>
        <button
          onClick={() => setFilter('entries')}
          className={`px-4 py-2 font-medium transition-colors ${
            filter === 'entries'
              ? 'text-primary border-b-2 border-primary'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Entries
        </button>
      </div>

      {/* Results */}
      {results.length === 0 && query && !loading && (
        <div className="text-center py-12 bg-surface rounded-lg">
          <Search className="w-16 h-16 mx-auto mb-4 text-text-secondary" />
          <h3 className="text-xl font-bold mb-2">No results found</h3>
          <p className="text-text-secondary">
            Try searching with different keywords
          </p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((result) => {
            if (result.type === 'contest') {
              return (
                <Link
                  key={result.id}
                  to={`/contests/${result.id}`}
                  className="flex items-center gap-4 p-4 bg-surface rounded-lg border border-border hover:border-primary transition-all"
                >
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-primary/20 text-primary rounded text-xs font-semibold">
                        CONTEST
                      </span>
                      <h3 className="font-bold truncate">{result.title}</h3>
                    </div>
                    <p className="text-sm text-text-secondary line-clamp-1">
                      {result.description}
                    </p>
                  </div>
                  {result.thumbnail_url && (
                    <img
                      src={result.thumbnail_url}
                      alt={result.title}
                      className="w-16 h-16 rounded object-cover flex-shrink-0"
                    />
                  )}
                </Link>
              )
            }

            if (result.type === 'user') {
              return (
                <Link
                  key={result.id}
                  to={`/users/${result.username}`}
                  className="flex items-center gap-4 p-4 bg-surface rounded-lg border border-border hover:border-primary transition-all"
                >
                  <div className="relative flex-shrink-0">
                    {result.avatar_url ? (
                      <img
                        src={result.avatar_url}
                        alt={result.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                    )}
                    {result.level && (
                      <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                        {result.level}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-secondary/20 text-secondary rounded text-xs font-semibold">
                        ARTIST
                      </span>
                      <h3 className="font-bold truncate">
                        {result.display_name || result.username}
                      </h3>
                    </div>
                    <p className="text-sm text-text-secondary">@{result.username}</p>
                  </div>
                </Link>
              )
            }

            if (result.type === 'entry') {
              return (
                <Link
                  key={result.id}
                  to={`/entries/${result.id}`}
                  className="flex items-center gap-4 p-4 bg-surface rounded-lg border border-border hover:border-primary transition-all"
                >
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Image className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-success/20 text-success rounded text-xs font-semibold">
                        ENTRY
                      </span>
                      <h3 className="font-bold truncate">{result.contest_title}</h3>
                    </div>
                    <p className="text-sm text-text-secondary">by @{result.username}</p>
                  </div>
                  {result.phase_4_url && (
                    <img
                      src={result.phase_4_url}
                      alt="Entry"
                      className="w-16 h-16 rounded object-cover flex-shrink-0"
                    />
                  )}
                </Link>
              )
            }

            return null
          })}
        </div>
      )}

      {!query && (
        <div className="text-center py-12 bg-surface rounded-lg">
          <Search className="w-16 h-16 mx-auto mb-4 text-text-secondary" />
          <h3 className="text-xl font-bold mb-2">Start searching</h3>
          <p className="text-text-secondary">
            Enter keywords to find contests, artists, or entries
          </p>
        </div>
      )}
    </div>
  )
}
