import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/layout/Layout'
import LandingLayout from './components/layout/LandingLayout'
import AuthLayout from './components/layout/AuthLayout'
import ToastContainer from './components/ui/ToastContainer'
import SoftLaunchModal from './components/modals/SoftLaunchModal'
import ProtectedRoute from './components/auth/ProtectedRoute'
import AdminRoute from './components/auth/AdminRoute'
import ErrorBoundary from './components/ErrorBoundary'

// Loading component for lazy loaded pages
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
)

// Eager load critical pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

// Lazy load other pages for better initial bundle size
const ConfirmEmail = lazy(() => import('./pages/auth/ConfirmEmail'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const ContestDetailPage = lazy(() => import('./pages/ContestDetailPage'))
const EntryDetailPage = lazy(() => import('./pages/EntryDetailPage'))
const SubmitEntryPage = lazy(() => import('./pages/SubmitEntryPage'))
const FeedPage = lazy(() => import('./pages/FeedPage'))
const PointsPage = lazy(() => import('./pages/PointsPage'))
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const WinnersPage = lazy(() => import('./pages/WinnersPage'))
const ActiveContestsPage = lazy(() => import('./pages/ActiveContestsPage'))
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'))
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'))
const SearchPage = lazy(() => import('./pages/SearchPage'))
const ArtistsPage = lazy(() => import('./pages/ArtistsPage'))
const ReferralsPage = lazy(() => import('./pages/ReferralsPage'))
const WithdrawalsPage = lazy(() => import('./pages/WithdrawalsPage'))

// Lazy load admin pages (rarely accessed)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminContests = lazy(() => import('./pages/admin/AdminContests'))
const AdminCreateContest = lazy(() => import('./pages/admin/AdminCreateContest'))
const AdminEditContest = lazy(() => import('./pages/admin/AdminEditContest'))
const AdminFinalizeContest = lazy(() => import('./pages/admin/AdminFinalizeContest'))
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminXPSystem = lazy(() => import('./pages/admin/AdminXPSystem'))
const AdminMessages = lazy(() => import('./pages/admin/AdminMessages'))
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'))

// Lazy load legal pages (rarely accessed)
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const TermsOfServicePage = lazy(() => import('./pages/TermsOfServicePage'))
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'))
const CopyrightPolicyPage = lazy(() => import('./pages/CopyrightPolicyPage'))
const DMCAPage = lazy(() => import('./pages/DMCAPage'))

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ToastContainer />
        <SoftLaunchModal />
        <Suspense fallback={<PageLoader />}>
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
            <Route path="/referrals" element={<ReferralsPage />} />
            <Route path="/withdrawals" element={<WithdrawalsPage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<AdminRoute><Layout /></AdminRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/contests" element={<AdminContests />} />
            <Route path="/admin/contests/new" element={<AdminCreateContest />} />
            <Route path="/admin/contests/edit/:id" element={<AdminEditContest />} />
            <Route path="/admin/contests/finalize/:id" element={<AdminFinalizeContest />} />
            <Route path="/admin/reviews" element={<AdminReviews />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/xp-system" element={<AdminXPSystem />} />
            <Route path="/admin/messages" element={<AdminMessages />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
    </ErrorBoundary>
  )
}

export default App
