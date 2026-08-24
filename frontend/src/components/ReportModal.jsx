import { ShieldAlert, X } from "lucide-react";
import { useState } from "react";
import { reportUserInChannel } from "../api/channel";

const REASONS = [
  "Hate Speech & Harassment",
  "Spam Links & Self Promotion",
  "Inappropriate Content",
  "Impersonation & Fraud",
];

export default function ReportModal({ channelId, targetUser, onClose }) {
  const [reason, setReason] = useState(REASONS[0]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!targetUser) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await reportUserInChannel(channelId, targetUser.id, reason);
      setSubmitted(true);
      setTimeout(onClose, 1500);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit report");
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

        <div className="flex items-center gap-2 text-rose-400 mb-2 font-bold text-base">
          <ShieldAlert size={20} /> Report Member
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Report{" "}
          <span className="font-semibold text-white">
            @{targetUser.username}
          </span>{" "}
          ({targetUser.display_name}) to platform moderators.
        </p>

        {submitted ? (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center">
            <p className="text-sm font-semibold text-emerald-400">
              Report Submitted
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Thank you. Moderators will review this case shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-2">
                Violation Reason
              </label>
              <div className="space-y-2">
                {REASONS.map((r) => (
                  <label
                    key={r}
                    className="flex items-center gap-3 p-2.5 bg-base-panel border border-base-border rounded-xl cursor-pointer hover:border-gray-500 text-xs text-white"
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r}
                      checked={reason === r}
                      onChange={() => setReason(r)}
                      className="accent-rose-500"
                    />
                    {r}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-rose-500 hover:bg-rose-600 text-white flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {loading ? "Submitting..." : "Submit Report"}
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
        )}
      </div>
    </div>
  );
}
