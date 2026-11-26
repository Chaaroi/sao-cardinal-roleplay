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
            ? 'border-[#e3a024]/70 bg-[#121923]/95 text-amber-100'
            : alert.variant === 'affection'
              ? 'border-rose-300/45 bg-[#121923]/95 text-rose-100'
              : alert.variant === 'warning'
                ? 'border-amber-400/55 bg-[#121923]/95 text-amber-100'
                : 'border-slate-300/25 bg-[#121923]/95 text-slate-100'

        const badgeColor =
          alert.variant === 'marriage'
            ? 'border-[#e3a024]/50 bg-[#e3a024]/15 text-[#f0c05e]'
            : alert.variant === 'affection'
              ? 'border-rose-300/35 bg-rose-400/12 text-rose-200'
              : alert.variant === 'warning'
                ? 'border-amber-400/40 bg-amber-400/12 text-amber-200'
                : 'border-slate-300/20 bg-white/[0.05] text-slate-200'

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
            className={`pointer-events-auto animate-alert-pop rounded-md border px-4 py-3 shadow-[0_14px_32px_rgba(3,7,14,0.65)] backdrop-blur-md ${styles}`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded border ${badgeColor}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-hud text-[11px] font-bold tracking-[0.14em] uppercase opacity-90">
                  [{alert.title}]
                </div>
                <p className="mt-0.5 text-sm leading-snug font-medium text-slate-100">{alert.message}</p>
              </div>
              <button
                onClick={() => onDismiss(alert.id)}
                className="rounded p-1 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
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
