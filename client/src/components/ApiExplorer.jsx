import React, { useState } from 'react'
import {
  Terminal,
  Play,
  Copy,
  Check,
  RefreshCw,
  Code2,
  Lock,
  Globe
} from 'lucide-react'

const ENDPOINTS = [
  {
    method: 'GET',
    path: '/health',
    description: 'System health probe returning Kestrel status, GC memory, and database connectivity.',
    requiresAuth: false
  },
  {
    method: 'GET',
    path: '/api/products',
    description: 'Fetches active SaaS subscription tiers seeded in Entity Framework Core.',
    requiresAuth: false
  },
  {
    method: 'GET',
    path: '/api/orders',
    description: 'Retrieves all order transactions with AsNoTracking optimization.',
    requiresAuth: false
  },
  {
    method: 'GET',
    path: '/api/analytics/summary',
    description: 'Computes real-time gross revenue, conversion rates, and 7-day fulfillment trend.',
    requiresAuth: false
  },
  {
    method: 'GET',
    path: '/api/auth/me',
    description: 'Protected endpoint requiring JWT Bearer token authentication.',
    requiresAuth: true
  }
]

export default function ApiExplorer({ currentUser, addToast }) {
  const [selectedEndpoint, setSelectedEndpoint] = useState(ENDPOINTS[0])
  const [response, setResponse] = useState(null)
  const [status, setStatus] = useState(null)
  const [latency, setLatency] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const executeRequest = async () => {
    setLoading(true)
    setResponse(null)
    setStatus(null)

    const startTime = performance.now()
    const headers = { 'Content-Type': 'application/json' }

    if (selectedEndpoint.requiresAuth && currentUser?.token) {
      headers['Authorization'] = `Bearer ${currentUser.token}`
    }

    try {
      const res = await fetch(selectedEndpoint.path, {
        method: selectedEndpoint.method,
        headers
      })

      const endTime = performance.now()
      setLatency(Math.round(endTime - startTime))
      setStatus(res.status)

      const json = await res.json()
      setResponse(json)
    } catch (err) {
      const endTime = performance.now()
      setLatency(Math.round(endTime - startTime))
      setStatus(500)
      setResponse({ error: err.message || 'Request failed' })
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = () => {
    if (!response) return
    navigator.clipboard.writeText(JSON.stringify(response, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    addToast('info', 'Copied', 'JSON payload copied to clipboard')
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <Terminal className="h-6 w-6 text-indigo-400" />
          <span>Interactive API Workbench</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Execute live REST requests against the ASP.NET Core Kestrel backend and inspect raw JSON payloads and execution latency.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 bg-[#0E131F]/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-3">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
            Available Endpoints
          </h3>

          <div className="space-y-2">
            {ENDPOINTS.map((ep) => {
              const isSelected = selectedEndpoint.path === ep.path
              return (
                <div
                  key={ep.path}
                  onClick={() => {
                    setSelectedEndpoint(ep)
                    setResponse(null)
                    setStatus(null)
                  }}
                  className={`p-3.5 rounded-xl cursor-pointer border transition-all text-left ${
                    isSelected
                      ? 'bg-slate-900 border-indigo-500/70 shadow-md'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {ep.method}
                      </span>
                      <span className="font-mono text-xs font-bold text-white">{ep.path}</span>
                    </div>
                    {ep.requiresAuth && (
                      <span className="flex items-center space-x-1 text-[10px] font-mono text-amber-400">
                        <Lock className="h-3 w-3" />
                        <span>JWT</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{ep.description}</p>
                </div>
              )
            })}
          </div>

          <div className="pt-2">
            <button
              onClick={executeRequest}
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Execute {selectedEndpoint.method} {selectedEndpoint.path}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 bg-[#0E131F]/90 border border-slate-800/90 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <div className="flex items-center space-x-3">
              <Code2 className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-mono font-bold text-white">Live Response Payload</span>
            </div>

            <div className="flex items-center space-x-3 text-xs font-mono">
              {status && (
                <span
                  className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                    status >= 200 && status < 300
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  HTTP {status}
                </span>
              )}
              {latency !== null && (
                <span className="text-slate-400 text-[11px]">{latency}ms</span>
              )}
              {response && (
                <button
                  onClick={handleCopy}
                  className="p-1 rounded text-slate-400 hover:text-white transition-colors"
                  title="Copy JSON"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              )}
            </div>
          </div>

          <div className="bg-[#080B11] border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-x-auto max-h-[460px] scrollbar-thin text-slate-300">
            {loading ? (
              <div className="py-16 text-center space-y-2 text-slate-500">
                <RefreshCw className="h-6 w-6 animate-spin mx-auto text-indigo-400" />
                <p>Executing request through Kestrel...</p>
              </div>
            ) : response ? (
              <pre className="text-[11px] leading-relaxed">
                {JSON.stringify(response, null, 2)}
              </pre>
            ) : (
              <div className="py-16 text-center text-slate-500 space-y-1">
                <Terminal className="h-6 w-6 mx-auto text-slate-600" />
                <p>Click "Execute" on the left to send an HTTP request to this endpoint.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
