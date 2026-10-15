import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onDismiss }) {
  if (!toast) return null;

  const styles = {
    success: 'border-emerald-500/40 bg-emerald-950/80 text-emerald-200',
    error: 'border-rose-500/40 bg-rose-950/80 text-rose-200',
    info: 'border-indigo-500/40 bg-indigo-950/80 text-indigo-200'
  };

  const Icon =
    toast.type === 'error'
      ? AlertCircle
      : toast.type === 'info'
      ? Info
      : CheckCircle2;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md animate-bounce">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl backdrop-blur-2xl border shadow-2xl text-xs font-mono ${
          styles[toast.type] || styles.success
        }`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="flex-1">{toast.message}</span>
        <button onClick={onDismiss} className="p-1 hover:bg-white/10 rounded-lg">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
