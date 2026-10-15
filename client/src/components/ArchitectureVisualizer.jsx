import React, { useState } from 'react';
import {
  Layers,
  Cpu,
  Database,
  ShieldAlert,
  ArrowRight,
  Code2,
  CheckCircle2
} from 'lucide-react';

export default function ArchitectureVisualizer() {
  const [selectedLayer, setSelectedLayer] = useState('application');

  const layers = [
    {
      id: 'webapi',
      title: 'WebApi Presentation Layer',
      project: 'DotnetFullstackSaaS.WebApi',
      badge: 'Port 5000 / Render Docker',
      icon: ShieldAlert,
      summary: 'Thin HTTP edge hosting RFC 7807 ExceptionHandlingMiddleware, JWT Bearer validation, and Kestrel telemetry.',
      mernEquivalent: 'Express Router + Helmet + Zod Error Handler Middleware',
      artifacts: [
        'ExceptionHandlingMiddleware (HTTP 400 / 401 / 404 / 422 ProblemDetails)',
        'PaymentsController & AnalyticsController dispatching via IDispatcher',
        'HealthCheck endpoint reporting memory footprint and DB connectivity'
      ]
    },
    {
      id: 'application',
      title: 'Application CQRS Layer',
      project: 'DotnetFullstackSaaS.Application',
      badge: 'Zero-Allocation Dispatcher',
      icon: Cpu,
      summary: 'Orchestrates use cases via ICommand<T>, IQuery<T>, and automatic FluentValidation pipelines.',
      mernEquivalent: 'Use-Case Service Layer + Joi/Zod Schema Validators',
      artifacts: [
        'Dispatcher.SendAsync runs all IValidator<TCommand> prior to execution',
        'GetAnalyticsSummaryQuery uses EF Core AsNoTracking() projections',
        'CreateCheckoutSessionCommand & SimulatePaymentSuccessCommand'
      ]
    },
    {
      id: 'domain',
      title: 'Rich Domain Core',
      project: 'DotnetFullstackSaaS.Domain',
      badge: 'Zero External Dependencies',
      icon: Layers,
      summary: 'Encapsulates enterprise invariants, state machine rules, and domain events inside aggregate roots.',
      mernEquivalent: 'Pure TypeScript Domain Models + Node EventEmitter',
      artifacts: [
        'Order.MarkAsPaid() & Order.Refund() state machine guards',
        'OrderStatusChangedDomainEvent queued in BaseEntity',
        'DomainRuleViolationException mapped to HTTP 422 Unprocessable Entity'
      ]
    },
    {
      id: 'infrastructure',
      title: 'Infrastructure & Cloud Adapters',
      project: 'DotnetFullstackSaaS.Infrastructure',
      badge: 'Neon Postgres + Stripe Dual-Mode',
      icon: Database,
      summary: 'Implements Application interfaces for persistence, PBKDF2 hashing, JWT HMAC-SHA256, and Stripe billing.',
      mernEquivalent: 'Prisma/Mongoose Repositories + Stripe SDK + Passport JWT',
      artifacts: [
        'ApplicationDbContext supporting SQLite, Neon Postgres, and SQL Server',
        'StripePaymentService with automatic live-to-simulation fallback',
        'DbInitializer seeding 3 SaaS tiers and 4 realistic customer orders'
      ]
    }
  ];

  const active = layers.find((l) => l.id === selectedLayer) || layers[1];

  return (
    <section className="glass-panel rounded-2xl p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">
            Clean Architecture (DIP) & CQRS Pipeline Inspector
          </h2>
          <p className="text-xs text-slate-400">
            Click any architectural ring to inspect its .NET 7 implementation and MERN/GCP enterprise mapping
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
          Dependency Rule: Inward Only
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
          {layers.map((layer, index) => {
            const Icon = layer.icon;
            const isSelected = layer.id === selectedLayer;
            return (
              <button
                key={layer.id}
                onClick={() => setSelectedLayer(layer.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-500/25 via-violet-500/15 to-transparent border-indigo-400/50 shadow-[0_0_30px_rgba(99,102,241,0.2)]'
                    : 'bg-white/[0.02] border-white/[0.07] hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${isSelected ? 'bg-indigo-500 text-white' : 'bg-white/[0.05] text-slate-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-indigo-300">Layer 0{index + 1}</div>
                    <div className="text-sm font-semibold text-white">{layer.title}</div>
                  </div>
                </div>
                <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-indigo-300 translate-x-1' : 'text-slate-600'}`} />
              </button>
            );
          })}
        </div>

        <div className="lg:col-span-7 rounded-2xl bg-black/40 border border-white/[0.08] p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/[0.08]">
              <div>
                <span className="text-xs font-mono text-indigo-400">{active.project}</span>
                <h3 className="text-xl font-bold text-white mt-0.5">{active.title}</h3>
              </div>
              <span className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
                {active.badge}
              </span>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed">{active.summary}</p>

            <div className="p-3.5 rounded-xl bg-indigo-500/[0.07] border border-indigo-500/20">
              <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-300 mb-1 flex items-center gap-1.5">
                <Code2 className="w-3.5 h-3.5" />
                <span>MERN / GCP Architectural Equivalent</span>
              </div>
              <div className="text-xs font-mono text-slate-200">{active.mernEquivalent}</div>
            </div>

            <div className="space-y-2 pt-2">
              <div className="text-xs font-mono uppercase tracking-wider text-slate-400">
                Production C# Artifacts in Repository
              </div>
              {active.artifacts.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-slate-200 font-mono"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Build Policy: 0 Warnings / 0 Comments</span>
            <span className="text-emerald-400">Verified on .NET 7</span>
          </div>
        </div>
      </div>
    </section>
  );
}
