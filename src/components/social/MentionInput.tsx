// @ts-nocheck
import { useState, useRef, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

type User = {
  id: string
  username: string
  avatar_url: string | null
}

type Props = {
  value: string
  onChange: (value: string, mentionedUsers: string[]) => void
  placeholder?: string
  disabled?: boolean
  autoFocus?: boolean
  className?: string
  onSubmit?: () => void
}

export default function MentionInput({
  value,
  onChange,
  placeholder = 'Write a comment...',
  disabled = false,
  autoFocus = false,
  className = '',
  onSubmit
}: Props) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<User[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mentionSearch, setMentionSearch] = useState('')
  const [cursorPosition, setCursorPosition] = useState(0)
  const [mentionStartIndex, setMentionStartIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Extract mentioned usernames from text
  const extractMentions = useCallback((text: string): string[] => {
    const mentionRegex = /@([a-zA-Z0-9_]+)/g
    const mentions: string[] = []
    let match
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push(match[1])
    }
    return [...new Set(mentions)]
  }, [])

  // Search users by username prefix
  const searchUsers = async (query: string) => {
    if (query.length < 1) {
      setSuggestions([])
      return
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, avatar_url')
        .ilike('username', `${query}%`)
        .limit(5)

      if (error) throw error
      setSuggestions(data || [])
      setSelectedIndex(0)
    } catch (error) {
      console.error('Error searching users:', error)
      setSuggestions([])
    }
  }

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    const newCursorPosition = e.target.selectionStart || 0
    setCursorPosition(newCursorPosition)

    // Check if we're typing a mention
    const textBeforeCursor = newValue.slice(0, newCursorPosition)
    const mentionMatch = textBeforeCursor.match(/@([a-zA-Z0-9_]*)$/)

    if (mentionMatch) {
      const searchTerm = mentionMatch[1]
      setMentionSearch(searchTerm)
      setMentionStartIndex(mentionMatch.index!)
      setShowSuggestions(true)
      searchUsers(searchTerm)
    } else {
      setShowSuggestions(false)
      setMentionSearch('')
      setMentionStartIndex(-1)
    }

    const mentions = extractMentions(newValue)
    onChange(newValue, mentions)
  }

  // Handle suggestion selection
  const selectSuggestion = (user: User) => {
    if (mentionStartIndex === -1) return

    const beforeMention = value.slice(0, mentionStartIndex)
    const afterMention = value.slice(cursorPosition)
    const newValue = `${beforeMention}@${user.username} ${afterMention}`

    const mentions = extractMentions(newValue)
    onChange(newValue, mentions)

    setShowSuggestions(false)
    setMentionSearch('')
    setMentionStartIndex(-1)

    // Focus back on input and set cursor position
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        const newCursorPos = mentionStartIndex + user.username.length + 2
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter' && !e.shiftKey && onSubmit) {
        e.preventDefault()
        onSubmit()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % suggestions.length)
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
        break
      case 'Enter':
      case 'Tab':
        e.preventDefault()
        selectSuggestion(suggestions[selectedIndex])
        break
      case 'Escape':
        setShowSuggestions(false)
        break
    }
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative flex-1">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        className={`w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-primary ${className}`}
      />

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute bottom-full left-0 right-0 mb-1 bg-surface border border-border rounded-lg shadow-lg overflow-hidden z-50"
        >
          {suggestions.map((user, index) => (
            <button
              key={user.id}
              type="button"
              onClick={() => selectSuggestion(user)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                index === selectedIndex ? 'bg-primary/10' : 'hover:bg-background'
              }`}
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-sm font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="font-medium">@{user.username}</span>
            </button>
          ))}
        </div>
      )}

      {/* Hint text */}
      {showSuggestions && suggestions.length === 0 && mentionSearch.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-1 bg-surface border border-border rounded-lg shadow-lg p-3 text-sm text-text-secondary z-50">
          No users found matching "@{mentionSearch}"
        </div>
      )}
    </div>
  )
}
