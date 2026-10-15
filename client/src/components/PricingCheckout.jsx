import React, { useState } from 'react';
import {
  Check,
  Zap,
  Shield,
  Crown,
  ArrowRight,
  Lock,
  Sparkles
} from 'lucide-react';

export default function PricingCheckout({
  products,
  orders,
  onInitiateCheckout,
  onSimulateSuccess,
  busyOrderId
}) {
  const [selectedBilling, setSelectedBilling] = useState('monthly');

  const defaultProducts = [
    {
      id: 1,
      name: 'Starter Cloud',
      tier: 'starter',
      price: 99,
      description: 'Clean Architecture foundation for emerging engineering teams.',
      features: [
        'Up to 5 microservices on Render',
        'Neon Serverless Postgres connection pool',
        'RFC 7807 standardized ProblemDetails',
        'PBKDF2 + JWT Bearer security'
      ]
    },
    {
      id: 2,
      name: 'Pro Scale CQRS',
      tier: 'pro',
      price: 499,
      isPopular: true,
      description: 'Full CQRS dispatcher, FluentValidation pipeline, and dual-mode Stripe.',
      features: [
        'Zero-allocation CQRS Read/Write split',
        'Domain Events & Rich Entity invariants',
        'Dual-Mode Stripe Checkout & Webhooks',
        'Real-time 7-day telemetry projections'
      ]
    },
    {
      id: 3,
      name: 'Enterprise Principal',
      tier: 'enterprise',
      price: 2499,
      description: 'Dedicated multi-region orchestration with custom SLA guarantees.',
      features: [
        'Multi-provider EF Core (Postgres / SQL Server)',
        'Dedicated Principal Architect support',
        'Custom RBAC & audit event streaming',
        '99.99% uptime telemetry SLA'
      ]
    }
  ];

  const catalog = products && products.length > 0 ? products : defaultProducts;

  const getTierIcon = (tierName = '') => {
    const normalized = tierName.toLowerCase();
    if (normalized.includes('enterprise')) return Crown;
    if (normalized.includes('pro')) return Zap;
    return Shield;
  };

  const getFeatureList = (product) => {
    if (Array.isArray(product.features) && product.features.length > 0) {
      return product.features;
    }
    if (typeof product.features === 'string' && product.features.trim().length > 0) {
      return product.features.split(',').map((s) => s.trim());
    }
    const fallback = defaultProducts.find(
      (d) => d.id === product.id || d.name.toLowerCase() === (product.name || '').toLowerCase()
    );
    return fallback ? fallback.features : defaultProducts[1].features;
  };

  const pendingOrder = orders?.find((o) => String(o.status).toLowerCase() === 'pending') || orders?.[0];

  return (
    <section className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[11px] font-mono uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" />
            <span>Dual-Mode Stripe Payment Service</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gradient-metallic">
            Subscription Tiers & Live Checkout Dispatch
          </h2>
        </div>

        <div className="inline-flex items-center p-1 rounded-xl glass-panel self-start">
          <button
            onClick={() => setSelectedBilling('monthly')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedBilling === 'monthly'
                ? 'bg-indigo-500/25 text-white border border-indigo-400/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setSelectedBilling('annual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              selectedBilling === 'annual'
                ? 'bg-indigo-500/25 text-white border border-indigo-400/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Annual</span>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded">
              -15%
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {catalog.map((product, idx) => {
          const Icon = getTierIcon(product.tier || product.name);
          const isFeatured = product.isPopular || idx === 1;
          const basePrice = Number(product.price || product.monthlyPrice || 99);
          const displayPrice =
            selectedBilling === 'annual' ? Math.round(basePrice * 0.85) : basePrice;
          const features = getFeatureList(product);
          const matchingOrder =
            orders?.find((o) => o.productId === product.id && String(o.status).toLowerCase() === 'pending') ||
            pendingOrder ||
            { id: idx + 1 };

          return (
            <div
              key={product.id || product.name}
              className={`rounded-2xl p-6 flex flex-col justify-between relative transition-all duration-300 ${
                isFeatured
                  ? 'bg-gradient-to-b from-indigo-500/[0.12] via-white/[0.03] to-white/[0.02] backdrop-blur-2xl border border-indigo-400/40 shadow-[0_25px_80px_-15px_rgba(99,102,241,0.3)]'
                  : 'glass-panel glass-panel-hover'
              }`}
            >
              {isFeatured && (
                <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-[10px] font-mono uppercase tracking-widest text-white shadow-lg">
                  Most Deployed
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-indigo-300">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
                    Tier 0{idx + 1}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{product.name}</h3>
                <p className="text-xs text-slate-400 leading-relaxed min-h-[36px]">
                  {product.description || 'Enterprise SaaS subscription plan powered by .NET Clean Architecture.'}
                </p>

                <div className="my-6 pb-6 border-b border-white/[0.08] flex items-baseline gap-2">
                  <span className="text-4xl font-bold font-mono text-white">
                    ${displayPrice.toLocaleString()}
                  </span>
                  <span className="text-xs font-mono text-slate-400">/ month</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <span className="mt-0.5 p-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <Check className="w-3 h-3" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => onInitiateCheckout(matchingOrder.id, product)}
                  disabled={busyOrderId === matchingOrder.id}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                    isFeatured
                      ? 'bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-[0_0_25px_rgba(99,102,241,0.4)]'
                      : 'bg-white/[0.07] hover:bg-white/[0.12] text-white border border-white/[0.12]'
                  }`}
                >
                  <span>
                    {busyOrderId === matchingOrder.id
                      ? 'Dispatching CreateCheckoutSessionCommand...'
                      : `Checkout via Stripe (Order #${matchingOrder.id})`}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onSimulateSuccess(matchingOrder.id)}
                  disabled={busyOrderId === matchingOrder.id}
                  className="w-full py-2 px-3 rounded-xl text-[11px] font-mono text-emerald-300 bg-emerald-500/[0.08] hover:bg-emerald-500/[0.15] border border-emerald-500/25 transition-all flex items-center justify-center gap-1.5"
                >
                  <Lock className="w-3 h-3" />
                  <span>Simulate Webhook Settlement (#{matchingOrder.id})</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
