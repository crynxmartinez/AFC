import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import LandingLayout from './components/layout/LandingLayout'
import AuthLayout from './components/layout/AuthLayout'
import ToastContainer from './components/ui/ToastContainer'
import SoftLaunchModal from './components/modals/SoftLaunchModal'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ConfirmEmail from './pages/auth/ConfirmEmail'
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
import LeaderboardPage from './pages/LeaderboardPage'
import SearchPage from './pages/SearchPage'
import ArtistsPage from './pages/ArtistsPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminContests from './pages/admin/AdminContests'
import AdminCreateContest from './pages/admin/AdminCreateContest'
import AdminEditContest from './pages/admin/AdminEditContest'
import AdminFinalizeContest from './pages/admin/AdminFinalizeContest'
import AdminReviews from './pages/admin/AdminReviews'
import AdminUsers from './pages/admin/AdminUsers'
import AdminXPSystem from './pages/admin/AdminXPSystem'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import TermsOfServicePage from './pages/TermsOfServicePage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import CopyrightPolicyPage from './pages/CopyrightPolicyPage'
import DMCAPage from './pages/DMCAPage'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'

function App() {
  return (
    <Router>
      <ToastContainer />
      <SoftLaunchModal />
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* Email Confirmation (No Layout) */}
        <Route path="/auth/confirm" element={<ConfirmEmail />} />

        {/* Landing/Marketing Pages (No Sidebar) */}
        <Route element={<LandingLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/copyright" element={<CopyrightPolicyPage />} />
          <Route path="/dmca" element={<DMCAPage />} />
        </Route>

        {/* Protected App Pages (Require Login - With Sidebar) */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/contests" element={<ActiveContestsPage />} />
          <Route path="/contests/active" element={<ActiveContestsPage />} />
          <Route path="/contests/:id" element={<ContestDetailPage />} />
          <Route path="/contests/:id/submit" element={<SubmitEntryPage />} />
          <Route path="/entries/:id" element={<EntryDetailPage />} />
          <Route path="/winners" element={<WinnersPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/artists" element={<ArtistsPage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="/users/:username" element={<UserProfilePage />} />
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
          <Route path="/admin/contests/finalize/:id" element={<AdminFinalizeContest />} />
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
