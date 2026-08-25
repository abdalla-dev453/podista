import { Search, Radio, User as UserIcon, Mic2, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { globalSearch } from '../api/search'

export default function GlobalSearchBar({ className = '' }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  useEffect(() => {
    if (!q.trim()) {
      setResults(null)
      return
    }
    setLoading(true)
    const timeout = setTimeout(() => {
      globalSearch(q.trim())
        .then((data) => {
          setResults(data)
          setOpen(true)
        })
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timeout)
  }, [q])

  const hasResults =
    results && (results.channels.length || results.users.length || results.episodes.length)

  return (
    <div className={`relative ${className}`} ref={wrapRef}>
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => q && setOpen(true)}
          placeholder="Search channels, creators, episodes..."
          className="w-full bg-base-panel border border-base-border rounded-full pl-10 pr-9 py-2 text-sm text-white outline-none focus:border-brand transition-colors"
        />
        {q && (
          <button
            onClick={() => {
              setQ('')
              setResults(null)
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {open && q && (
        <div className="absolute left-0 right-0 mt-2 bg-base-panel border border-base-border rounded-xl shadow-2xl z-50 overflow-hidden max-h-[70vh] overflow-y-auto animate-fade-in-up">
          {loading && <p className="text-xs text-gray-500 text-center py-6">Searching...</p>}
          {!loading && !hasResults && (
            <p className="text-xs text-gray-500 text-center py-6">No matches for "{q}"</p>
          )}
          {!loading && results?.channels?.length > 0 && (
            <div className="p-2">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 px-2 mb-1">Channels</p>
              {results.channels.map((c) => (
                <button
                  key={`c-${c.id}`}
                  onClick={() => {
                    setOpen(false)
                    navigate(`/channels/${c.id}`)
                  }}
                  className="w-full text-left flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-base-card text-sm"
                >
                  <Radio size={14} className="text-brand-light shrink-0" />
                  <span className="truncate">{c.name}</span>
                </button>
              ))}
            </div>
          )}
          {!loading && results?.users?.length > 0 && (
            <div className="p-2 border-t border-base-border">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 px-2 mb-1">Creators</p>
              {results.users.map((u) => (
                <button
                  key={`u-${u.id}`}
                  onClick={() => {
                    setOpen(false)
                    navigate(`/u/${u.username}`)
                  }}
                  className="w-full text-left flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-base-card text-sm"
                >
                  <UserIcon size={14} className="text-brand-light shrink-0" />
                  <span className="truncate">{u.display_name} <span className="text-gray-500">@{u.username}</span></span>
                </button>
              ))}
            </div>
          )}
          {!loading && results?.episodes?.length > 0 && (
            <div className="p-2 border-t border-base-border">
              <p className="text-[10px] uppercase tracking-wider text-gray-500 px-2 mb-1">Episodes</p>
              {results.episodes.map((e) => (
                <button
                  key={`e-${e.id}`}
                  onClick={() => {
                    setOpen(false)
                    navigate(`/channels/${e.channel_id}`)
                  }}
                  className="w-full text-left flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-base-card text-sm"
                >
                  <Mic2 size={14} className="text-brand-light shrink-0" />
                  <span className="truncate">{e.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}