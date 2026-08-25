import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import Landing from './pages/Landing.jsx'
import AuthPage from './pages/AuthPage.jsx'
import Home from './pages/Home.jsx'
import Explore from './pages/Explore.jsx'
import Profile from './pages/Profile.jsx'
import ChannelChat from './pages/ChannelChat.jsx'
import ChannelManagement from './pages/ChannelManagement.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-gray-400 text-sm">
        Loading...
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-gray-400 text-sm">
        Loading...
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  if (!user.is_platform_admin) return <Navigate to="/home" replace />
  return children
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-gray-400 text-sm">
        Loading...
      </div>
    )
  }
  if (user) return <Navigate to="/home" replace />
  return children
}

function RootRoute() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-gray-400 text-sm">
        Loading...
      </div>
    )
  }
  if (user) return <Navigate to="/home" replace />
  return <Landing />
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<RootRoute />} />
        <Route path="/login" element={<PublicRoute><AuthPage /></PublicRoute>} />
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/explore" element={<ProtectedRoute><Explore /></ProtectedRoute>} />
        <Route path="/u/:username" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/channels/:channelId" element={<ProtectedRoute><ChannelChat /></ProtectedRoute>} />
        <Route path="/channel-management" element={<ProtectedRoute><ChannelManagement /></ProtectedRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </AuthProvider>
  )
}