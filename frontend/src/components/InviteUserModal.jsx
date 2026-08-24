import { Check, Search, UserPlus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { inviteUserToChannel } from "../api/channel";
import { searchUsers } from "../api/users";

export default function InviteUserModal({ channelId, onClose }) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sentMap, setSentMap] = useState({});

  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }
    const timer = setTimeout(() => {
      setLoading(true);
      searchUsers(query)
        .then((res) => setUsers(res || []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleInvite = async (user) => {
    try {
      await inviteUserToChannel(channelId, user.id);
      setSentMap((prev) => ({ ...prev, [user.id]: true }));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to send invite");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-base-card border border-base-border rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={18} />
        </button>

        <h2 className="text-lg font-bold mb-1">Invite Members</h2>
        <p className="text-xs text-gray-400 mb-4">
          Search users by handle or name to send a direct invite.
        </p>

        <div className="relative mb-4">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search @username or name..."
            className="w-full bg-base-panel border border-base-border rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-brand"
          />
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {loading && (
            <p className="text-xs text-gray-500 text-center py-4">
              Searching users...
            </p>
          )}
          {!loading && query.trim() && users.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-4">
              No matching users found.
            </p>
          )}
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between p-2.5 bg-base-panel border border-base-border rounded-xl"
            >
              <div className="min-w-0 pr-2">
                <p className="text-sm font-semibold truncate text-white">
                  {u.display_name}
                </p>
                <p className="text-xs text-gray-400 truncate">@{u.username}</p>
              </div>
              <button
                disabled={sentMap[u.id]}
                onClick={() => handleInvite(u)}
                className={`text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium transition-colors ${
                  sentMap[u.id]
                    ? "bg-emerald-500/20 text-emerald-400 cursor-default"
                    : "bg-brand hover:bg-brand-dark text-white"
                }`}
              >
                {sentMap[u.id] ? (
                  <>
                    <Check size={14} /> Invite Sent
                  </>
                ) : (
                  <>
                    <UserPlus size={14} /> Invite
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
