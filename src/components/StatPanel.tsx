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
    <div className="sao-panel rounded-xl p-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-200/20 pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-cyan-300" />
          <div>
            <h3 className="font-hud text-xs font-bold tracking-widest text-cyan-100 uppercase">
              Character Stats
            </h3>
            <div className="text-[10px] text-sky-200/80">{archetype}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`font-hud flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition ${
              hasPoints
                ? 'border-amber-300/80 bg-amber-400/20 text-amber-200 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                : 'border-white/15 bg-slate-900/60 text-slate-400'
            }`}
          >
            {hasPoints && <Sparkles className="h-3 w-3 text-amber-300" />}
            <span>แต้มคงเหลือ: {activeStats.statPoints}</span>
          </div>

          {activeStats.spentPoints > 0 && (
            <button
              type="button"
              onClick={onResetStats}
              title="รีเซ็ตแต้ม Stat ทั้งหมดคืน"
              className="flex items-center gap-1 rounded border border-white/15 bg-white/5 px-2 py-1 text-[10px] text-slate-300 hover:border-rose-300/40 hover:bg-rose-500/15 hover:text-rose-100"
            >
              <RotateCcw className="h-3 w-3" />
              รีเซ็ต
            </button>
          )}
        </div>
      </div>

      {/* 6 Primary Attributes Grid */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {STAT_META.map((meta) => {
          const val = activeStats.attributes[meta.key]
          return (
            <div
              key={meta.key}
              className="flex flex-col justify-between rounded-lg border border-white/10 bg-slate-900/60 px-2.5 py-2 transition hover:border-cyan-300/35"
            >
              <div className="flex items-center justify-between gap-1">
                <div>
                  <span className={`font-hud text-xs font-extrabold ${meta.colorClass}`}>
                    {meta.key}
                  </span>
                  <span className="ml-1.5 text-[10px] text-slate-300">{meta.label}</span>
                </div>
                <span className="font-hud text-sm font-bold text-white">{val}</span>
              </div>

              <div className="mt-1.5 flex items-center justify-between gap-1">
                <span className="truncate text-[9px] text-slate-400" title={meta.effectDesc}>
                  {meta.effectDesc}
                </span>

                <div className="flex shrink-0 items-center gap-1">
                  {activeStats.statPoints >= 5 && (
                    <button
                      type="button"
                      onClick={() => onAllocateStat(meta.key, 5)}
                      className="rounded border border-amber-300/50 bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold text-amber-200 transition hover:bg-amber-400/30"
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
                        ? 'border-cyan-300/60 bg-cyan-500/20 text-cyan-100 hover:bg-cyan-400/40'
                        : 'cursor-not-allowed border-white/10 bg-slate-950/50 text-slate-600'
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

      {/* Derived Combat Power Summary */}
      <div className="mt-3 grid grid-cols-5 gap-1.5 rounded-lg border border-white/10 bg-slate-950/55 px-2.5 py-2 text-center">
        <div>
          <div className="text-[9px] text-slate-400">ATK</div>
          <div className="font-hud text-[11px] font-bold text-rose-200">{derived.physAtk}</div>
        </div>
        <div>
          <div className="text-[9px] text-slate-400">SKILL</div>
          <div className="font-hud text-[11px] font-bold text-sky-200">{derived.skillAtk}</div>
        </div>
        <div>
          <div className="text-[9px] text-slate-400">DEF</div>
          <div className="font-hud text-[11px] font-bold text-amber-200">{derived.def}</div>
        </div>
        <div>
          <div className="text-[9px] text-slate-400">CRIT</div>
          <div className="font-hud text-[11px] font-bold text-pink-200">{derived.critPct}%</div>
        </div>
        <div>
          <div className="text-[9px] text-slate-400">EVA</div>
          <div className="font-hud text-[11px] font-bold text-emerald-200">{derived.evaPct}%</div>
        </div>
      </div>
    </div>
  )
}
