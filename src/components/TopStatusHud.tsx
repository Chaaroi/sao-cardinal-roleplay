import {
  Calendar,
  Coins,
  Cpu,
  Heart,
  LogOut,
  MapPin,
  Settings,
  ShieldAlert,
  Zap,
} from 'lucide-react'
import { PRESET_GEMINI_MODELS } from '../types/game'
import type { GeminiModel, GameSession } from '../types/game'
import { CharacterAvatar } from './CharacterAvatar'
import { OstControlPill } from './OstControlPill'
import type { OstControlsState } from './OstControlPill'

interface TopStatusHudProps {
  session: GameSession
  model: GeminiModel
  fastMode: boolean
  demoMode: boolean
  ostControls: OstControlsState
  onToggleModel: (model: GeminiModel) => void
  onToggleFastMode: () => void
  onOpenSettings: () => void
  onExitToTitle: () => void
}

export function TopStatusHud({
  session,
  model,
  fastMode,
  demoMode,
  ostControls,
  onToggleModel,
  onToggleFastMode,
  onOpenSettings,
  onExitToTitle,
}: TopStatusHudProps) {
  const { player, world_arc, location, in_game_date, canon_divergence } = session.worldState
  const hpPercent = player.max_hp > 0 ? Math.max(0, Math.min(100, (player.hp / player.max_hp) * 100)) : 0

  // Classic SAO HP Bar Color Ramp: Green -> Amber -> Crimson
  const hpBarColor =
    hpPercent > 50
      ? 'bg-[#48c764]'
      : hpPercent > 20
        ? 'bg-[#e3a024]'
        : 'bg-[#e5484d] animate-pulse'

  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#0c1119]/95 px-4 py-2 backdrop-blur-md sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Top-Left SAO Player Gauge */}
        <div className="flex min-w-[240px] items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 flex-col items-center justify-center border border-white/15 bg-[#141c29] text-slate-100">
            <span className="font-hud text-[8px] font-semibold tracking-widest text-slate-400">LV</span>
            <span className="font-hud text-sm font-bold leading-none">{player.level}</span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-hud truncate text-sm font-bold tracking-wide text-slate-50">
                {session.profile.name}
              </span>
              <span className="text-[11px] text-slate-400">
                {player.hp}/{player.max_hp}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-[#f0c05e]">
                <Coins className="h-3 w-3 text-[#e3a024]" />
                {player.col.toLocaleString()}
              </span>
              {player.spouse && (
                <span className="hidden items-center gap-1 text-[10px] font-medium text-rose-200 sm:flex">
                  <CharacterAvatar name={player.spouse} size="xs" ringClassName="border-[#e3a024]" />
                  <Heart className="h-2.5 w-2.5 fill-rose-400 text-rose-400" />
                  {player.spouse}
                </span>
              )}
            </div>

            {/* Classic Tapered SAO HP Gauge */}
            <div className="mt-1 flex items-center gap-2">
              <div className="sao-hp-bar h-2.5 w-36 overflow-hidden border border-slate-300/30 bg-[#070b11] p-[1.5px] sm:w-44">
                <div
                  className={`sao-hp-bar h-full transition-all duration-500 ${hpBarColor}`}
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
              {player.status_effects.length > 0 && (
                <span
                  title={player.status_effects.join(' • ')}
                  className="hidden items-center gap-1 text-[10px] text-slate-400 md:flex"
                >
                  <ShieldAlert className="h-3 w-3 text-[#e3a024]" />
                  <span className="max-w-[110px] truncate">{player.status_effects[0]}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: World Coordinates */}
        <div className="hidden max-w-[300px] items-center gap-2 text-xs text-slate-300 2xl:flex">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-[#e3a024]" />
          <span className="truncate font-medium">
            {world_arc} — {location}
          </span>
          <span className="text-slate-600">·</span>
          <span className="flex shrink-0 items-center gap-1 text-[11px] text-slate-400">
            <Calendar className="h-3 w-3" />
            {in_game_date}
          </span>
        </div>

        {/* Right: Clean Single-Row Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Model Selector */}
          <div className="flex items-center rounded border border-white/[0.1] bg-[#090d14] px-2 py-1 text-[11px]">
            <Cpu className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
            <select
              value={model}
              onChange={(e) => onToggleModel(e.target.value)}
              aria-label="เลือกโมเดล Gemini"
              className="max-w-[120px] cursor-pointer truncate bg-transparent font-medium text-slate-200 focus:outline-none"
            >
              {PRESET_GEMINI_MODELS.map((m) => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-slate-100">
                  {m.label}
                </option>
              ))}
              {!PRESET_GEMINI_MODELS.some((m) => m.id === model) && (
                <option value={model} className="bg-slate-900 text-slate-100">
                  {model}
                </option>
              )}
            </select>
          </div>

          <button
            type="button"
            onClick={onToggleFastMode}
            title="สลับความเร็วการตอบ (Fast / Deep)"
            className={`flex items-center gap-1 rounded border px-2 py-1.5 text-[11px] font-medium transition ${
              fastMode
                ? 'border-emerald-400/35 bg-emerald-500/10 text-emerald-200'
                : 'border-white/[0.1] bg-white/[0.03] text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="h-3 w-3" />
            {fastMode ? 'Fast' : 'Deep'}
          </button>

          <OstControlPill ost={ostControls} compact />

          {demoMode && (
            <span
              title="กำลังใช้ Offline Demo Mode"
              className="hidden rounded border border-[#e3a024]/35 bg-[#e3a024]/10 px-2 py-1 text-[10px] font-medium text-amber-200 sm:inline"
            >
              Demo
            </span>
          )}

          <button
            type="button"
            onClick={onOpenSettings}
            title={`ตั้งค่า & เซฟเกม (${canon_divergence})`}
            className="flex items-center gap-1.5 rounded border border-white/[0.12] bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/[0.08]"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">ตั้งค่า / เซฟ</span>
          </button>

          <button
            type="button"
            onClick={onExitToTitle}
            className="flex items-center gap-1 rounded border border-white/[0.1] bg-white/[0.02] px-2.5 py-1.5 text-xs text-slate-400 transition hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-200"
            title="กลับหน้าหลัก"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Compact Location Bar for smaller screens */}
      <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-1 text-[11px] text-slate-400 2xl:hidden">
        <span className="flex items-center gap-1 truncate">
          <MapPin className="h-3 w-3 shrink-0 text-[#e3a024]" />
          <span className="truncate">{world_arc} · {location}</span>
        </span>
        <span>{in_game_date}</span>
      </div>
    </header>
  )
}
