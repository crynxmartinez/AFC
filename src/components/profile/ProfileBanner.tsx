import { useState } from 'react'
import { Camera, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/authStore'

type Props = {
  coverPhotoUrl?: string | null
  userId: string
  isOwnProfile: boolean
  onUpdate?: () => void
}

export default function ProfileBanner({ coverPhotoUrl, userId, isOwnProfile, onUpdate }: Props) {
  const { user } = useAuthStore()
  const [uploading, setUploading] = useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return

    const file = e.target.files[0]
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }

    setUploading(true)

    try {
      // Delete old cover photo if exists
      if (coverPhotoUrl) {
        const oldPath = coverPhotoUrl.split('/').pop()
        if (oldPath) {
          await supabase.storage
            .from('cover-photos')
            .remove([`${user.id}/${oldPath}`])
        }
      }

      // Upload new cover photo
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('cover-photos')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('cover-photos')
        .getPublicUrl(filePath)

      // Update user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({ cover_photo_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      onUpdate?.()
    } catch (error) {
      console.error('Error uploading cover photo:', error)
      alert('Failed to upload cover photo')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    if (!user || !coverPhotoUrl) return

    setUploading(true)

    try {
      // Delete from storage
      const oldPath = coverPhotoUrl.split('/').pop()
      if (oldPath) {
        await supabase.storage
          .from('cover-photos')
          .remove([`${user.id}/${oldPath}`])
      }

      // Update user profile
      const { error } = await supabase
        .from('users')
        .update({ cover_photo_url: null })
        .eq('id', user.id)

      if (error) throw error

      setShowRemoveConfirm(false)
      onUpdate?.()
    } catch (error) {
      console.error('Error removing cover photo:', error)
      alert('Failed to remove cover photo')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="relative w-full h-64 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 overflow-hidden">
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

      {/* Upload/Remove Buttons (only for own profile) */}
      {isOwnProfile && (
        <div className="absolute top-4 right-4 flex gap-2">
          {coverPhotoUrl && (
            <button
              onClick={() => setShowRemoveConfirm(true)}
              disabled={uploading}
              className="px-4 py-2 bg-error hover:bg-error/90 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <X className="w-4 h-4" />
              Remove
            </button>
          )}
          
          <label className="px-4 py-2 bg-surface/90 hover:bg-surface text-text-primary rounded-lg transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50">
            <Camera className="w-4 h-4" />
            {uploading ? 'Uploading...' : coverPhotoUrl ? 'Change Cover' : 'Add Cover'}
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {showRemoveConfirm && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <div className="bg-surface rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-bold mb-2">Remove Cover Photo?</h3>
            <p className="text-text-secondary mb-4">
              Are you sure you want to remove your cover photo?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowRemoveConfirm(false)}
                className="flex-1 px-4 py-2 bg-background hover:bg-border rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-error hover:bg-error/90 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {uploading ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
