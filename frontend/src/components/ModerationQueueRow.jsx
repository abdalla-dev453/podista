 export default function ModerationQueueRow({ report, onBan, onDismiss }) {
  return (
    <tr className="border-t border-base-border">
      <td className="py-3 px-4 text-sm">@{report.reported_user}</td>
      <td className="py-3 px-4 text-sm text-gray-400">{report.channel}</td>
      <td className="py-3 px-4">
        <span className="text-xs bg-rose-500/15 text-rose-400 px-2 py-1 rounded-md">
          {report.reason}
        </span>
      </td>
      <td className="py-3 px-4 text-right space-x-2">
        <button
          onClick={onBan}
          className="text-xs border border-rose-500/60 text-rose-400 px-3 py-1.5 rounded-lg
                     hover:bg-rose-500/10"
        >
          Ban User
        </button>
        <button
          onClick={onDismiss}
          className="text-xs border border-base-border text-gray-300 px-3 py-1.5 rounded-lg
                     hover:bg-base-panel"
        >
          Dismiss
        </button>
      </td>
    </tr>
  )
}