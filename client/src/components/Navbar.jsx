import React from 'react'
import {
  Layers,
  Server,
  Activity,
  User,
  LogOut,
  ShieldCheck,
  Code2
} from 'lucide-react'

export default function Navbar({
  activeTab,
  setActiveTab,
  health,
  currentUser,
  onOpenAuth,
  onLogout
}) {
  const navItems = [
    { id: 'checkout', label: 'Pricing & Checkout' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'orders', label: 'Orders Ledger' },
    { id: 'architecture', label: 'Architecture Trace' },
    { id: 'explorer', label: 'API Explorer' }
  ]

  return (
    <header className="border-b border-slate-800/80 bg-[#090D16]/90 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div
            onClick={() => setActiveTab('checkout')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <Layers className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  NexusCore
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  .NET 7 Clean Arch
                </span>
              </div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  activeTab === item.id
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-2 text-xs font-mono px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800">
            <span
              className={`h-2 w-2 rounded-full ${
                health?.status === 'Healthy'
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-amber-400'
              }`}
            />
            <span className="text-slate-400">Kestrel:</span>
            <span
              className={
                health?.status === 'Healthy'
                  ? 'text-emerald-400 font-semibold'
                  : 'text-amber-400 font-semibold'
              }
            >
              {health?.status || 'Probing...'}
            </span>
          </div>

          {currentUser ? (
            <div className="flex items-center space-x-3 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5">
              <div className="h-6 w-6 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300">
                {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-medium text-white leading-none">{currentUser.fullName}</div>
                <div className="text-[10px] text-slate-400 font-mono leading-none mt-0.5">{currentUser.role}</div>
              </div>
              <button
                onClick={onLogout}
                className="text-slate-400 hover:text-rose-400 transition-colors p-1"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-white transition-all shadow-sm"
            >
              <User className="h-3.5 w-3.5 text-indigo-400" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex lg:hidden overflow-x-auto px-4 py-2 border-t border-slate-800/60 space-x-1 scrollbar-none">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`whitespace-nowrap px-3 py-1 rounded-lg text-xs font-medium ${
              activeTab === item.id
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  )
}
