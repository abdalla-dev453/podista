export default function InvitationCard({ invitation, onAccept, onDecline }) {
  return (
    <div className="bg-base-card border border-base-border rounded-xl p-4 flex items-center justify-between">
      <div>
        <p className="font-medium text-sm">{invitation.channel.name}</p>
        <p className="text-xs text-gray-500">Invited by @{invitation.invited_by.username}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={onAccept} className="btn-primary !py-1.5 !px-3 text-xs">Accept</button>
        <button onClick={onDecline} className="btn-ghost !py-1.5 !px-3 text-xs">Decline</button>
      </div>
    </div>
  )
}