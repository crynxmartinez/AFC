import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { contestsApi } from '@/lib/api'
import { useToastStore } from '@/stores/toastStore'
import { useAuthStore } from '@/stores/authStore'

export default function AdminEditContest() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [thumbnailError, setThumbnailError] = useState(false)
  
  // Sponsor fields
  const [hasSponsor, setHasSponsor] = useState(false)
  const [sponsorName, setSponsorName] = useState('')
  const [sponsorPrizeAmount, setSponsorPrizeAmount] = useState('')
  const [sponsorLogoUrl, setSponsorLogoUrl] = useState('')
  const [sponsorLogoError, setSponsorLogoError] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const toast = useToastStore()
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      fetchContest()
    }
  }, [id])

  const fetchContest = async () => {
    try {
      const response: any = await contestsApi.get(id!)
      const data = response.data?.contest || response.contest || response.data

      if (!data) throw new Error('Contest not found')

      setTitle(data.title)
      setDescription(data.description)
      setStartDate((data.startDate || data.start_date || '').split('T')[0])
      setEndDate((data.endDate || data.end_date || '').split('T')[0])
      setThumbnailUrl(data.thumbnailUrl || data.thumbnail_url || '')
      
      // Load sponsor data
      setHasSponsor(data.hasSponsor || data.has_sponsor || false)
      setSponsorName(data.sponsorName || data.sponsor_name || '')
      setSponsorPrizeAmount((data.sponsorPrizeAmount || data.sponsor_prize_amount)?.toString() || '')
      setSponsorLogoUrl(data.sponsorLogoUrl || data.sponsor_logo_url || '')
    } catch (err: any) {
      console.error('Error fetching contest:', err)
      setError('Failed to load contest')
    } finally {
      setFetchLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('You must be logged in to edit a contest')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Update contest via API
      await contestsApi.update(id!, {
          title,
          description,
          start_date: new Date(startDate + 'T00:00:00+08:00').toISOString(),
          end_date: new Date(endDate + 'T23:59:59+08:00').toISOString(),
          thumbnail_url: thumbnailUrl.trim() || null,
          has_sponsor: hasSponsor,
          sponsor_name: hasSponsor ? sponsorName : null,
          sponsor_prize_amount: hasSponsor && sponsorPrizeAmount ? parseFloat(sponsorPrizeAmount) : null,
          sponsor_logo_url: hasSponsor ? sponsorLogoUrl : null,
        })

      toast.success('Contest updated successfully!')
      navigate('/admin/contests')
    } catch (err: any) {
      console.error('Error updating contest:', err)
      setError(err.message || 'Failed to update contest')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return <div className="text-center py-12">Loading contest...</div>
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Contest</h1>

      {error && (
        <div className="bg-error/10 border border-error text-error px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-surface rounded-lg p-6 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Contest Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
            placeholder="Summer Art Contest 2025"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
            placeholder="Describe the contest theme, rules, and prizes..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium mb-2">
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium mb-2">
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Contest Thumbnail URL (Optional)</label>
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              </div>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => { setThumbnailUrl(e.target.value); setThumbnailError(false) }}
                placeholder="https://example.com/contest-thumbnail.jpg"
                className="w-full pl-10 pr-10 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm"
              />
              {thumbnailUrl && (
                <button type="button" onClick={() => { setThumbnailUrl(''); setThumbnailError(false) }} className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
            {thumbnailUrl.trim() && !thumbnailError && (
              <div className="border border-border rounded-lg p-3 bg-surface">
                <img src={thumbnailUrl.trim()} alt="Preview" className="max-h-48 mx-auto rounded" onError={() => setThumbnailError(true)} />
              </div>
            )}
            {thumbnailError && (
              <p className="text-xs text-error">Could not load image. Please check the URL.</p>
            )}
            <p className="text-xs text-text-secondary">Paste a direct image link (JPG, PNG, WebP, GIF)</p>
          </div>
        </div>

        {/* Sponsor Section */}
        <div className="border-t border-border pt-6">
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="hasSponsor"
              checked={hasSponsor}
              onChange={(e) => setHasSponsor(e.target.checked)}
              className="w-5 h-5 rounded border-border"
            />
            <label htmlFor="hasSponsor" className="text-lg font-semibold">
              This contest has a sponsor
            </label>
          </div>

          {hasSponsor && (
            <div className="space-y-4 pl-8">
              <div>
                <label htmlFor="sponsorName" className="block text-sm font-medium mb-2">
                  Sponsor Name
                </label>
                <input
                  id="sponsorName"
                  type="text"
                  value={sponsorName}
                  onChange={(e) => setSponsorName(e.target.value)}
                  required={hasSponsor}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                  placeholder="Company Name"
                />
              </div>

              <div>
                <label htmlFor="sponsorPrizeAmount" className="block text-sm font-medium mb-2">
                  Additional Prize Amount (₱)
                </label>
                <input
                  id="sponsorPrizeAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={sponsorPrizeAmount}
                  onChange={(e) => setSponsorPrizeAmount(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:border-primary"
                  placeholder="5000.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sponsor Logo URL</label>
                <div className="space-y-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </div>
                    <input
                      type="url"
                      value={sponsorLogoUrl}
                      onChange={(e) => { setSponsorLogoUrl(e.target.value); setSponsorLogoError(false) }}
                      placeholder="https://example.com/sponsor-logo.png"
                      className="w-full pl-10 pr-10 py-2.5 bg-background border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                    />
                    {sponsorLogoUrl && (
                      <button type="button" onClick={() => { setSponsorLogoUrl(''); setSponsorLogoError(false) }} className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                  {sponsorLogoUrl.trim() && !sponsorLogoError && (
                    <div className="border border-border rounded-lg p-3 bg-surface">
                      <img src={sponsorLogoUrl.trim()} alt="Sponsor Logo" className="max-h-24 mx-auto" onError={() => setSponsorLogoError(true)} />
                    </div>
                  )}
                  {sponsorLogoError && (
                    <p className="text-xs text-error">Could not load image. Please check the URL.</p>
                  )}
                  <p className="text-xs text-text-secondary">Paste a direct image link (PNG, JPG, WebP, SVG)</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-primary hover:bg-primary-hover rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Contest'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/contests')}
            disabled={loading}
            className="px-6 py-3 bg-background hover:bg-border rounded-lg font-semibold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
