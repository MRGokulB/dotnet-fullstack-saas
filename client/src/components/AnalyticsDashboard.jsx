import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Percent,
  RefreshCw,
  BarChart3,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle
} from 'lucide-react'

export default function AnalyticsDashboard({ addToast }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAnalytics = async (isManual = false) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analytics/summary')
      if (res.ok) {
        const json = await res.json()
        setData(json)
      } else {
        throw new Error('API server returned error or connection failed')
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to backend API')
      if (isManual) {
        addToast('error', 'Analytics Offline', 'Ensure backend API is running on port 5000: dotnet run')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics(false)
  }, [])

  if (loading && !data && !error) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin mx-auto" />
        <p className="text-sm text-slate-400 font-mono">Aggregating database analytics...</p>
      </div>
    )
  }

  const maxRevenue = (data?.dailyTrend && data.dailyTrend.length > 0)
    ? Math.max(...data.dailyTrend.map((d) => d.revenue), 100)
    : 100

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
            <BarChart3 className="h-6 w-6 text-indigo-400" />
            <span>Revenue & Pipeline Analytics</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time calculations computed server-side across all transactional entities in EF Core.
          </p>
        </div>

        <button
          onClick={() => fetchAnalytics(true)}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && !data && (
        <div className="p-6 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 flex items-start space-x-3.5">
          <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <div className="font-bold text-white">Backend Connection Offline</div>
            <p className="text-amber-200/80">
              The React client cannot connect to ASP.NET Core on port 5000. Make sure the backend server is running in a terminal:
            </p>
            <div className="p-2 rounded-lg bg-black/40 font-mono text-indigo-300 mt-2">
              cd src/DotnetFullstackSaaS.WebApi ; dotnet run
            </div>
            <div className="pt-2">
              <button
                onClick={() => fetchAnalytics(true)}
                className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold text-xs"
              >
                Retry Connection
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#0E131F]/80 border border-slate-800/80 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Gross Revenue</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            ${data?.totalRevenue?.toFixed(2) || '0.00'}
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center space-x-1">
            <TrendingUp className="h-3 w-3" />
            <span>From verified paid checkout events</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0E131F]/80 border border-slate-800/80 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Transactions</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <ShoppingCart className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {data?.totalOrders || 0}
          </div>
          <div className="text-[11px] text-slate-400">
            {data?.paidOrders || 0} paid • {data?.pendingOrders || 0} pending
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0E131F]/80 border border-slate-800/80 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Conversion Rate</span>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {data?.conversionRatePercent || 0}%
          </div>
          <div className="text-[11px] text-indigo-400">
            Paid orders / Total created orders
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0E131F]/80 border border-slate-800/80 space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Average Order Value</span>
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            ${data?.averageOrderValue?.toFixed(2) || '0.00'}
          </div>
          <div className="text-[11px] text-slate-400">
            Revenue per paid customer
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#0E131F]/80 border border-slate-800/80 space-y-6 shadow-xl">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">7-Day Revenue Trend</h3>
            <span className="text-xs text-slate-400 font-mono">USD Volume</span>
          </div>

          <div className="h-48 flex items-end space-x-3 pt-6 pb-2 border-b border-slate-800/80">
            {data?.dailyTrend?.map((day) => {
              const heightPercent = Math.max(
                Math.round((day.revenue / maxRevenue) * 100),
                8
              )
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center space-y-2 h-full justify-end group">
                  <div className="text-[10px] font-mono text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity">
                    ${day.revenue}
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-indigo-900/60 to-indigo-500 group-hover:to-indigo-400 transition-all cursor-pointer"
                  />
                  <span className="text-[10px] font-mono text-slate-500">
                    {day.date.substring(5)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="lg:col-span-4 p-6 rounded-2xl bg-[#0E131F]/80 border border-slate-800/80 space-y-6 shadow-xl">
          <h3 className="text-sm font-bold text-white">Fulfillment Distribution</h3>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-emerald-400 flex items-center space-x-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Paid ({data?.paidOrders || 0})</span>
                </span>
                <span className="font-mono text-slate-300">
                  {data?.totalOrders ? Math.round((data.paidOrders / data.totalOrders) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                <div
                  style={{
                    width: `${data?.totalOrders ? (data.paidOrders / data.totalOrders) * 100 : 0}%`
                  }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-amber-400 flex items-center space-x-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Pending ({data?.pendingOrders || 0})</span>
                </span>
                <span className="font-mono text-slate-300">
                  {data?.totalOrders ? Math.round((data.pendingOrders / data.totalOrders) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                <div
                  style={{
                    width: `${data?.totalOrders ? (data.pendingOrders / data.totalOrders) * 100 : 0}%`
                  }}
                  className="h-full bg-amber-500 rounded-full"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-rose-400 flex items-center space-x-1.5">
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Failed ({data?.failedOrders || 0})</span>
                </span>
                <span className="font-mono text-slate-300">
                  {data?.totalOrders ? Math.round((data.failedOrders / data.totalOrders) * 100) : 0}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                <div
                  style={{
                    width: `${data?.totalOrders ? (data.failedOrders / data.totalOrders) * 100 : 0}%`
                  }}
                  className="h-full bg-rose-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
