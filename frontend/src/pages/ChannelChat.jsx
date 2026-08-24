import { Mic, Pin, Radio, Send, ShieldAlert, UserPlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import { getChannel, toggleLiveChannel } from "../api/channels";
import { getMessages, sendMessage } from "../api/messages";
import AudioPlayerBar from "../components/AudioPlayerBar.jsx";
import InviteUserModal from "../components/InviteUserModal.jsx";
import ReportModal from "../components/ReportModal.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function ChannelChat() {
  const { channelId } = useParams();
  const { user } = useAuth();
  const [channel, setChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [showDetails, setShowDetails] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [activeStream, setActiveStream] = useState(null);
  const socketRef = useRef(null);
  const chatBottomRef = useRef(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChannelInfo = () => {
    getChannel(channelId).then(setChannel).catch(console.error);
  };

  useEffect(() => {
    loadChannelInfo();
    getMessages(channelId)
      .then((data) => {
        setMessages(data || []);
        setTimeout(scrollToBottom, 100);
      })
      .catch(console.error);

    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    const socket = io(socketUrl, { transports: ["websocket", "polling"] });
    socket.emit("join_channel", { channel_id: channelId });
    socket.on("new_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(scrollToBottom, 100);
    });
    socketRef.current = socket;

    return () => socket.disconnect();
  }, [channelId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    try {
      await sendMessage(channelId, { body: draft });
      setDraft("");
      scrollToBottom();
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  const handleSendVoiceNote = async () => {
    const demoVoiceClip =
      "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
    try {
      await sendMessage(channelId, {
        body: "🎙 Shared a 15-second voice clip",
        attachment_url: demoVoiceClip,
      });
      scrollToBottom();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBroadcast = async () => {
    try {
      const updated = await toggleLiveChannel(channelId);
      setChannel(updated);
      if (updated.is_live) {
        setActiveStream({
          name: updated.name,
          channelName: updated.name,
          title: `Live Audio Session on #${updated.name}`,
        });
      } else {
        setActiveStream(null);
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to toggle broadcast");
    }
  };

  return (
    <div className="app-shell flex flex-col md:flex-row min-h-screen md:min-h-[720px] pb-16 relative">
      <Sidebar activeLabel="Home" onGoLive={handleToggleBroadcast} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-5 py-3 border-b border-base-border">
          <div>
            <h2 className="font-semibold flex items-center gap-2">
              # {channel ? channel.name : `channel-${channelId}`}
              {channel?.is_live && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Radio size={10} className="animate-pulse" /> LIVE
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-500">
              {channel
                ? `${channel.member_count || 1} members`
                : "Channel Chat"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {channel?.is_live && (
              <button
                onClick={() =>
                  setActiveStream({
                    name: channel.name,
                    channelName: channel.name,
                    title: `Live Audio Stream on #${channel.name}`,
                  })
                }
                className="btn-primary !py-1 !px-3 text-xs flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700"
              >
                <Radio size={12} /> Listen Live
              </button>
            )}
            <button
              onClick={() => setShowInviteModal(true)}
              className="btn-ghost !py-1 !px-3 text-xs flex items-center gap-1"
            >
              <UserPlus size={14} /> Invite Members
            </button>
            <Pin
              size={18}
              onClick={() => setShowDetails((s) => !s)}
              className="cursor-pointer text-gray-400 hover:text-white"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[560px]">
          {messages.map((m) => {
            const mine = m.author?.id === user?.id;
            const isAudioAttachment =
              m.attachment_url?.endsWith(".mp3") ||
              m.attachment_url?.includes("audio") ||
              m.body?.includes("🎙");

            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : ""} group`}
              >
                <div
                  className={`max-w-[75%] ${mine ? "bg-brand text-white" : "bg-base-card border border-base-border"} rounded-2xl p-3 shadow-md`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1">
                    {!mine && (
                      <p className="text-xs font-semibold text-brand-light">
                        {m.author?.display_name || m.author?.username}
                      </p>
                    )}
                    {!mine && (
                      <button
                        onClick={() => setReportTarget(m.author)}
                        title="Report Member"
                        className="opacity-0 group-hover:opacity-100 text-[10px] text-gray-400 hover:text-rose-400 transition-opacity flex items-center gap-1 ml-auto"
                      >
                        <ShieldAlert size={12} /> Report
                      </button>
                    )}
                  </div>

                  {m.body && (
                    <p className="text-sm leading-relaxed">{m.body}</p>
                  )}

                  {m.attachment_url && (
                    <div className="mt-2">
                      {isAudioAttachment ? (
                        <div className="bg-base-panel/80 p-2 rounded-xl border border-base-border">
                          <audio controls className="w-full h-8 accent-brand">
                            <source src={m.attachment_url} type="audio/mp3" />
                            Your browser does not support audio elements.
                          </audio>
                        </div>
                      ) : (
                        <img
                          src={m.attachment_url}
                          alt="attachment"
                          className="rounded-lg max-w-full"
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={chatBottomRef} />
        </div>

        <form
          onSubmit={handleSend}
          className="p-4 border-t border-base-border flex items-center gap-3"
        >
          <button
            type="button"
            onClick={handleSendVoiceNote}
            title="Send Audio Clip / Voice Note"
            className="text-gray-400 hover:text-brand-light p-2 rounded-full hover:bg-base-panel transition-colors"
          >
            <Mic size={18} />
          </button>

          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Message #${channel?.name || `channel-${channelId}`}...`}
            className="flex-1 bg-base-panel border border-base-border rounded-full px-4 py-2 text-sm text-white outline-none focus:border-brand"
          />
          <button
            type="submit"
            className="bg-brand hover:bg-brand-dark text-white rounded-full p-2.5 transition-colors cursor-pointer"
          >
            <Send size={16} />
          </button>
        </form>
      </div>

      {showDetails && (
        <aside className="w-72 shrink-0 border-l border-base-border p-4 fixed lg:static inset-y-0 right-0 z-40 bg-base-panel shadow-2xl lg:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Channel Details</h3>
            <X
              size={16}
              className="cursor-pointer text-gray-500 hover:text-white"
              onClick={() => setShowDetails(false)}
            />
          </div>

          <div className="space-y-4 text-sm">
            <div>
              <p className="text-xs text-gray-500 mb-1">About</p>
              <p className="text-gray-300 bg-base-card border border-base-border rounded-lg p-3 text-xs leading-relaxed">
                {channel?.description ||
                  "Discussion channel for this community. Share your tracks, find samples, and collaborate."}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Category</p>
              <span className="text-xs font-medium bg-brand/20 text-brand-light px-2.5 py-1 rounded-full inline-block">
                {channel?.category || "General"}
              </span>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setShowInviteModal(true)}
                className="w-full btn-ghost py-2 text-xs flex items-center justify-center gap-1.5"
              >
                <UserPlus size={14} /> Invite Direct User
              </button>
            </div>
          </div>
        </aside>
      )}

      {showInviteModal && (
        <InviteUserModal
          channelId={channelId}
          onClose={() => setShowInviteModal(false)}
        />
      )}

      {reportTarget && (
        <ReportModal
          channelId={channelId}
          targetUser={reportTarget}
          onClose={() => setReportTarget(null)}
        />
      )}

      {activeStream && (
        <AudioPlayerBar
          stream={activeStream}
          onClose={() => setActiveStream(null)}
        />
      )}
    </div>
  );
}
