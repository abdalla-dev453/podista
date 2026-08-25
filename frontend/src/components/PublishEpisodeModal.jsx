import { Loader2, Mic2, Upload, X } from 'lucide-react'
import { useState } from 'react'
import { createEpisode } from '../api/episodes'
import { uploadAudio, uploadImage } from '../api/uploads'

export default function PublishEpisodeModal({ channelId, onClose, onPublished }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [audioFile, setAudioFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !audioFile) {
      setError('A title and an audio file are required.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const audio_url = await uploadAudio(audioFile)
      const cover_image_url = coverFile ? await uploadImage(coverFile) : undefined
      const episode = await createEpisode(channelId, {
        title: title.trim(),
        description: description.trim() || undefined,
        audio_url,
        cover_image_url,
      })
      onPublished?.(episode)
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to publish episode.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-base-panel border border-base-border rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Mic2 size={18} className="text-brand-light" /> Publish Episode
          </h3>
          <X size={18} className="cursor-pointer text-gray-500 hover:text-white" onClick={onClose} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Episode 12: Scaling on a shoestring"
              className="w-full bg-base-card border border-base-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What's this episode about?"
              className="w-full bg-base-card border border-base-border rounded-lg px-3 py-2 text-sm outline-none focus:border-brand resize-none"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Audio file</label>
            <label className="flex items-center gap-2 cursor-pointer bg-base-card border border-dashed border-base-border rounded-lg px-3 py-2.5 text-xs text-gray-400 hover:border-brand transition-colors">
              <Upload size={14} />
              {audioFile ? audioFile.name : 'MP3, WAV, M4A, OGG, or AAC'}
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="text-xs text-gray-400 mb-1 block">Cover art (optional)</label>
            <label className="flex items-center gap-2 cursor-pointer bg-base-card border border-dashed border-base-border rounded-lg px-3 py-2.5 text-xs text-gray-400 hover:border-brand transition-colors">
              <Upload size={14} />
              {coverFile ? coverFile.name : 'PNG, JPG, or WEBP'}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>

          {error && <p className="text-xs text-rose-400">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy && <Loader2 size={14} className="animate-spin" />}
            {busy ? 'Publishing...' : 'Publish Episode'}
          </button>
        </form>
      </div>
    </div>
  )
}