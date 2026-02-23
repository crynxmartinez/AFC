import { useState, useEffect } from 'react'
import api from '../lib/api'

export function useFeed(filter: 'latest' | 'popular' | 'following' = 'latest') {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFeed = async () => {
      setLoading(true)
      const { data, error } = await api.feed.get(filter)
      if (error) {
        setError(error)
      } else {
        setEntries(data?.entries || [])
      }
      setLoading(false)
    }
    fetchFeed()
  }, [filter])

  return { entries, loading, error }
}

export function useContest(id: string) {
  const [contest, setContest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContest = async () => {
      setLoading(true)
      const { data, error } = await api.contests.get(id)
      if (error) {
        setError(error)
      } else {
        setContest(data?.contest)
      }
      setLoading(false)
    }
    if (id) fetchContest()
  }, [id])

  return { contest, loading, error, refetch: () => {} }
}

export function useContests(status?: string) {
  const [contests, setContests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchContests = async () => {
      setLoading(true)
      const { data, error } = await api.contests.list(status)
      if (error) {
        setError(error)
      } else {
        setContests(data?.contests || [])
      }
      setLoading(false)
    }
    fetchContests()
  }, [status])

  return { contests, loading, error }
}

export function useEntry(id: string) {
  const [entry, setEntry] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEntry = async () => {
      setLoading(true)
      const { data, error } = await api.entries.get(id)
      if (error) {
        setError(error)
      } else {
        setEntry(data?.entry)
      }
      setLoading(false)
    }
    if (id) fetchEntry()
  }, [id])

  return { entry, loading, error }
}

export function useUserProfile(username: string) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      const { data, error } = await api.users.getProfile(username)
      if (error) {
        setError(error)
      } else {
        setUser(data?.user)
      }
      setLoading(false)
    }
    if (username) fetchUser()
  }, [username])

  return { user, loading, error }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = async () => {
    setLoading(true)
    const { data, error } = await api.notifications.list()
    if (error) {
      setError(error)
    } else {
      setNotifications(data?.notifications || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  return { notifications, loading, error, refetch: fetchNotifications }
}

export function useSearch(query: string, type?: 'all' | 'contests' | 'users' | 'entries') {
  const [results, setResults] = useState<any>({ contests: [], users: [], entries: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!query) {
      setResults({ contests: [], users: [], entries: [] })
      return
    }

    const fetchResults = async () => {
      setLoading(true)
      const { data, error } = await api.search.search(query, type)
      if (error) {
        setError(error)
      } else {
        setResults(data || { contests: [], users: [], entries: [] })
      }
      setLoading(false)
    }

    const debounce = setTimeout(fetchResults, 300)
    return () => clearTimeout(debounce)
  }, [query, type])

  return { results, loading, error }
}
