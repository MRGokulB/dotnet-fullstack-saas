import React, { useState } from 'react'
import {
  Layers,
  ShieldCheck,
  Server,
  Database,
  CreditCard,
  ArrowRight,
  CheckCircle2,
  Workflow,
  Cpu,
  Lock,
  Globe
} from 'lucide-react'

const ARCH_STEPS = [
  {
    id: 1,
    title: '1. Presentation / API Gateway',
    layer: 'ASP.NET Core Web API (Kestrel)',
    tech: 'Minimal APIs & Controllers, RFC 7807 Middleware',
    description: 'Receives HTTPS requests, applies CORS policies, validates JWT Bearer tokens, and routes traffic through ASP.NET Core middleware pipeline.'
  },
  {
    id: 2,
    title: '2. Application / Business Logic',
    layer: 'Application Layer',
    tech: 'FluentValidation, DTOs, CQRS Interfaces',
    description: 'Orchestrates business workflows, validates incoming request contracts, enforces business rules, and interacts strictly through abstractions (IApplicationDbContext, IPaymentService).'
  },
  {
    id: 3,
    title: '3. Domain / Enterprise Entities',
    layer: 'Domain Layer (Zero Dependencies)',
    tech: 'Rich Domain Models, State Transition Guards',
    description: 'Encapsulates core business invariants (Order entity with private setters, OrderStatus state machine). Completely independent of databases or third-party SDKs.'
  },
  {
    id: 4,
    title: '4. Infrastructure & Persistence',
    layer: 'Infrastructure Layer',
    tech: 'EF Core 7/8, Npgsql, SqlServer, SQLite, Stripe.net',
    description: 'Translates LINQ expressions to SQL queries via Entity Framework Core change tracker. Manages transactions, connection pooling, and external Stripe payment API interactions.'
  },
  {
    id: 5,
    title: '5. Cryptographic Webhook Ingestion',
    layer: 'Stripe Webhook Pipeline',
    tech: 'HMAC-SHA256 Signature Verification',
    description: 'Receives asynchronous checkout.session.completed payloads, verifies the Stripe-Signature header cryptographically, guarantees idempotent order fulfillment, and saves state.'
  }
]

export default function ArchitectureVisualizer() {
  const [selectedStep, setSelectedStep] = useState(ARCH_STEPS[0])

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
          <Workflow className="h-6 w-6 text-indigo-400" />
          <span>Clean Architecture & Execution Flow</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Decoupled 4-layer enterprise architecture following Twelve-Factor cloud standards and Domain-Driven Design (DDD).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {ARCH_STEPS.map((step) => {
          const isSelected = selectedStep.id === step.id
          return (
            <div
              key={step.id}
              onClick={() => setSelectedStep(step)}
              className={`p-4 rounded-xl cursor-pointer border transition-all text-left ${
                isSelected
                  ? 'bg-gradient-to-b from-indigo-950/50 to-slate-900 border-indigo-500 shadow-xl shadow-indigo-950/40 scale-[1.02]'
                  : 'bg-[#0E131F]/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase">
                  Step 0{step.id}
                </span>
                {isSelected && <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />}
              </div>
              <h4 className="text-xs font-bold text-white leading-tight mb-1">{step.title}</h4>
              <p className="text-[11px] text-slate-400 font-mono truncate">{step.layer}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 bg-[#0E131F]/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="flex items-center space-x-3 border-b border-slate-800/80 pb-4">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{selectedStep.title}</h3>
              <p className="text-xs text-indigo-400 font-mono">{selectedStep.layer}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Key Technologies & Patterns
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-800 font-mono text-xs text-emerald-300">
              {selectedStep.tech}
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
              Architectural Role & Guarantees
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
              {selectedStep.description}
            </p>
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#0E131F]/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-indigo-400" />
            <span>Clean Architecture Dependency Inversion</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Domain</div>
                <div className="text-[11px] text-slate-400">Zero dependencies on any layer or library</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Core
              </span>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="h-4 w-4 text-slate-600 rotate-90" />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Application</div>
                <div className="text-[11px] text-slate-400">Depends ONLY on Domain (CQRS, Interfaces)</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Use Cases
              </span>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="h-4 w-4 text-slate-600 rotate-90" />
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Infrastructure & WebApi</div>
                <div className="text-[11px] text-slate-400">Implements interfaces defined in Application</div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                Adapters
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
