import { useState, useRef, useEffect } from 'react'
import { usersApi } from '@/lib/api'
import { Camera, X, Link2, Check, Loader } from 'lucide-react'
import { useToastStore } from '@/stores/toastStore'
import { useAuthStore } from '@/stores/authStore'

type Props = {
  coverPhotoUrl?: string | null
  userId: string
  isOwnProfile: boolean
  onUpdate?: () => void
}

export default function ProfileBanner({ coverPhotoUrl, isOwnProfile, onUpdate }: Props) {
  const { user } = useAuthStore()
  const [saving, setSaving] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [urlValue, setUrlValue] = useState('')
  const [urlError, setUrlError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const toast = useToastStore()

  useEffect(() => {
    if (showUrlInput && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showUrlInput])

  const handleSaveUrl = async () => {
    if (!user || !urlValue.trim()) return

    setSaving(true)
    setUrlError(false)

    try {
      await usersApi.updateCoverPhoto(urlValue.trim())
      onUpdate?.()
      toast.success('Cover photo updated!')
      setShowUrlInput(false)
      setUrlValue('')
    } catch (error) {
      console.error('Error updating cover photo:', error)
      toast.error('Failed to update cover photo')
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async () => {
    if (!user || !coverPhotoUrl) return

    setSaving(true)

    try {
      await usersApi.updateCoverPhoto('')
      setShowRemoveConfirm(false)
      onUpdate?.()
      toast.success('Cover photo removed')
    } catch (error) {
      console.error('Error removing cover photo:', error)
      toast.error('Failed to remove cover photo')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setShowUrlInput(false)
    setUrlValue('')
    setUrlError(false)
  }

  return (
    <div className="relative w-full h-64 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 overflow-hidden group">
      {/* Cover Photo */}
      {coverPhotoUrl ? (
        <img
          src={coverPhotoUrl}
          alt="Cover"
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/20 to-secondary/30" />
      )}

      {/* Hover overlay with action buttons */}
      {isOwnProfile && !showUrlInput && !showRemoveConfirm && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowUrlInput(true)}
              disabled={saving}
              className="px-6 py-3 bg-surface/95 hover:bg-surface text-text-primary rounded-lg transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              <Camera className="w-5 h-5" />
              {coverPhotoUrl ? 'Change Cover Photo' : 'Add Cover Photo'}
            </button>
            
            {coverPhotoUrl && (
              <button
                onClick={() => setShowRemoveConfirm(true)}
                disabled={saving}
                className="px-4 py-3 bg-error/90 hover:bg-error text-white rounded-lg transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50"
                title="Remove cover photo"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* URL Input Overlay */}
      {showUrlInput && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 p-4">
          <div className="bg-surface rounded-xl p-6 w-full max-w-lg shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Cover Photo URL</h3>
              <button onClick={handleCancel} className="p-1.5 hover:bg-background rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Link2 className="w-4 h-4 text-text-secondary" />
                </div>
                <input
                  ref={inputRef}
                  type="url"
                  value={urlValue}
                  onChange={(e) => { setUrlValue(e.target.value); setUrlError(false) }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveUrl(); if (e.key === 'Escape') handleCancel() }}
                  placeholder="https://example.com/cover-image.jpg"
                  className="w-full pl-10 pr-10 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all text-sm"
                />
                {urlValue && (
                  <button
                    type="button"
                    onClick={() => { setUrlValue(''); setUrlError(false) }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Image preview */}
              {urlValue.trim() && !urlError && (
                <div className="border border-border rounded-lg p-2 bg-background">
                  <img
                    src={urlValue.trim()}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded"
                    onError={() => setUrlError(true)}
                  />
                </div>
              )}
              {urlError && (
                <p className="text-xs text-error">Could not load image. Please check the URL.</p>
              )}
              <p className="text-xs text-text-secondary">Paste a direct link to a banner image (JPG, PNG, WebP)</p>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2.5 bg-background hover:bg-border rounded-lg transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUrl}
                  disabled={saving || !urlValue.trim() || urlError}
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover rounded-lg transition-colors text-sm font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {showRemoveConfirm && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10 p-4">
          <div className="bg-surface rounded-xl p-6 max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold mb-2">Remove Cover Photo?</h3>
            <p className="text-text-secondary mb-4 text-sm">
              Are you sure you want to remove your cover photo?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-background hover:bg-border rounded-lg transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                disabled={saving}
                className="flex-1 px-4 py-2.5 bg-error hover:bg-error/90 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2"
              >
                {saving ? <Loader className="w-4 h-4 animate-spin" /> : null}
                {saving ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
