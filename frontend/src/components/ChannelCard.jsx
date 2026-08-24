import { Radio, Plus, Check } from 'lucide-react'

export default function ChannelCard({ channel, onClick, onJoin, onLeave, onListenLive }) {
  return (
    <div
      onClick={onClick}
      className="text-left bg-base-card border border-base-border rounded-xl overflow-hidden
                 hover:border-brand/60 transition-all cursor-pointer flex flex-col justify-between group"
    >
      <div>
        <div className="h-28 bg-gradient-to-br from-brand-dark/50 via-base-panel to-base-card relative p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium bg-base-panel/80 border border-base-border text-gray-300 px-2 py-0.5 rounded-full backdrop-blur-sm">
              {channel.category || 'General'}
            </span>
            <div className="flex gap-1">
              {channel.is_live && (
                <span className="text-[10px] font-bold bg-emerald-500 text-black px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <Radio size={10} /> LIVE
                </span>
              )}
              {channel.is_private && (
                <span className="text-[10px] font-semibold bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full border border-gray-700">
                  PRIVATE
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="p-3.5">
          <h3 className="font-semibold text-sm group-hover:text-brand-light transition-colors">{channel.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {channel.member_count != null ? `${channel.member_count} members` : ''}
          </p>
          {channel.description && (
            <p className="text-xs text-gray-400 mt-2 line-clamp-2 italic leading-relaxed">
              "{channel.description}"
            </p>
          )}
        </div>
      </div>

      {(onJoin || onLeave || (onListenLive && channel.is_live)) && (
        <div className="px-3.5 pb-3.5 pt-1 flex gap-2" onClick={(e) => e.stopPropagation()}>
          {channel.is_live && onListenLive && (
            <button
              onClick={() => onListenLive(channel)}
              className="btn-primary !py-1 !px-2.5 text-xs flex-1 flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700"
            >
              <Radio size={12} /> Listen Live
            </button>
          )}
          {onJoin && !channel.is_joined && (
            <button
              onClick={() => onJoin(channel)}
              className="btn-primary !py-1 !px-2.5 text-xs flex-1 flex items-center justify-center gap-1"
            >
              <Plus size={12} /> Join
            </button>
          )}
          {onLeave && channel.is_joined && (
            <button
              onClick={() => onLeave(channel)}
              className="btn-ghost !py-1 !px-2.5 text-xs flex-1 flex items-center justify-center gap-1 text-gray-400 hover:text-rose-400"
            >
              <Check size={12} /> Joined
            </button>
          )}
        </div>
      )}
    </div>
  )
}