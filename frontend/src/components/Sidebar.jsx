import { useState } from 'react'
import { Home, PlusCircle, LayoutDashboard, Settings, Radio, LogOut, Menu, X, ShieldCheck } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ProfileModal from './ProfileModal.jsx'

const navItem = (to, icon, label, adminOnly = false) => ({ to, icon, label, adminOnly })

const NAV_ITEMS = [
  navItem('/home', Home, 'Home'),
  navItem('/channel-management', PlusCircle, 'Create Channel'),
  navItem('/channel-management', Settings, 'Channel Management'),
  navItem('/admin', LayoutDashboard, 'Admin Dashboard', true),
]

export default function Sidebar({ activeLabel, onGoLive }) {
  const { user, logout, loginWithToken } = useAuth()
  const [showProfile, setShowProfile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const NavContent = (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="mb-6 px-2 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-brand-light flex items-center gap-2">
              PodClub
              {user?.is_platform_admin && (
                <span className="text-[10px] bg-brand-light/20 text-brand-light px-2 py-0.5 rounded-full font-medium">
                  ADMIN
                </span>
              )}
            </h1>
            <p className="text-xs text-gray-500">Backstage Audio Access</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-gray-400 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.filter((item) => !item.adminOnly || user?.is_platform_admin).map((item) => {
            const Icon = item.icon
            const isActive = item.label === activeLabel
            return (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>

        <button
          onClick={() => {
            setMobileOpen(false)
            if (onGoLive) onGoLive()
          }}
          className="btn-primary flex items-center justify-center gap-2 mt-6 w-full cursor-pointer shadow-lg shadow-brand/20 hover:scale-[1.02] transition-transform"
        >
          <Radio size={16} className="animate-pulse text-emerald-300" /> Go Live
        </button>
      </div>

      {user && (
        <div className="pt-4 border-t border-base-border flex items-center justify-between">
          <button
            onClick={() => {
              setMobileOpen(false)
              setShowProfile(true)
            }}
            className="flex items-center gap-2 overflow-hidden text-left hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-brand/30 border border-brand/60 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user.display_name?.[0] || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold truncate text-white">{user.display_name}</p>
              <p className="text-[10px] text-gray-400 truncate">@{user.username}</p>
            </div>
          </button>
          <button
            onClick={logout}
            title="Logout"
            className="text-gray-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-base-card transition-colors shrink-0"
          >
            <LogOut size={16} />
          </button>
        </div>
      )}
    </div>
  )

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden w-full bg-base-panel border-b border-base-border px-4 py-3 flex items-center justify-between shrink-0">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 text-gray-300 hover:text-white rounded-lg bg-base-card border border-base-border"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-base font-bold text-brand-light">PodClub</h1>
        {user ? (
          <button
            onClick={() => setShowProfile(true)}
            className="w-7 h-7 rounded-full bg-brand/30 border border-brand/60 flex items-center justify-center text-xs font-bold text-white"
          >
            {user.display_name?.[0] || 'U'}
          </button>
        ) : (
          <div className="w-7" />
        )}
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div className="relative z-10 w-72 max-w-[80vw] bg-base-panel h-full p-4 border-r border-base-border shadow-2xl">
            {NavContent}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 border-r border-base-border bg-base-panel p-4 flex-col justify-between">
        {NavContent}
      </aside>

      {showProfile && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfile(false)}
          onUpdated={(updatedUser) => {
            const token = localStorage.getItem('podclub_token')
            loginWithToken(token, updatedUser)
          }}
        />
      )}
    </>
  )
}