import { Bell, Radio, Heart, Users, ShieldAlert, Mic2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getNotifications,
  getUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notifications'

const ICONS = {
  invite: Users,
  invite_accepted: Users,
  follow: Heart,
  episode: Mic2,
  ban: ShieldAlert,
  unban: ShieldAlert,
  report_actioned: ShieldAlert,
}

export default function NotificationBell({ socket }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const wrapRef = useRef(null)
  const navigate = useNavigate()

  const refresh = () => {
    getUnreadCount().then(setUnread).catch(() => {})
  }

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!socket) return
    const handler = (n) => {
      setItems((prev) => [n, ...prev])
      setUnread((u) => u + 1)
    }
    socket.on('new_notification', handler)
    return () => socket.off('new_notification', handler)
  }, [socket])

  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const handleOpen = async () => {
    const next = !open
    setOpen(next)
    if (next) {
      const data = await getNotifications().catch(() => [])
      setItems(data)
    }
  }

  const handleItemClick = async (n) => {
    if (!n.is_read) {
      markNotificationRead(n.id).catch(() => {})
      setUnread((u) => Math.max(0, u - 1))
    }
    setOpen(false)
    if (n.link) navigate(n.link)
  }

  const handleReadAll = async () => {
    await markAllNotificationsRead().catch(() => {})
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })))
    setUnread(0)
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full text-gray-300 hover:text-white hover:bg-base-card transition-colors"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-brand text-[10px] font-bold flex items-center justify-center text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-base-panel border border-base-border rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in-up">
          <div className="flex items-center justify-between px-4 py-3 border-b border-base-border">
            <p className="text-sm font-semibold">Notifications</p>
            {items.some((n) => !n.is_read) && (
              <button onClick={handleReadAll} className="text-xs text-brand-light hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 && (
              <p className="text-xs text-gray-500 text-center py-8">You're all caught up.</p>
            )}
            {items.map((n) => {
              const Icon = ICONS[n.type] || Radio
              return (
                <button
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-base-border/60 hover:bg-base-card transition-colors ${
                    !n.is_read ? 'bg-brand/5' : ''
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-brand/20 border border-brand/40 flex items-center justify-center text-brand-light shrink-0">
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-200 leading-snug">{n.message}</p>
                    <p className="text-[10px] text-gray-500 mt-1">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!n.is_read && <span className="w-2 h-2 rounded-full bg-brand shrink-0 mt-1.5" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}