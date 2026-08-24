export default function BannedUserCard({ ban, onUnban }) {
  return (
    <div className="bg-base-card border border-base-border rounded-xl p-3 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">@{ban.username}</p>
        <p className="text-xs text-gray-500">{ban.reason}</p>
      </div>
      <button
        onClick={onUnban}
        className="text-xs border border-emerald-500/60 text-emerald-400 px-3 py-1.5 rounded-lg
                   hover:bg-emerald-500/10"
      >
        Unban
      </button>
    </div>
  )
}