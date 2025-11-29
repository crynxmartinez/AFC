import { useMemo } from 'react'

type Props = {
  content: string
  className?: string
}

/**
 * Renders text with basic markdown support:
 * - **bold** or __bold__
 * - *italic* or _italic_
 * - [link text](url)
 * - Auto-detects URLs and makes them clickable
 * - @username mentions as links
 */
export default function MarkdownRenderer({ content, className = '' }: Props) {
  const renderedContent = useMemo(() => {
    if (!content) return null

    // Process the content
    let processed = content

    // Escape HTML to prevent XSS
    processed = processed
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    // Bold: **text** or __text__
    processed = processed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    processed = processed.replace(/__(.+?)__/g, '<strong>$1</strong>')

    // Italic: *text* or _text_ (but not inside words)
    processed = processed.replace(/(?<!\w)\*([^*]+)\*(?!\w)/g, '<em>$1</em>')
    processed = processed.replace(/(?<!\w)_([^_]+)_(?!\w)/g, '<em>$1</em>')

    // Links: [text](url)
    processed = processed.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">$1</a>'
    )

    // Auto-detect URLs (not already in links)
    processed = processed.replace(
      /(?<!href="|">)(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline break-all">$1</a>'
    )

    // @username mentions - link to user profile
    processed = processed.replace(
      /@([a-zA-Z0-9_]+)/g,
      '<a href="/users/$1" class="text-primary hover:underline font-medium">@$1</a>'
    )

    // Convert newlines to <br>
    processed = processed.replace(/\n/g, '<br />')

    return processed
  }, [content])

  if (!content) return null

  return (
    <span
      className={`whitespace-pre-wrap break-words ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedContent || '' }}
    />
  )
}
