// @ts-nocheck - Supabase type inference issues
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { supabase } from '@/lib/supabase'
import { Camera, Save, Loader } from 'lucide-react'

type Tab = 'profile' | 'account' | 'notifications' | 'privacy'

export default function SettingsPage() {
  const { user, profile, fetchProfile } = useAuthStore()
  const [activeTab, setActiveTab] = useState<Tab>('profile')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Profile form
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [twitterUrl, setTwitterUrl] = useState('')
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  // Account form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Notification preferences
  const [notifyReactions, setNotifyReactions] = useState(true)
  const [notifyComments, setNotifyComments] = useState(true)
  const [notifyArtistContests, setNotifyArtistContests] = useState(true)
  const [notifyFollows, setNotifyFollows] = useState(true)

  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private'>('public')
  const [showContestsJoined, setShowContestsJoined] = useState(true)
  const [showContestsWon, setShowContestsWon] = useState(true)

  useEffect(() => {
    if (profile) {
      setUsername(profile.username || '')
      setBio(profile.bio || '')
      setDisplayName(profile.display_name || '')
      setInstagramUrl(profile.instagram_url || '')
      setTwitterUrl(profile.twitter_url || '')
      setPortfolioUrl(profile.portfolio_url || '')
      setAvatarPreview(profile.avatar_url || null)
      setProfileVisibility(profile.profile_visibility || 'public')
      setNotifyReactions(profile.notify_reactions ?? true)
      setNotifyFollows(profile.notify_follows ?? true)
      setNotifyComments(profile.notify_comments ?? true)
      setNotifyArtistContests(profile.notify_artist_contests ?? true)
      setShowContestsJoined(profile.show_contests_joined ?? true)
      setShowContestsWon(profile.show_contests_won ?? true)
    }
  }, [profile])

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setMessage('')

    try {
      let avatarUrl = profile?.avatar_url

      // Upload avatar if changed
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `${user.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('user-avatars')
          .upload(filePath, avatarFile, { upsert: true })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('user-avatars')
          .getPublicUrl(filePath)

        avatarUrl = publicUrl
      }

      // Update profile
      const { error } = await supabase
        .from('users')
        .update({
          username,
          bio,
          display_name: displayName,
          instagram_url: instagramUrl,
          twitter_url: twitterUrl,
          portfolio_url: portfolioUrl,
          avatar_url: avatarUrl,
        } as any)
        .eq('id', user.id)

      if (error) throw error

      await fetchProfile()
      setMessage('Profile updated successfully!')
      setAvatarFile(null)
    } catch (error: any) {
      setMessage('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match')
      return
    }

    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      setMessage('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      setMessage('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleNotificationsUpdate = async () => {
    if (!user) return

    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('users')
        .update({
          notify_reactions: notifyReactions,
          notify_comments: notifyComments,
          notify_artist_contests: notifyArtistContests,
          notify_follows: notifyFollows,
        } as any)
        .eq('id', user.id)

      if (error) throw error

      await fetchProfile()
      setMessage('Notification preferences updated!')
    } catch (error: any) {
      setMessage('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePrivacyUpdate = async () => {
    if (!user) return

    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('users')
        .update({
          profile_visibility: profileVisibility,
          show_contests_joined: showContestsJoined,
          show_contests_won: showContestsWon,
        } as any)
        .eq('id', user.id)

      if (error) throw error

      await fetchProfile()
      setMessage('Privacy settings updated!')
    } catch (error: any) {
      setMessage('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'profile' as Tab, label: 'Profile' },
    { id: 'account' as Tab, label: 'Account' },
    { id: 'notifications' as Tab, label: 'Notifications' },
    { id: 'privacy' as Tab, label: 'Privacy' },
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id)
              setMessage('')
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-primary border-b-2 border-primary'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.includes('Error') ? 'bg-error/20 text-error' : 'bg-success/20 text-success'
        }`}>
          {message}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileUpdate} className="space-y-6">
          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Profile Picture</label>
            <div className="flex items-center gap-6">
              <div className="relative">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-2xl font-bold">
                    {username[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-primary hover:bg-primary-hover p-2 rounded-full cursor-pointer transition-colors">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div className="text-sm text-text-secondary">
                <p>Click the camera icon to upload a new profile picture</p>
                <p>JPG, PNG or GIF. Max 5MB.</p>
              </div>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              required
            />
          </div>

          {/* Display Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Display Name (Optional)</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              placeholder="Your full name"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h3 className="font-semibold">Social Links</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Instagram</label>
              <input
                type="url"
                value={instagramUrl}
                onChange={(e) => setInstagramUrl(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                placeholder="https://instagram.com/yourusername"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Twitter/X</label>
              <input
                type="url"
                value={twitterUrl}
                onChange={(e) => setTwitterUrl(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                placeholder="https://twitter.com/yourusername"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Portfolio</label>
              <input
                type="url"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                placeholder="https://yourportfolio.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </form>
      )}

      {/* Account Tab */}
      {activeTab === 'account' && (
        <div className="space-y-8">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <h3 className="font-semibold text-lg">Change Password</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </form>

          <div className="border-t border-border pt-8">
            <h3 className="font-semibold text-lg text-error mb-2">Danger Zone</h3>
            <p className="text-text-secondary text-sm mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button className="px-6 py-3 bg-error hover:bg-error/80 rounded-lg font-medium transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between py-4 border-b border-border">
            <div>
              <h3 className="font-medium">Reaction Notifications</h3>
              <p className="text-sm text-text-secondary">Get notified when someone reacts to your entries</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifyReactions}
                onChange={(e) => setNotifyReactions(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-4 border-b border-border">
            <div>
              <h3 className="font-medium">Comment Notifications</h3>
              <p className="text-sm text-text-secondary">Get notified when someone comments on your entries</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifyComments}
                onChange={(e) => setNotifyComments(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-4 border-b border-border">
            <div>
              <h3 className="font-medium">Followed Artists</h3>
              <p className="text-sm text-text-secondary">Get notified when followed artists join contests</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifyArtistContests}
                onChange={(e) => setNotifyArtistContests(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-4 border-b border-border">
            <div>
              <h3 className="font-medium">New Followers</h3>
              <p className="text-sm text-text-secondary">Get notified when someone follows you</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifyFollows}
                onChange={(e) => setNotifyFollows(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <button
            onClick={handleNotificationsUpdate}
            disabled={loading}
            className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Preferences
              </>
            )}
          </button>
        </div>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-4">Profile Visibility</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={profileVisibility === 'public'}
                  onChange={(e) => setProfileVisibility(e.target.value as 'public')}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-medium">Public</p>
                  <p className="text-sm text-text-secondary">Anyone can see your profile and entries</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={profileVisibility === 'private'}
                  onChange={(e) => setProfileVisibility(e.target.value as 'private')}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-medium">Private</p>
                  <p className="text-sm text-text-secondary">Only you can see your profile</p>
                </div>
              </label>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-4">Profile Stats Display</h3>
            <p className="text-sm text-text-secondary mb-4">Choose what stats to show on your public profile</p>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                <div>
                  <p className="font-medium">Show Contests Joined</p>
                  <p className="text-sm text-text-secondary">Display total number of contests you've participated in</p>
                </div>
                <input
                  type="checkbox"
                  checked={showContestsJoined}
                  onChange={(e) => setShowContestsJoined(e.target.checked)}
                  className="w-5 h-5"
                />
              </label>

              <label className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                <div>
                  <p className="font-medium">Show Contests Won</p>
                  <p className="text-sm text-text-secondary">Display total number of contests you've won (top 3)</p>
                </div>
                <input
                  type="checkbox"
                  checked={showContestsWon}
                  onChange={(e) => setShowContestsWon(e.target.checked)}
                  className="w-5 h-5"
                />
              </label>
            </div>
          </div>

          <button
            onClick={handlePrivacyUpdate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Privacy Settings
              </>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
