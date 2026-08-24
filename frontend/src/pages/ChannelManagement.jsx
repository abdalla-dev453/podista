import { Check, Link2, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  createChannel,
  deleteChannel,
  getInviteLink,
  getMyChannels,
  updateChannel,
} from "../api/channels";
import Sidebar from "../components/Sidebar.jsx";

const CATEGORIES = ["General", "Tech", "Music", "Design", "Business", "Gaming"];

export default function ChannelManagement() {
  const [data, setData] = useState({
    channels: [],
    active_count: 0,
    max_channels: 5,
  });
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editCategory, setEditCategory] = useState("General");
  const [copiedId, setCopiedId] = useState(null);

  const load = () => getMyChannels().then(setData).catch(console.error);
  useEffect(() => {
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createChannel({ name, description, category });
      setName("");
      setDescription("");
      setCategory("General");
      setShowCreate(false);
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create channel");
    }
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setEditName(c.name);
    setEditDesc(c.description || "");
    setEditCategory(c.category || "General");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateChannel(editingId, {
        name: editName,
        description: editDesc,
        category: editCategory,
      });
      setEditingId(null);
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update channel");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this channel?"))
      return;
    try {
      await deleteChannel(id);
      load();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete channel");
    }
  };

  const handleInvite = async (id) => {
    try {
      const { invite_url } = await getInviteLink(id);
      const fullUrl = window.location.origin + invite_url;
      await navigator.clipboard?.writeText(fullUrl);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const slotsRemaining = Math.max(data.max_channels - data.active_count, 0);

  return (
    <div className="app-shell flex flex-col md:flex-row min-h-screen md:min-h-[720px]">
      <Sidebar activeLabel="Create Channel" />

      <main className="flex-1 p-4 md:p-6 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Channel Management
            </h1>
            <p className="text-gray-500 text-xs md:text-sm">
              Oversee your created communities and invite links.
            </p>
          </div>
          <div className="stat-card text-left sm:text-right min-w-[160px]">
            <p className="text-xs text-gray-500">Active Channels</p>
            <p className="text-xl md:text-2xl font-bold text-emerald-400">
              {data.active_count}
              <span className="text-gray-500 text-sm md:text-base">
                {" "}
                / {data.max_channels} Max
              </span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {data.channels.map((c) => (
            <div
              key={c.id}
              className="bg-base-card border border-base-border rounded-xl p-5 flex flex-col justify-between"
            >
              {editingId === c.id ? (
                <form onSubmit={handleUpdate} className="space-y-3">
                  <input
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-base-panel border border-base-border rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-brand"
                  />
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full bg-base-panel border border-base-border rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-brand"
                  >
                    {CATEGORIES.map((cat) => (
                      <option
                        key={cat}
                        value={cat}
                        className="bg-base-panel text-white"
                      >
                        {cat}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    rows={2}
                    className="w-full bg-base-panel border border-base-border rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-brand"
                  />
                  <div className="flex gap-2">
                    <button type="submit" className="btn-primary !py-1 text-xs">
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="btn-ghost !py-1 text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{c.name}</h3>
                      <span className="text-[10px] bg-brand/20 text-brand-light font-medium px-2.5 py-0.5 rounded-full">
                        {c.category || "General"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                      {c.description || "No description provided."}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => startEdit(c)}
                      className="btn-ghost flex items-center gap-1.5 text-xs"
                    >
                      <Pencil size={13} /> Update
                    </button>
                    <button
                      onClick={() => handleInvite(c.id)}
                      className="text-xs border border-emerald-500/60 text-emerald-400 px-3 py-1.5
                                 rounded-lg flex items-center gap-1.5 hover:bg-emerald-500/10 transition-colors"
                    >
                      {copiedId === c.id ? (
                        <>
                          <Check size={13} /> Copied!
                        </>
                      ) : (
                        <>
                          <Link2 size={13} /> Invite
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      title="Delete Channel"
                      className="ml-auto text-rose-400 hover:text-rose-300 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {showCreate ? (
            <form
              onSubmit={handleCreate}
              className="border border-dashed border-base-border rounded-xl p-5 space-y-3"
            >
              <h3 className="text-sm font-semibold text-white">
                Create New Channel
              </h3>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Channel name (e.g. Tech Talk Weekly)"
                className="w-full bg-base-panel border border-base-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-base-panel border border-base-border rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-brand"
              >
                {CATEGORIES.map((cat) => (
                  <option
                    key={cat}
                    value={cat}
                    className="bg-base-panel text-white"
                  >
                    {cat}
                  </option>
                ))}
              </select>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description of the channel..."
                rows={2}
                className="w-full bg-base-panel border border-base-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
              />
              <div className="flex gap-2">
                <button type="submit" className="btn-primary flex-1">
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="btn-ghost flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              disabled={slotsRemaining === 0}
              onClick={() => setShowCreate(true)}
              className="border border-dashed border-base-border rounded-xl flex flex-col items-center
                         justify-center gap-2 text-gray-500 hover:text-white hover:border-brand/60
                         transition-colors min-h-[170px] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={24} />
              <span className="font-semibold text-white">
                Create New Channel
              </span>
              <span className="text-xs">{slotsRemaining} slots remaining</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
