import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import AuthLayout from './components/layout/AuthLayout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProfilePage from './pages/ProfilePage'
import ContestDetailPage from './pages/ContestDetailPage'
import EntryDetailPage from './pages/EntryDetailPage'
import SubmitEntryPage from './pages/SubmitEntryPage'
import FeedPage from './pages/FeedPage'
import PointsPage from './pages/PointsPage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'
import WinnersPage from './pages/WinnersPage'
import ActiveContestsPage from './pages/ActiveContestsPage'
import UserProfilePage from './pages/UserProfilePage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminContests from './pages/admin/AdminContests'
import AdminCreateContest from './pages/admin/AdminCreateContest'
import AdminEditContest from './pages/admin/AdminEditContest'
import AdminReviews from './pages/admin/AdminReviews'
import AdminUsers from './pages/admin/AdminUsers'
import AdminXPSystem from './pages/admin/AdminXPSystem'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* Public Routes */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/contests/active" element={<ActiveContestsPage />} />
          <Route path="/winners" element={<WinnersPage />} />
          <Route path="/contests/:id" element={<ContestDetailPage />} />
          <Route path="/entries/:id" element={<EntryDetailPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/users/:username" element={<UserProfilePage />} />
        </Route>

        {/* Protected User Routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/contests/:id/submit" element={<SubmitEntryPage />} />
          <Route path="/points" element={<PointsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<AdminRoute><Layout /></AdminRoute>}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/contests" element={<AdminContests />} />
          <Route path="/admin/contests/new" element={<AdminCreateContest />} />
          <Route path="/admin/contests/edit/:id" element={<AdminEditContest />} />
          <Route path="/admin/reviews" element={<AdminReviews />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/xp-system" element={<AdminXPSystem />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
