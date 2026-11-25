import { AlertTriangle, Heart, Info, Sparkles, X } from 'lucide-react'
import type { SystemAlertItem } from '../types/game'

interface SystemAlertOverlayProps {
  alerts: SystemAlertItem[]
  onDismiss: (id: string) => void
}

export function SystemAlertOverlay({ alerts, onDismiss }: SystemAlertOverlayProps) {
  if (alerts.length === 0) return null

  return (
    <div className="pointer-events-none fixed top-20 left-1/2 z-50 flex w-full max-w-md -translate-x-1/2 flex-col gap-2 px-3">
      {alerts.map((alert) => {
        const styles =
          alert.variant === 'marriage'
            ? 'border-amber-300/80 bg-gradient-to-r from-amber-500/25 via-slate-900/90 to-amber-500/20 text-amber-100 shadow-[0_0_25px_rgba(251,191,36,0.35)]'
            : alert.variant === 'affection'
              ? 'border-pink-300/75 bg-gradient-to-r from-pink-500/25 via-slate-900/90 to-cyan-500/15 text-pink-100 shadow-[0_0_22px_rgba(244,114,182,0.3)]'
              : alert.variant === 'warning'
                ? 'border-orange-400/80 bg-gradient-to-r from-orange-500/25 via-slate-900/90 to-red-500/20 text-orange-100 shadow-[0_0_22px_rgba(251,146,60,0.3)]'
                : 'border-cyan-300/75 bg-gradient-to-r from-cyan-500/25 via-slate-900/90 to-slate-800/85 text-cyan-50 shadow-[0_0_22px_rgba(56,189,248,0.28)]'

        const Icon =
          alert.variant === 'marriage'
            ? Sparkles
            : alert.variant === 'affection'
              ? Heart
              : alert.variant === 'warning'
                ? AlertTriangle
                : Info

        return (
          <div
            key={alert.id}
            className={`pointer-events-auto animate-alert-pop rounded-md border backdrop-blur-xl px-4 py-3 ${styles}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-hud text-[11px] font-bold tracking-widest uppercase opacity-90">
                  [{alert.title}]
                </div>
                <p className="mt-0.5 text-sm leading-snug font-medium">{alert.message}</p>
              </div>
              <button
                onClick={() => onDismiss(alert.id)}
                className="rounded p-1 opacity-60 transition hover:bg-white/10 hover:opacity-100"
                aria-label="ปิดการแจ้งเตือน"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
