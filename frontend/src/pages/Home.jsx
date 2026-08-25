import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Compass, Sparkles } from 'lucide-react'
import { io } from 'socket.io-client'
import Sidebar from '../components/Sidebar.jsx'
import ChannelCard from '../components/ChannelCard.jsx'
import InvitationCard from '../components/InvitationCard.jsx'
import AudioPlayerBar from '../components/AudioPlayerBar.jsx'
import GlobalSearchBar from '../components/GlobalSearchBar.jsx'
import NotificationBell from '../components/NotificationBell.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import {
  getJoinedChannels,
  getExploreChannels,
  getInvitations,
  respondInvitation,
  joinChannel,
  leaveChannel,
} from '../api/channels'

const CATEGORIES = ['All', 'Tech', 'Music', 'Design', 'Business', 'Gaming', 'General']

export default function Home() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'joined'
  const [allDbChannels, setAllDbChannels] = useState([])
  const [joinedChannels, setJoinedChannels] = useState([])
  const [invitations, setInvitations] = useState([])
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeAudioStream, setActiveAudioStream] = useState(null)
  const navigate = useNavigate()
  const socketRef = useRef(null)

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] })
    if (user?.id) socket.emit('join_user_room', { user_id: user.id })
    socketRef.current = socket
    return () => socket.disconnect()
  }, [user?.id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [joined, dbCh, inv] = await Promise.all([
        getJoinedChannels(),
        getExploreChannels(category, search),
        getInvitations(),
      ])
      setJoinedChannels(joined || [])
      setAllDbChannels(dbCh || [])
      setInvitations(inv || [])
    } catch (err) {
      console.error('Failed loading home data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [category, search])

  const handleRespond = async (id, action) => {
    await respondInvitation(id, action)
    loadData()
  }

  const handleJoin = async (c) => {
    try {
      await joinChannel(c.id)
      loadData()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to join channel')
    }
  }

  const handleLeave = async (c) => {
    try {
      await leaveChannel(c.id)
      loadData()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to leave channel')
    }
  }

  const handleGoLivePrompt = () => {
    const liveCh = allDbChannels.find((c) => c.is_live) || allDbChannels[0]
    if (liveCh) {
      setActiveAudioStream({
        name: liveCh.name,
        channelName: liveCh.name,
        title: `Live Audio Broadcast on #${liveCh.name}`,
      })
    } else {
      navigate('/channel-management')
    }
  }

  return (
    <div className="app-shell flex flex-col md:flex-row min-h-screen md:min-h-[720px] pb-16 relative">
      <Sidebar activeLabel="Home" onGoLive={handleGoLivePrompt} />

      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
              Welcome Back, {user?.display_name?.split(' ')[0] || ''}
              <Sparkles size={20} className="text-brand-light animate-pulse" />
            </h1>
            <p className="text-gray-500 text-xs md:text-sm">
              Discover and join live audio channels across PodClub.
            </p>
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <GlobalSearchBar className="w-56 hidden sm:block" />
            <NotificationBell socket={socketRef.current} />
            <button
              onClick={() => navigate('/channel-management')}
              className="btn-primary shadow-md shadow-brand/20 whitespace-nowrap"
            >
              + Create New Channel
            </button>
          </div>
        </div>

        {invitations.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
              Pending Invitations <span className="text-brand-light">({invitations.length})</span>
            </h2>
            <div className="space-y-3">
              {invitations.map((inv) => (
                <InvitationCard
                  key={inv.id}
                  invitation={inv}
                  onAccept={() => handleRespond(inv.id, 'accept')}
                  onDecline={() => handleRespond(inv.id, 'decline')}
                />
              ))}
            </div>
          </section>
        )}

        {/* Tab Headers */}
        <div className="flex items-center justify-between border-b border-base-border mb-5">
          <div className="flex gap-4 md:gap-6 text-xs md:text-sm font-semibold">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-3 flex items-center gap-1.5 transition-colors ${
                activeTab === 'all'
                  ? 'border-b-2 border-brand text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Compass size={16} /> All Database Channels ({allDbChannels.length})
            </button>
            <button
              onClick={() => setActiveTab('joined')}
              className={`pb-3 transition-colors ${
                activeTab === 'joined'
                  ? 'border-b-2 border-brand text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              Joined Channels ({joinedChannels.length})
            </button>
          </div>
        </div>

        {/* Filter & Search Bar for Database Channels */}
        <div className="space-y-3 mb-6">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search all channels in database..."
              className="w-full bg-base-panel border border-base-border rounded-xl pl-10 pr-4 py-2 text-sm text-white outline-none focus:border-brand transition-colors"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-xs px-3.5 py-1.5 rounded-full transition-colors whitespace-nowrap font-medium cursor-pointer ${
                  category === cat
                    ? 'bg-brand text-white'
                    : 'bg-base-panel border border-base-border text-gray-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-gray-500 text-xs text-center py-12">Loading channels from database...</div>
        ) : activeTab === 'all' ? (
          /* ALL DATABASE CHANNELS (DISPLAYED FIRST) */
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {allDbChannels.map((c) => (
                <ChannelCard
                  key={c.id}
                  channel={c}
                  onClick={() => navigate(`/channels/${c.id}`)}
                  onJoin={handleJoin}
                  onLeave={handleLeave}
                  onListenLive={(ch) =>
                    setActiveAudioStream({
                      name: ch.name,
                      channelName: ch.name,
                      title: `Live Audio Stream on #${ch.name}`,
                    })
                  }
                />
              ))}
              {allDbChannels.length === 0 && (
                <div className="col-span-3 text-center py-12 text-gray-500 text-xs">
                  No channels match your search criteria.
                </div>
              )}
            </div>
          </section>
        ) : (
          /* JOINED CHANNELS ONLY */
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {joinedChannels.map((c) => (
                <ChannelCard
                  key={c.id}
                  channel={c}
                  onClick={() => navigate(`/channels/${c.id}`)}
                  onListenLive={(ch) =>
                    setActiveAudioStream({
                      name: ch.name,
                      channelName: ch.name,
                      title: `Live Audio Stream on #${ch.name}`,
                    })
                  }
                />
              ))}
              {joinedChannels.length === 0 && (
                <div className="col-span-3 text-center py-12 text-gray-500 text-xs">
                  You haven't joined any channels yet. Switch to "All Database Channels" above to join!
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Floating Audio Player Bar */}
      {activeAudioStream && (
        <AudioPlayerBar
          stream={activeAudioStream}
          onClose={() => setActiveAudioStream(null)}
        />
      )}
    </div>
  )
}