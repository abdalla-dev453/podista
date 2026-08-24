import { ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { updateProfile } from "../api/users";

export default function ProfileModal({ user, onClose, onUpdated }) {
  const [displayName, setDisplayName] = useState(user?.display_name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!user) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const updated = await updateProfile({ display_name: displayName, bio });
      onUpdated(updated);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
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

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-full bg-brand/30 border border-brand/60 flex items-center justify-center text-lg font-bold text-white">
            {user.display_name?.[0] || "U"}
          </div>
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              {user.display_name}
              {user.is_platform_admin && (
                <span className="text-[10px] bg-brand-light/20 text-brand-light px-2 py-0.5 rounded-full flex items-center gap-1 font-normal">
                  <ShieldCheck size={12} /> Admin
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-400">@{user.username}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Display Name
            </label>
            <input
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-base-panel border border-base-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Bio / Audio Interests
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell the PodClub community about yourself..."
              className="w-full bg-base-panel border border-base-border rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-brand"
            />
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 py-2 text-sm font-medium"
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1 py-2 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
