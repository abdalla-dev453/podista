import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as loginApi, register as registerApi } from '../api/auth'
import { useAuth } from '../context/AuthContext.jsx'
import { ShieldCheck, User } from 'lucide-react'

export default function AuthPage() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({
    email: '',
    password: '',
    username: '',
    display_name: '',
    is_platform_admin: false,
  })
  const [error, setError] = useState('')
  const { loginWithToken } = useAuth()
  const navigate = useNavigate()

  const update = (field) => (e) =>
    setForm((f) => ({
      ...f,
      [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const data =
        mode === 'login'
          ? await loginApi(form.email, form.password)
          : await registerApi(form)
      loginWithToken(data.token, data.user)
      navigate(data.user.is_platform_admin ? '/admin' : '/home')
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-bg relative overflow-hidden py-10 px-4">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-dark/25 via-base-bg to-base-bg" />

      <div className="relative z-10 max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
        <div className="text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            Welcome to <span className="text-brand-light">PodClub</span>
          </h1>
          <p className="text-gray-400 text-sm md:text-base max-w-md mx-auto md:mx-0">
            The ultimate backstage social network for audio creators, podcast hosts, and listeners. Connect in real-time channels and live audio streams.
          </p>
        </div>

        <div className="bg-base-card border border-base-border rounded-2xl p-6 md:p-8 w-full max-w-md justify-self-center md:justify-self-end shadow-2xl">
          <div className="flex gap-6 border-b border-base-border mb-6 text-sm">
            <button
              className={`pb-2.5 font-medium transition-colors ${
                mode === 'login' ? 'border-b-2 border-brand text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
              onClick={() => setMode('login')}
            >
              Login
            </button>
            <button
              className={`pb-2.5 font-medium transition-colors ${
                mode === 'register' ? 'border-b-2 border-brand text-white' : 'text-gray-500 hover:text-gray-300'
              }`}
              onClick={() => setMode('register')}
            >
              Register
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <>
                <Field
                  label="Username"
                  value={form.username}
                  onChange={update('username')}
                  placeholder="alex_m"
                  required
                />
                <Field
                  label="Display Name"
                  value={form.display_name}
                  onChange={update('display_name')}
                  placeholder="Alex Mercer"
                  required
                />

                {/* Role Selector */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5 font-medium">Account Role & Authorities</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, is_platform_admin: false }))}
                      className={`p-2.5 rounded-xl border text-xs text-left flex flex-col gap-1 transition-all ${
                        !form.is_platform_admin
                          ? 'border-brand bg-brand/10 text-white'
                          : 'border-base-border bg-base-panel text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <span className="font-semibold flex items-center gap-1">
                        <User size={14} /> Regular User
                      </span>
                      <span className="text-[10px] text-gray-400">Join channels, host streams & chat</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, is_platform_admin: true }))}
                      className={`p-2.5 rounded-xl border text-xs text-left flex flex-col gap-1 transition-all ${
                        form.is_platform_admin
                          ? 'border-brand bg-brand/10 text-white'
                          : 'border-base-border bg-base-panel text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <span className="font-semibold flex items-center gap-1 text-brand-light">
                        <ShieldCheck size={14} /> Platform Admin
                      </span>
                      <span className="text-[10px] text-gray-400">Admin dashboard & moderation rights</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            <Field
              label="Email Address"
              type="email"
              value={form.email}
              onChange={update('email')}
              placeholder="name@example.com"
              required
            />
            <Field
              label="Password"
              type="password"
              value={form.password}
              onChange={update('password')}
              placeholder="••••••••"
              required
            />

            {error && <p className="text-xs text-rose-400 font-medium">{error}</p>}

            <button type="submit" className="btn-primary w-full py-2.5 mt-2 text-sm font-semibold cursor-pointer">
              {mode === 'login' ? 'Continue to PodClub →' : 'Create Account →'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px bg-base-border flex-1" />
            <span className="text-xs text-gray-500">or continue with</span>
            <div className="h-px bg-base-border flex-1" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button type="button" className="btn-ghost text-xs font-medium py-2">Google</button>
            <button type="button" className="btn-ghost text-xs font-medium py-2">Apple</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, ...props }) {
  return (
    <label className="block text-xs text-gray-400 font-medium">
      {label}
      <input
        {...props}
        className="mt-1 w-full bg-base-panel border border-base-border rounded-xl px-3.5 py-2 text-sm text-white outline-none focus:border-brand transition-colors"
      />
    </label>
  )
}
