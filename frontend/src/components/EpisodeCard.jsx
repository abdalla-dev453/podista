import { Play, Pause, Bookmark, BookmarkCheck, Headphones, Trash2 } from 'lucide-react'

function formatDuration(seconds) {
  if (!seconds) return null
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function EpisodeCard({
  episode,
  isPlaying,
  onPlay,
  onToggleBookmark,
  isBookmarked,
  onDelete,
  canDelete,
  showChannel,
}) {
  return (
    <div className="card-elevated p-3.5 flex items-center gap-3.5">
      <button
        onClick={() => onPlay?.(episode)}
        className="w-12 h-12 rounded-xl bg-brand/20 border border-brand/50 flex items-center justify-center text-brand-light shrink-0 hover:bg-brand/30 transition-colors"
      >
        {isPlaying ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
      </button>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold truncate">{episode.title}</p>
        {showChannel && episode.channel && (
          <p className="text-xs text-brand-light truncate">#{episode.channel.name}</p>
        )}
        {episode.description && (
          <p className="text-xs text-gray-500 truncate mt-0.5">{episode.description}</p>
        )}
        <div className="flex items-center gap-3 mt-1 text-[10px] text-gray-500">
          {formatDuration(episode.duration_seconds) && <span>{formatDuration(episode.duration_seconds)}</span>}
          <span className="flex items-center gap-1">
            <Headphones size={10} /> {episode.plays_count || 0} plays
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {onToggleBookmark && (
          <button
            onClick={() => onToggleBookmark(episode)}
            className="p-2 text-gray-400 hover:text-brand-light rounded-lg hover:bg-base-panel transition-colors"
            title={isBookmarked ? 'Remove from saved' : 'Save for later'}
          >
            {isBookmarked ? <BookmarkCheck size={16} className="text-brand-light" /> : <Bookmark size={16} />}
          </button>
        )}
        {canDelete && onDelete && (
          <button
            onClick={() => onDelete(episode)}
            className="p-2 text-gray-400 hover:text-rose-400 rounded-lg hover:bg-base-panel transition-colors"
            title="Delete episode"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </div>
  )
}