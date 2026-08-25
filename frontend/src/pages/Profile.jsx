import { Mic2, Radio, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import ChannelCard from '../components/ChannelCard.jsx'
import FollowButton from '../components/FollowButton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { getPublicProfile } from '../api/profile'

export default function Profile() {
  const { username } = useParams()
  const { user: me } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    getPublicProfile(username)
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [username])

  return (
    <div className="app-shell flex flex-col md:flex-row min-h-screen md:min-h-[720px] pb-16 relative">
      <Sidebar activeLabel="" />

      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        {loading ? (
          <div className="text-gray-500 text-xs text-center py-12">Loading profile...</div>
        ) : !profile ? (
          <div className="text-gray-500 text-xs text-center py-12">Couldn't find @{username}.</div>
        ) : (
          <>
            <div className="card-elevated p-5 mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-brand/30 border border-brand/60 flex items-center justify-center text-xl font-bold text-white shrink-0">
                {profile.display_name?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold font-display truncate">{profile.display_name}</h1>
                <p className="text-sm text-gray-500">@{profile.username}</p>
                {profile.bio && <p className="text-sm text-gray-300 mt-2 leading-relaxed">{profile.bio}</p>}
                <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                  <span><span className="text-white font-semibold">{profile.followers_count}</span> followers</span>
                  <span><span className="text-white font-semibold">{profile.following_count}</span> following</span>
                  <span className="flex items-center gap-1">
                    <Mic2 size={12} /> <span className="text-white font-semibold">{profile.episode_count}</span> episodes
                  </span>
                </div>
              </div>
              {!profile.is_self && (
                <FollowButton
                  username={profile.username}
                  isFollowing={profile.is_following}
                  className="self-start sm:self-center"
                />
              )}
            </div>

            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
              <Radio size={12} /> Channels by {profile.display_name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.channels?.map((c) => (
                <ChannelCard key={c.id} channel={c} onClick={() => navigate(`/channels/${c.id}`)} />
              ))}
              {(!profile.channels || profile.channels.length === 0) && (
                <div className="col-span-3 text-center py-10 text-gray-500 text-xs flex flex-col items-center gap-2">
                  <Users size={20} className="text-gray-600" />
                  No public channels yet.
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}