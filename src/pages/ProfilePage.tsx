import { useParams, Navigate } from 'react-router-dom'

// This page just redirects to UserProfilePage
// Keeping it for backward compatibility with /profile/:username routes
export default function ProfilePage() {
  const { username } = useParams()
  
  // Redirect to the new user profile page
  return <Navigate to={`/users/${username}`} replace />
}
