import React, { useState, useEffect } from 'react'
import {
  Search,
  RefreshCw,
  Download,
  ShieldCheck,
  Clock,
  Sparkles,
  ExternalLink,
  Filter
} from 'lucide-react'

export default function OrdersLedger({
  orders,
  loading,
  onRefresh,
  addToast
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [simulatingId, setSimulatingId] = useState(null)

  useEffect(() => {
    let interval
    if (autoRefresh) {
      interval = setInterval(() => {
        onRefresh()
      }, 5000)
    }
    return () => clearInterval(interval)
  }, [autoRefresh, onRefresh])

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.productName.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'ALL' || o.status.toUpperCase() === statusFilter

    return matchesSearch && matchesStatus
  })

  const exportCsv = () => {
    if (orders.length === 0) {
      addToast('info', 'No Data', 'No orders available to export.')
      return
    }

    const headers = ['OrderId,CustomerEmail,ProductName,Amount,Currency,Status,CreatedAtUtc,PaidAtUtc']
    const rows = orders.map(
      (o) =>
        `"${o.id}","${o.customerEmail}","${o.productName}",${o.totalAmount},"${o.currency}","${o.status}","${o.createdAtUtc}","${o.paidAtUtc || ''}"`
    )

    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `orders_export_${new Date().toISOString().substring(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)

    addToast('success', 'Export Complete', 'Exported orders to CSV file')
  }

  const handleSimulateWebhook = async (orderId) => {
    setSimulatingId(orderId)
    try {
      const res = await fetch(`/api/payments/simulate-success/${orderId}`, {
        method: 'POST'
      })
      const data = await res.json()
      if (res.ok) {
        addToast('success', 'State Updated', `Order ${orderId.substring(0, 8)}... marked as Paid`)
        onRefresh()
      } else {
        throw new Error(data.message || 'Simulation failed')
      }
    } catch (err) {
      addToast('error', 'Simulation Error', err.message)
    } finally {
      setSimulatingId(null)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6 text-indigo-400" />
            <span>Orders & Transactions Ledger</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Persisted in Entity Framework Core database with immutable transactional audit records.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              autoRefresh
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Auto (5s): {autoRefresh ? 'ON' : 'OFF'}
          </button>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all"
            title="Refresh Orders"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={exportCsv}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all"
          >
            <Download className="h-3.5 w-3.5 text-indigo-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0E131F]/80 border border-slate-800/80 p-4 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search email, product or order ID..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
          {['ALL', 'PAID', 'PENDING', 'FAILED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#0E131F]/90 border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-5">Order ID</th>
                <th className="py-3.5 px-5">Customer Email</th>
                <th className="py-3.5 px-5">Plan</th>
                <th className="py-3.5 px-5">Amount</th>
                <th className="py-3.5 px-5">Status</th>
                <th className="py-3.5 px-5">Timestamp</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500 space-y-2">
                    <Clock className="h-8 w-8 mx-auto text-slate-600" />
                    <div>No orders matching filter.</div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-5 font-mono text-[11px] text-indigo-300">
                      {o.id.substring(0, 8)}...
                    </td>
                    <td className="py-4 px-5 font-medium text-white">{o.customerEmail}</td>
                    <td className="py-4 px-5 text-slate-300">{o.productName}</td>
                    <td className="py-4 px-5 font-mono font-bold text-white">
                      ${o.totalAmount.toFixed(2)} {o.currency.toUpperCase()}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                          o.status === 'Paid'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : o.status === 'Failed'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 font-mono text-[11px] text-slate-400">
                      {new Date(o.createdAtUtc).toLocaleString()}
                    </td>
                    <td className="py-4 px-5 text-right">
                      {o.status !== 'Paid' ? (
                        <button
                          onClick={() => handleSimulateWebhook(o.id)}
                          disabled={simulatingId === o.id}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold transition-all disabled:opacity-50"
                        >
                          <Sparkles className="h-3 w-3" />
                          <span>Simulate Pay</span>
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-emerald-400">Verified</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
