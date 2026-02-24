/**
 * Image URL validation utility
 * Validates that a URL points to a valid, accessible image
 */

const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_CONTENT_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]

export interface ImageValidationResult {
  valid: boolean
  error?: string
  contentType?: string
  size?: number
}

export async function validateImageUrl(url: string): Promise<ImageValidationResult> {
  try {
    // Basic URL validation
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return { valid: false, error: 'Invalid URL format' }
    }

    // Only allow http/https
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return { valid: false, error: 'Only HTTP/HTTPS URLs are allowed' }
    }

    // Fetch with HEAD request first to check headers without downloading full image
    const headResponse = await fetch(url, {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })

    if (!headResponse.ok) {
      return { valid: false, error: `Image not accessible (HTTP ${headResponse.status})` }
    }

    const contentType = headResponse.headers.get('content-type')
    if (!contentType || !ALLOWED_CONTENT_TYPES.some(type => contentType.includes(type))) {
      return { valid: false, error: 'URL does not point to a valid image (must be JPG, PNG, GIF, WebP, or SVG)' }
    }

    const contentLength = headResponse.headers.get('content-length')
    if (contentLength) {
      const size = parseInt(contentLength, 10)
      if (size > MAX_IMAGE_SIZE) {
        return { valid: false, error: `Image too large (max ${MAX_IMAGE_SIZE / 1024 / 1024}MB)` }
      }
      return { valid: true, contentType, size }
    }

    // If no content-length, do a partial GET to verify it's actually an image
    const getResponse = await fetch(url, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
      headers: { Range: 'bytes=0-1023' }, // Only fetch first 1KB
    })

    if (!getResponse.ok) {
      return { valid: false, error: 'Image not accessible' }
    }

    return { valid: true, contentType }
  } catch (error: any) {
    if (error.name === 'AbortError' || error.name === 'TimeoutError') {
      return { valid: false, error: 'Image URL timed out (server too slow or unreachable)' }
    }
    return { valid: false, error: `Failed to validate image: ${error.message}` }
  }
}

/**
 * Validate multiple image URLs in parallel
 */
export async function validateImageUrls(urls: string[]): Promise<ImageValidationResult[]> {
  return Promise.all(urls.map(url => validateImageUrl(url)))
}
