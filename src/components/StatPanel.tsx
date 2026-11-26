import { Activity, Plus, RotateCcw, Sparkles } from 'lucide-react'
import type { CharacterStatState, StatKey, WeaponType } from '../types/game'
import {
  computeDerivedStats,
  ensureCharacterStats,
  inferCombatArchetype,
  STAT_META,
} from '../utils/statSystem'

interface StatPanelProps {
  stats?: CharacterStatState
  level: number
  weapon: WeaponType
  onAllocateStat: (stat: StatKey, amount: number) => void
  onResetStats: () => void
}

export function StatPanel({
  stats,
  level,
  weapon,
  onAllocateStat,
  onResetStats,
}: StatPanelProps) {
  const activeStats = ensureCharacterStats(stats, level, weapon)
  const derived = computeDerivedStats(activeStats, level)
  const archetype = inferCombatArchetype(activeStats)
  const hasPoints = activeStats.statPoints > 0

  return (
    <div className="space-y-4">
      {/* Header Summary Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-100">
            <Activity className="h-3.5 w-3.5 text-[#e3a024]" />
            <span>{archetype}</span>
          </div>
          <div className="mt-0.5 text-[11px] text-slate-500">Lv.{level} · {weapon}</div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`font-hud flex items-center gap-1 rounded border px-2.5 py-1 text-[11px] font-bold transition ${
              hasPoints
                ? 'border-[#e3a024]/60 bg-[#e3a024]/15 text-amber-200'
                : 'border-slate-300/12 bg-white/[0.02] text-slate-400'
            }`}
          >
            {hasPoints && <Sparkles className="h-3 w-3 text-[#e3a024]" />}
            <span>แต้มอัปเกรด: {activeStats.statPoints}</span>
          </div>

          {activeStats.spentPoints > 0 && (
            <button
              type="button"
              onClick={onResetStats}
              title="รีเซ็ตแต้ม Stat ทั้งหมดคืน"
              className="flex items-center gap-1 rounded border border-slate-300/15 bg-white/[0.03] px-2 py-1 text-[10px] text-slate-300 hover:border-rose-400/40 hover:bg-rose-500/15 hover:text-rose-200"
            >
              <RotateCcw className="h-3 w-3" />
              รีเซ็ต
            </button>
          )}
        </div>
      </div>

      {/* 6 Primary Attributes */}
      <div className="grid grid-cols-2 gap-2">
        {STAT_META.map((meta) => {
          const val = activeStats.attributes[meta.key]
          return (
            <div
              key={meta.key}
              className="flex flex-col justify-between rounded border border-slate-300/10 bg-white/[0.025] px-2.5 py-2 transition hover:border-slate-300/25"
            >
              <div className="flex items-center justify-between gap-1">
                <div>
                  <span className={`font-hud text-xs font-bold ${meta.colorClass}`}>
                    {meta.key}
                  </span>
                  <span className="ml-1.5 text-[10px] text-slate-400">{meta.label}</span>
                </div>
                <span className="font-hud text-sm font-bold text-slate-100">{val}</span>
              </div>

              <div className="mt-1.5 flex items-center justify-between gap-1">
                <span className="truncate text-[9px] text-slate-500" title={meta.effectDesc}>
                  {meta.effectDesc}
                </span>

                <div className="flex shrink-0 items-center gap-1">
                  {activeStats.statPoints >= 5 && (
                    <button
                      type="button"
                      onClick={() => onAllocateStat(meta.key, 5)}
                      className="rounded border border-[#e3a024]/50 bg-[#e3a024]/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-200 transition hover:bg-[#e3a024]/30"
                      title={`อัป ${meta.key} +5`}
                    >
                      +5
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={!hasPoints}
                    onClick={() => onAllocateStat(meta.key, 1)}
                    className={`flex h-5 w-5 items-center justify-center rounded border text-xs font-bold transition ${
                      hasPoints
                        ? 'border-slate-300/35 bg-white/10 text-slate-100 hover:border-[#e3a024] hover:bg-[#e3a024]/25'
                        : 'cursor-not-allowed border-slate-300/10 bg-transparent text-slate-600'
                    }`}
                    aria-label={`อัป ${meta.key} +1`}
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Derived Combat Power */}
      <div className="mt-3 grid grid-cols-5 gap-1.5 rounded border border-slate-300/10 bg-[#0b1018] px-2.5 py-2 text-center">
        <div>
          <div className="text-[9px] text-slate-500">ATK</div>
          <div className="font-hud text-[11px] font-bold text-slate-200">{derived.physAtk}</div>
        </div>
        <div>
          <div className="text-[9px] text-slate-500">SKILL</div>
          <div className="font-hud text-[11px] font-bold text-slate-200">{derived.skillAtk}</div>
        </div>
        <div>
          <div className="text-[9px] text-slate-500">DEF</div>
          <div className="font-hud text-[11px] font-bold text-slate-200">{derived.def}</div>
        </div>
        <div>
          <div className="text-[9px] text-slate-500">CRIT</div>
          <div className="font-hud text-[11px] font-bold text-amber-300">{derived.critPct}%</div>
        </div>
        <div>
          <div className="text-[9px] text-slate-500">EVA</div>
          <div className="font-hud text-[11px] font-bold text-emerald-300">{derived.evaPct}%</div>
        </div>
      </div>
    </div>
  )
}
