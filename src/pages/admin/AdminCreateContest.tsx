// @ts-nocheck - Supabase type inference issues
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

export default function AdminCreateContest() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image must be less than 5MB')
        return
      }
      setThumbnail(file)
      setThumbnailPreview(URL.createObjectURL(file))
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('You must be logged in to create a contest')
      return
    }

    setLoading(true)
    setError('')

    console.log('Creating contest...', { title, description, startDate, endDate, user: user.id })

    try {
      let thumbnailUrl = null

      // Upload thumbnail if provided
      if (thumbnail) {
        console.log('Uploading thumbnail...', thumbnail.name)
        const fileExt = thumbnail.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('contest-thumbnails')
          .upload(filePath, thumbnail)

        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw uploadError
        }

        const { data: { publicUrl } } = supabase.storage
          .from('contest-thumbnails')
          .getPublicUrl(filePath)

        thumbnailUrl = publicUrl
        console.log('Thumbnail uploaded:', publicUrl)
      }

      // Create contest
      console.log('Inserting contest into database...')
      const { data, error: insertError } = await supabase
        .from('contests')
        .insert({
          title,
          description,
          start_date: new Date(startDate).toISOString(),
          end_date: new Date(endDate).toISOString(),
          thumbnail_url: thumbnailUrl,
          created_by: user.id,
          status: 'draft',
        } as any)
        .select()

      if (insertError) {
        console.error('Insert error:', insertError)
        throw insertError
      }

      console.log('Contest created successfully:', data)
      alert('Contest created successfully!')
      navigate('/admin/contests')
    } catch (err: any) {
      console.error('Error creating contest:', err)
      setError(err.message || 'Failed to create contest')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Create New Contest</h1>

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
          <label className="block text-sm font-medium mb-2">Contest Thumbnail (Optional)</label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleThumbnailChange}
            className="hidden"
            id="thumbnail-upload"
          />
          <label
            htmlFor="thumbnail-upload"
            className="block border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
          >
            {thumbnailPreview ? (
              <div className="space-y-2">
                <img src={thumbnailPreview} alt="Preview" className="max-h-48 mx-auto rounded" />
                <p className="text-sm text-text-secondary">Click to change image</p>
              </div>
            ) : (
              <>
                <p className="text-text-secondary">Click to upload or drag and drop</p>
                <p className="text-xs text-text-secondary mt-1">PNG, JPG, WEBP, GIF up to 5MB</p>
              </>
            )}
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-primary hover:bg-primary-hover rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Contest'}
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
