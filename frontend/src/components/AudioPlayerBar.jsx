import { Pause, Play, Radio, Volume2, VolumeX, X } from "lucide-react";
import { useState } from "react";

export default function AudioPlayerBar({ stream, onClose }) {
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(80);

  if (!stream) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 max-w-3xl w-[92%] bg-base-card/95 backdrop-blur-md border border-brand/50 rounded-2xl px-5 py-3 shadow-2xl z-50 flex items-center justify-between gap-4">
      {/* Stream metadata */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-brand/30 border border-brand/60 flex items-center justify-center text-brand-light shrink-0">
          <Radio size={20} className={playing ? "animate-pulse" : ""} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              LIVE
            </span>
            <p className="text-sm font-semibold truncate text-white">
              {stream.title || stream.name}
            </p>
          </div>
          <p className="text-xs text-gray-400 truncate">
            Broadcasting live on #{stream.channelName || stream.name}
          </p>
        </div>
      </div>

      {/* Audio Waveform Animation */}
      {playing && (
        <div className="hidden md:flex items-center gap-1 h-6 shrink-0">
          <span className="w-1 bg-brand rounded-full animate-[bounce_1s_infinite_100ms] h-4" />
          <span className="w-1 bg-brand-light rounded-full animate-[bounce_1s_infinite_300ms] h-6" />
          <span className="w-1 bg-brand rounded-full animate-[bounce_1s_infinite_200ms] h-3" />
          <span className="w-1 bg-brand-light rounded-full animate-[bounce_1s_infinite_400ms] h-5" />
          <span className="w-1 bg-brand rounded-full animate-[bounce_1s_infinite_150ms] h-2" />
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-4 shrink-0">
        <button
          onClick={() => setPlaying(!playing)}
          className="w-10 h-10 rounded-full bg-brand hover:bg-brand-dark flex items-center justify-center text-white transition-colors"
        >
          {playing ? (
            <Pause size={18} />
          ) : (
            <Play size={18} className="ml-0.5" />
          )}
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => setMuted(!muted)}
            className="text-gray-400 hover:text-white"
          >
            {muted || volume === 0 ? (
              <VolumeX size={18} />
            ) : (
              <Volume2 size={18} />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={muted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value));
              if (muted) setMuted(false);
            }}
            className="w-20 accent-brand cursor-pointer"
          />
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
