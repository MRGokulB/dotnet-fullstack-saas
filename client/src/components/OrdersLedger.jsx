import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
  ExternalLink,
  Zap,
  Search
} from 'lucide-react';

export default function OrdersLedger({
  orders,
  onInitiateCheckout,
  onSimulateSuccess,
  busyOrderId
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const statusConfig = {
    Paid: {
      icon: CheckCircle2,
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    },
    Pending: {
      icon: Clock,
      badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    },
    Failed: {
      icon: XCircle,
      badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30'
    },
    Refunded: {
      icon: RotateCcw,
      badge: 'bg-slate-500/15 text-slate-300 border-slate-500/30'
    }
  };

  const normalizeStatus = (raw) => {
    if (typeof raw === 'number') {
      return ['Pending', 'Paid', 'Failed', 'Refunded'][raw] || 'Pending';
    }
    const str = String(raw || 'Pending');
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const filteredOrders = (orders || []).filter((order) => {
    const status = normalizeStatus(order.status);
    const matchesStatus = statusFilter === 'ALL' || status.toUpperCase() === statusFilter;
    const target = `${order.customerName || ''} ${order.customerEmail || ''} ${order.productName || order.product?.name || ''} ${order.stripeSessionId || ''}`.toLowerCase();
    const matchesSearch = target.includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <section className="glass-panel rounded-2xl p-6 space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">
            Customer Order Ledger & State Machine
          </h2>
          <p className="text-xs text-slate-400">
            Backed by <span className="font-mono text-indigo-300">Order.MarkAsPaid()</span> domain invariants and <span className="font-mono text-indigo-300">OrderStatusChangedDomainEvent</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter customer, tier, session..."
              className="pl-8 pr-3 py-1.5 rounded-xl bg-black/40 border border-white/[0.08] text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-400/50"
            />
          </div>

          <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/[0.06]">
            {['ALL', 'PAID', 'PENDING', 'FAILED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all ${
                  statusFilter === status
                    ? 'bg-indigo-500/25 text-white border border-indigo-400/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/[0.08] text-[11px] font-mono uppercase tracking-wider text-slate-400">
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Subscription Tier</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Domain State</th>
              <th className="py-3 px-4">Stripe Session</th>
              <th className="py-3 px-4 text-right">CQRS Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05] text-xs">
            {filteredOrders.map((order) => {
              const status = normalizeStatus(order.status);
              const cfg = statusConfig[status] || statusConfig.Pending;
              const StatusIcon = cfg.icon;
              const amount = Number(order.amount ?? order.totalAmount ?? 0);
              const tierName = order.productName || order.product?.name || `Plan #${order.productId || 1}`;

              return (
                <tr
                  key={order.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  <td className="py-3.5 px-4 font-mono text-indigo-300 font-semibold">
                    #ORD-{String(order.id).slice(0, 8)}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-white">{order.customerName || 'Enterprise Account'}</div>
                    <div className="text-[11px] font-mono text-slate-400">{order.customerEmail}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-200 font-medium">
                      {tierName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-white">
                    ${amount.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border ${cfg.badge}`}>
                      <StatusIcon className="w-3 h-3" />
                      {status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                    {order.stripeSessionId ? (
                      <span className="px-2 py-0.5 rounded bg-black/40 border border-white/[0.06] text-slate-300">
                        {order.stripeSessionId.slice(0, 18)}...
                      </span>
                    ) : (
                      <span className="text-slate-600">unassigned</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      {status !== 'Paid' ? (
                        <>
                          <button
                            onClick={() => onInitiateCheckout(order.id)}
                            disabled={busyOrderId === order.id}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 font-mono text-[11px] inline-flex items-center gap-1 transition-all"
                          >
                            <span>Checkout</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => onSimulateSuccess(order.id)}
                            disabled={busyOrderId === order.id}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-mono text-[11px] inline-flex items-center gap-1 transition-all"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Mark Paid</span>
                          </button>
                        </>
                      ) : (
                        <span className="text-[11px] font-mono text-emerald-400/80 px-2 py-1">
                          Settled & Verified
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
