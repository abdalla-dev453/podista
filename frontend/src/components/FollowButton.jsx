import { UserPlus, UserCheck } from 'lucide-react'
import { useState } from 'react'
import { followUser, unfollowUser } from '../api/profile'

export default function FollowButton({ username, isFollowing, onChange, className = '' }) {
  const [following, setFollowing] = useState(isFollowing)
  const [busy, setBusy] = useState(false)

  const toggle = async () => {
    setBusy(true)
    try {
      if (following) {
        await unfollowUser(username)
        setFollowing(false)
        onChange?.(false)
      } else {
        await followUser(username)
        setFollowing(true)
        onChange?.(true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`${following ? 'btn-ghost' : 'btn-primary'} flex items-center gap-1.5 disabled:opacity-60 ${className}`}
    >
      {following ? <UserCheck size={14} /> : <UserPlus size={14} />}
      {following ? 'Following' : 'Follow'}
    </button>
  )
}