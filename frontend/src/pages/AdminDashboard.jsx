import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import {
  banReportedUser,
  dismissReport,
  getBannedUsers,
  getModerationQueue,
  getOverview,
  unbanUser,
} from "../api/admin";
import BannedUserCard from "../components/BannedUserCard.jsx";
import ModerationQueueRow from "../components/ModerationQueueRow.jsx";
import Sidebar from "../components/Sidebar.jsx";

export default function AdminDashboard() {
  const [overview, setOverview] = useState({
    total_users: 0,
    active_channels: 0,
    new_reports: 0,
  });
  const [queue, setQueue] = useState([]);
  const [banned, setBanned] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [o, q, b] = await Promise.all([
        getOverview(),
        getModerationQueue(),
        getBannedUsers(),
      ]);
      setOverview(o || { total_users: 0, active_channels: 0, new_reports: 0 });
      setQueue(q || []);
      setBanned(b || []);
    } catch (err) {
      console.error("Failed loading admin dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleBan = async (reportId) => {
    try {
      await banReportedUser(reportId);
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to ban user");
    }
  };

  const handleDismiss = async (reportId) => {
    try {
      await dismissReport(reportId);
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to dismiss report");
    }
  };

  const handleUnban = async (banId) => {
    try {
      await unbanUser(banId);
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to unban user");
    }
  };

  return (
    <div className="app-shell flex flex-col md:flex-row min-h-screen md:min-h-[720px]">
      <Sidebar activeLabel="Admin Dashboard" />

      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-500 text-xs md:text-sm">
              System overview and moderation controls.
            </p>
          </div>
          <button
            onClick={load}
            className="btn-ghost flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />{" "}
            Refresh Data
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="stat-card">
            <p className="text-xs text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-brand-light">
              {overview.total_users.toLocaleString()}
            </p>
          </div>
          <div className="stat-card">
            <p className="text-xs text-gray-500">Active Channels</p>
            <p className="text-2xl font-bold text-emerald-400">
              {overview.active_channels.toLocaleString()}
            </p>
          </div>
          <div className="stat-card border-rose-500/40">
            <p className="text-xs text-gray-500">⚠ New Reports</p>
            <p className="text-2xl font-bold text-rose-400">
              {overview.new_reports}
            </p>
          </div>
        </div>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-sm text-gray-300">
              Moderation Queue
            </h2>
          </div>
          <div className="bg-base-card border border-base-border rounded-xl overflow-x-auto">
            <table className="w-full text-left min-w-[500px]">
              <thead>
                <tr className="text-xs text-gray-500 border-b border-base-border">
                  <th className="py-2.5 px-4 font-normal">Reported User</th>
                  <th className="py-2.5 px-4 font-normal">Channel</th>
                  <th className="py-2.5 px-4 font-normal">Reason</th>
                  <th className="py-2.5 px-4 font-normal text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {queue.map((report) => (
                  <ModerationQueueRow
                    key={report.id}
                    report={report}
                    onBan={() => handleBan(report.id)}
                    onDismiss={() => handleDismiss(report.id)}
                  />
                ))}
                {queue.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-6 text-center text-xs text-gray-500"
                    >
                      Queue is clear.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-semibold text-sm text-gray-300 mb-3">
            Banned Users
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {banned.map((ban) => (
              <BannedUserCard
                key={ban.id}
                ban={ban}
                onUnban={() => handleUnban(ban.id)}
              />
            ))}
            {banned.length === 0 && (
              <p className="text-xs text-gray-500 col-span-2">
                No active bans in system.
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
