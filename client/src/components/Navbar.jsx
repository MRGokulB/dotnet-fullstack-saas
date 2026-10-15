import React from 'react';
import {
  Activity,
  Layers,
  BarChart3,
  CreditCard,
  Receipt,
  Terminal,
  ShieldCheck,
  LogIn,
  LogOut,
  Sparkles
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  health,
  user,
  onOpenAuth,
  onLogout
}) {
  const navItems = [
    { id: 'overview', label: 'Executive Suite', icon: Sparkles },
    { id: 'analytics', label: 'Revenue Telemetry', icon: BarChart3 },
    { id: 'pricing', label: 'Tier Checkout', icon: CreditCard },
    { id: 'orders', label: 'Order Ledger', icon: Receipt },
    { id: 'architecture', label: 'Clean Arch + CQRS', icon: Layers },
    { id: 'explorer', label: 'API Console', icon: Terminal }
  ];

  const isHealthy = health?.status === 'Healthy' || health?.database === 'Connected' || Boolean(health);

  return (
    <header className="sticky top-0 z-40 px-4 pt-4 pb-2">
      <div className="max-w-7xl mx-auto glass-panel rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/30 via-violet-500/20 to-emerald-500/20 border border-indigo-400/30 shadow-inner">
            <Layers className="w-5 h-5 text-indigo-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-[#05070B]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-white text-base">
                Aether<span className="text-indigo-400">Net</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                .NET 7 CQRS
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Enterprise Multi-Tier SaaS Control Plane
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.06] overflow-x-auto max-w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  active
                    ? 'bg-gradient-to-r from-indigo-500/25 to-violet-500/20 text-white border border-indigo-400/30 shadow-[0_0_20px_rgba(99,102,241,0.25)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-indigo-300' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/20 text-xs">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-mono">
              {isHealthy ? 'Kestrel :5000 Online' : 'Syncing Telemetry'}
            </span>
            {health?.memoryMb && (
              <span className="text-[11px] font-mono text-emerald-300/80 pl-1 border-l border-white/10">
                {health.memoryMb}MB
              </span>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-pill text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-mono text-slate-200">{user.email}</span>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl glass-pill hover:bg-rose-500/15 hover:border-rose-500/30 hover:text-rose-300 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white text-xs font-medium shadow-[0_0_25px_rgba(99,102,241,0.35)] transition-all duration-200"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>JWT Session</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
