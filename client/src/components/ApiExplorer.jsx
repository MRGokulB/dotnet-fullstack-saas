import React, { useState } from 'react';
import { Play, Terminal, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

export default function ApiExplorer({ token }) {
  const [selectedEndpoint, setSelectedEndpoint] = useState(0);
  const [responsePayload, setResponsePayload] = useState(null);
  const [statusCode, setStatusCode] = useState(null);
  const [latencyMs, setLatencyMs] = useState(null);
  const [isCalling, setIsCalling] = useState(false);

  const endpoints = [
    {
      label: 'Get Analytics Summary (CQRS Query)',
      method: 'GET',
      path: '/api/analytics/summary'
    },
    {
      label: 'List Subscription Tiers',
      method: 'GET',
      path: '/api/products'
    },
    {
      label: 'Fetch Customer Order Ledger',
      method: 'GET',
      path: '/api/orders'
    },
    {
      label: 'Trigger RFC 7807 404 ProblemDetails',
      method: 'POST',
      path: '/api/payments/simulate-success/00000000-0000-0000-0000-000000000000'
    },
    {
      label: 'Kestrel Runtime Health Telemetry',
      method: 'GET',
      path: '/health'
    }
  ];

  const executeRequest = async () => {
    const ep = endpoints[selectedEndpoint];
    setIsCalling(true);
    const start = performance.now();
    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      const res = await fetch(ep.path, { method: ep.method, headers });
      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed);
      setStatusCode(res.status);
      const text = await res.text();
      try {
        setResponsePayload(JSON.parse(text));
      } catch {
        setResponsePayload({ rawResponse: text });
      }
    } catch (err) {
      setLatencyMs(Math.round(performance.now() - start));
      setStatusCode(503);
      setResponsePayload({
        type: 'https://tools.ietf.org/html/rfc7807',
        title: 'Backend Unreachable',
        status: 503,
        detail: err.message
      });
    } finally {
      setIsCalling(false);
    }
  };

  return (
    <section className="glass-panel rounded-2xl p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-indigo-400" />
            <span>Live Kestrel API & RFC 7807 ProblemDetails Console</span>
          </h2>
          <p className="text-xs text-slate-400">
            Dispatch real HTTP requests against <span className="font-mono text-indigo-300">/api/*</span> and inspect JSON envelopes
          </p>
        </div>

        <button
          onClick={executeRequest}
          disabled={isCalling}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white text-xs font-semibold shadow-lg transition-all"
        >
          <Play className="w-3.5 h-3.5" />
          <span>{isCalling ? 'Executing...' : 'Send Request'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 space-y-2">
          {endpoints.map((ep, idx) => (
            <button
              key={ep.path}
              onClick={() => setSelectedEndpoint(idx)}
              className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                selectedEndpoint === idx
                  ? 'bg-indigo-500/20 border-indigo-400/40 text-white'
                  : 'bg-black/30 border-white/[0.06] text-slate-400 hover:text-white'
              }`}
            >
              <div>
                <div className="text-xs font-medium text-slate-200">{ep.label}</div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">{ep.path}</div>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                  ep.method === 'GET'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/20 text-amber-300'
                }`}
              >
                {ep.method}
              </span>
            </button>
          ))}
        </div>

        <div className="lg:col-span-7 rounded-xl bg-black/60 border border-white/[0.08] p-4 flex flex-col justify-between min-h-[280px]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08] text-xs font-mono">
            <span className="text-slate-400">
              {endpoints[selectedEndpoint].method} {endpoints[selectedEndpoint].path}
            </span>
            {statusCode && (
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-slate-400">
                  <Clock className="w-3 h-3" />
                  {latencyMs}ms
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${
                    statusCode >= 200 && statusCode < 300
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {statusCode >= 200 && statusCode < 300 ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : (
                    <AlertTriangle className="w-3 h-3" />
                  )}
                  HTTP {statusCode}
                </span>
              </div>
            )}
          </div>

          <pre className="text-xs font-mono text-indigo-200 overflow-x-auto max-h-72 leading-relaxed">
            {responsePayload
              ? JSON.stringify(responsePayload, null, 2)
              : 'Click "Send Request" to inspect the live ASP.NET Core response payload.'}
          </pre>
        </div>
      </div>
    </section>
  );
}
