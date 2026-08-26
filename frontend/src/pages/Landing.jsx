import { ArrowRight, Mic2, Radio, Users, Bell, Compass, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import heroImg from '../assets/pod.jpeg'
import podistaLogo from '../assets/podista-logo.svg'

const FEATURES = [
  {
    icon: Radio,
    title: 'Live Channels',
    desc: 'Go live with real-time audio chat, reactions, and a room that feels alive — not another silent Discord server.',
  },
  {
    icon: Mic2,
    title: 'Episode Feeds',
    desc: "Publish real podcast episodes to your channel's feed. Cover art, playback, plays counted — a proper show, not just chat history.",
  },
  {
    icon: Users,
    title: 'Followers, Not Just Members',
    desc: 'People follow you as a creator, across every channel you run — building an audience that travels with your name.',
  },
  {
    icon: Bell,
    title: 'Live Notifications',
    desc: 'New episode, new follower, an invite waiting — pushed instantly, not buried in an inbox you never check.',
  },
  {
    icon: Compass,
    title: 'Discovery That Works',
    desc: 'Trending episodes and a real search across channels, creators, and episodes — so good work gets found.',
  },
  {
    icon: ShieldCheck,
    title: 'Moderation Built In',
    desc: 'Reporting, banning, and an admin dashboard from day one — community safety isn\u2019t an afterthought here.',
  },
]

const STEPS = [
  { n: '01', title: 'Create a channel', desc: 'Spin up a space in seconds — public or invite-only, yours to shape.' },
  { n: '02', title: 'Go live or publish', desc: 'Host a live audio session, or drop a produced episode into your feed.' },
  { n: '03', title: 'Grow your audience', desc: 'Followers, notifications, and discovery do the work of finding you listeners.' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-base-bg text-white overflow-x-hidden">
      {/* Nav */}
      <header className="max-w-6xl mx-auto flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-base-card border-base-border flex items-center justify-center">
            <img src={podistaLogo} alt="Podista logo" className="w-6 h-6" />
          </div>
          <span className="font-display font-bold text-lg">Podista</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-gray-300 hover:text-white transition-colors">
            Log in
          </Link>
          <Link to="/login" className="btn-primary text-sm">
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative bg-noise-radial">
        <div className="max-w-6xl mx-auto px-6 pt-12 pb-20 grid md:grid-cols-2 gap-10 items-center">
          <div className="animate-fade-in-up">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-brand/15 text-brand-light border border-brand/30 px-3 py-1 rounded-full mb-5">
              <Mic2 size={12} /> Built for East African creators & beyond
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight mb-5">
              Where podcasts <span className="text-gradient-brand">become communities</span>
            </h1>
            <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-8 max-w-lg">
              Podista is the social network for audio creators — live channels for the conversation,
              real episode feeds for the show, and followers who stick around for both.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/login" className="btn-primary flex items-center justify-center gap-2 text-sm px-5 py-3">
                Start your channel <ArrowRight size={16} />
              </Link>
              <a href="#features" className="btn-ghost flex items-center justify-center gap-2 text-sm px-5 py-3">
                See what's inside
              </a>
            </div>
          </div>

          <div className="relative animate-fade-in-up">
            <div className="absolute -inset-4 bg-gradient-to-br from-brand/30 to-accent-teal/20 blur-3xl rounded-full" />
            <img
              src={heroImg}
              alt="Podista live channel preview"
              className="relative rounded-2xl border border-base-border shadow-2xl w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
            More than a chat room for your channel
          </h2>
          <p className="text-gray-500 text-sm md:text-base">
            Everything a growing show needs, without stitching together five different tools.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => {
            const Icon = f.icon
            return (
              <div key={f.title} className="card-elevated p-5">
                <div className="w-10 h-10 rounded-xl bg-brand/20 border border-brand/40 flex items-center justify-center text-brand-light mb-3">
                  <Icon size={18} />
                </div>
                <h3 className="font-semibold text-sm mb-1.5">{f.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-base-border">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-center mb-12">
          Live in three steps
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {STEPS.map((s) => (
            <div key={s.n} className="relative">
              <span className="text-5xl font-display font-bold text-brand/20">{s.n}</span>
              <h3 className="font-semibold mt-2 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
          Your audience is waiting on the other side of "go live."
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Free to start. No credit card, no producer, no gatekeeper.
        </p>
        <Link to="/login" className="btn-primary inline-flex items-center gap-2 text-sm px-6 py-3">
          Create your channel <ArrowRight size={16} />
        </Link>
      </section>

      <footer className="border-t border-base-border py-8 text-center text-xs text-gray-600">
        © {new Date().getFullYear()} Podista. Built for creators who show up every week.
      </footer>
    </div>
  )
}