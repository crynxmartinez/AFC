// @ts-nocheck
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Camera, X, Trash2 } from 'lucide-react'
import { useToastStore } from '@/stores/toastStore'
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
  const toast = useToastStore()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !user) return

    const file = e.target.files[0]
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
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
      // @ts-ignore - Supabase type inference issue with cover_photo_url
      const { error: updateError } = await supabase
        .from('users')
        .update({ cover_photo_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      onUpdate?.()
      toast.success('Cover photo updated!')
    } catch (error) {
      console.error('Error uploading cover photo:', error)
      toast.error('Failed to upload cover photo')
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
      toast.success('Cover photo removed')
    } catch (error) {
      console.error('Error removing cover photo:', error)
      toast.error('Failed to remove cover photo')
    } finally {
      setUploading(false)
    }
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

      {/* Change Cover Button (only for own profile, hidden until hover) */}
      {isOwnProfile && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <label className="px-6 py-3 bg-surface/95 hover:bg-surface text-text-primary rounded-lg transition-colors cursor-pointer flex items-center gap-2 shadow-lg">
              <Camera className="w-5 h-5" />
              {uploading ? 'Uploading...' : coverPhotoUrl ? 'Change Cover Photo' : 'Add Cover Photo'}
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            
            {coverPhotoUrl && (
              <button
                onClick={() => setShowRemoveConfirm(true)}
                disabled={uploading}
                className="px-4 py-3 bg-error/90 hover:bg-error text-white rounded-lg transition-colors flex items-center gap-2 shadow-lg disabled:opacity-50"
                title="Remove cover photo"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
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
