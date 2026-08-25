import { Bookmark, Compass, Flame, Radio, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import Sidebar from '../components/Sidebar.jsx'
import ChannelCard from '../components/ChannelCard.jsx'
import EpisodeCard from '../components/EpisodeCard.jsx'
import AudioPlayerBar from '../components/AudioPlayerBar.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getExploreChannels, joinChannel, leaveChannel } from '../api/channels'
import { getTrendingEpisodes, playEpisode } from '../api/episodes'
import { getBookmarks, addBookmark, removeBookmark } from '../api/bookmarks'

const CATEGORIES = ['All', 'Tech', 'Music', 'Design', 'Business', 'Gaming', 'General']
const TABS = [
  { id: 'trending', label: 'Trending Episodes', icon: Flame },
  { id: 'channels', label: 'Browse Channels', icon: Compass },
  { id: 'saved', label: 'Saved', icon: Bookmark },
]

export default function Explore() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('trending')
  const [category, setCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [channels, setChannels] = useState([])
  const [episodes, setEpisodes] = useState([])
  const [saved, setSaved] = useState([])
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set())
  const [loading, setLoading] = useState(true)
  const [activeStream, setActiveStream] = useState(null)
  const [playingEpisode, setPlayingEpisode] = useState(null)
  const audioRef = useRef(null)
  const socketRef = useRef(null)

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin
    const socket = io(socketUrl, { transports: ['websocket', 'polling'] })
    if (user?.id) socket.emit('join_user_room', { user_id: user.id })
    socketRef.current = socket
    return () => socket.disconnect()
  }, [user?.id])

  const loadSaved = () => {
    getBookmarks().then((data) => {
      setSaved(data || [])
      setBookmarkedIds(new Set((data || []).map((e) => e.id)))
    }).catch(() => {})
  }

  useEffect(() => {
    setLoading(true)
    if (tab === 'channels') {
      getExploreChannels(category, search).then(setChannels).finally(() => setLoading(false))
    } else if (tab === 'trending') {
      getTrendingEpisodes().then(setEpisodes).finally(() => setLoading(false))
      loadSaved()
    } else {
      loadSaved()
      setLoading(false)
    }
  }, [tab, category, search])

  const handleJoin = async (c) => {
    try {
      await joinChannel(c.id)
      setChannels((prev) => prev.map((ch) => (ch.id === c.id ? { ...ch, is_joined: true } : ch)))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to join channel')
    }
  }

  const handleLeave = async (c) => {
    try {
      await leaveChannel(c.id)
      setChannels((prev) => prev.map((ch) => (ch.id === c.id ? { ...ch, is_joined: false } : ch)))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to leave channel')
    }
  }

  const handlePlayEpisode = (episode) => {
    if (playingEpisode?.id === episode.id) {
      if (audioRef.current?.paused) audioRef.current.play()
      else audioRef.current?.pause()
      return
    }
    setPlayingEpisode(episode)
    playEpisode(episode.id).catch(() => {})
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.src = episode.audio_url
        audioRef.current.play().catch(() => {})
      }
    }, 0)
  }

  const handleToggleBookmark = async (episode) => {
    const isSaved = bookmarkedIds.has(episode.id)
    try {
      if (isSaved) {
        await removeBookmark(episode.id)
        setBookmarkedIds((prev) => {
          const next = new Set(prev)
          next.delete(episode.id)
          return next
        })
        setSaved((prev) => prev.filter((e) => e.id !== episode.id))
      } else {
        await addBookmark(episode.id)
        setBookmarkedIds((prev) => new Set(prev).add(episode.id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="app-shell flex flex-col md:flex-row min-h-screen md:min-h-[720px] pb-16 relative">
      <Sidebar activeLabel="Explore" />

      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Compass size={22} className="text-brand-light" /> Explore
          </h1>
          <p className="text-gray-500 text-xs md:text-sm">
            Trending episodes, public channels, and everything you've saved.
          </p>
        </div>

        <div className="flex items-center gap-4 border-b border-base-border mb-5 text-xs md:text-sm font-semibold overflow-x-auto scrollbar-none">
          {TABS.map((t) => {
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`pb-3 flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                  tab === t.id ? 'border-b-2 border-brand text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon size={14} /> {t.label}
              </button>
            )
          })}
        </div>

        {tab === 'channels' && (
          <div className="space-y-3 mb-6">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search public channels..."
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
        )}

        {loading ? (
          <div className="text-gray-500 text-xs text-center py-12">Loading...</div>
        ) : tab === 'channels' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {channels.map((c) => (
              <ChannelCard
                key={c.id}
                channel={c}
                onClick={() => navigate(`/channels/${c.id}`)}
                onJoin={handleJoin}
                onLeave={handleLeave}
                onListenLive={(ch) =>
                  setActiveStream({ name: ch.name, channelName: ch.name, title: `Live Audio Stream on #${ch.name}` })
                }
              />
            ))}
            {channels.length === 0 && (
              <div className="col-span-3 text-center py-12 text-gray-500 text-xs">
                No channels match your search criteria.
              </div>
            )}
          </div>
        ) : tab === 'trending' ? (
          <div className="space-y-3 max-w-2xl">
            {episodes.map((ep) => (
              <EpisodeCard
                key={ep.id}
                episode={ep}
                showChannel
                isPlaying={playingEpisode?.id === ep.id}
                onPlay={handlePlayEpisode}
                isBookmarked={bookmarkedIds.has(ep.id)}
                onToggleBookmark={handleToggleBookmark}
              />
            ))}
            {episodes.length === 0 && (
              <div className="text-center py-12 text-gray-500 text-xs">
                No episodes published yet — be the first to publish one from your channel.
              </div>
            )}
            <audio ref={audioRef} className="hidden" />
          </div>
        ) : (
          <div className="space-y-3 max-w-2xl">
            {saved.map((ep) => (
              <EpisodeCard
                key={ep.id}
                episode={ep}
                showChannel
                isPlaying={playingEpisode?.id === ep.id}
                onPlay={handlePlayEpisode}
                isBookmarked
                onToggleBookmark={handleToggleBookmark}
              />
            ))}
            {saved.length === 0 && (
              <div className="text-center py-12 text-gray-500 text-xs">
                Nothing saved yet — bookmark episodes from Trending to listen later.
              </div>
            )}
            <audio ref={audioRef} className="hidden" />
          </div>
        )}
      </main>

      {activeStream && <AudioPlayerBar stream={activeStream} onClose={() => setActiveStream(null)} />}
    </div>
  )
}