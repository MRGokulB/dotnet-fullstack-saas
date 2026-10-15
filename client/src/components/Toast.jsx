import React from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 max-w-md w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start space-x-3 p-4 rounded-xl shadow-2xl backdrop-blur-xl border transition-all duration-300 transform translate-y-0 ${
            toast.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-100'
              : toast.type === 'error'
              ? 'bg-rose-950/80 border-rose-500/40 text-rose-100'
              : 'bg-indigo-950/80 border-indigo-500/40 text-indigo-100'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />}
          {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-400 flex-shrink-0 mt-0.5" />}
          {toast.type === 'info' && <Info className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />}
          <div className="flex-1 text-xs">
            {toast.title && <div className="font-semibold text-white mb-0.5">{toast.title}</div>}
            <div className="opacity-90">{toast.message}</div>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-white/60 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
