import React, { useState } from 'react'
import { X, Lock, Mail, User, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react'

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login'
    const body = isRegister ? { email, password, fullName } : { email, password }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.title || 'Authentication failed')
      }

      onAuthSuccess(data)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#0F1420] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-7 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="space-y-1">
          <h3 className="text-xl font-bold tracking-tight text-white">
            {isRegister ? 'Create Developer Account' : 'Welcome to NexusCore'}
          </h3>
          <p className="text-xs text-slate-400">
            {isRegister
              ? 'Register with ASP.NET Core Identity & JWT issuance.'
              : 'Sign in to access secured endpoints and live session metrics.'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Satya Nadella"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@enterprise.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>{isRegister ? 'Register Account' : 'Authenticate & Sign In'}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister)
              setError(null)
            }}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {isRegister
              ? 'Already registered? Sign in here'
              : "Don't have an account yet? Create one"}
          </button>
        </div>
      </div>
    </div>
  )
}
