import {
  Calendar,
  Coins,
  Cpu,
  GitBranch,
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

interface TopStatusHudProps {
  session: GameSession
  model: GeminiModel
  fastMode: boolean
  demoMode: boolean
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
    <header className="sticky top-0 z-30 border-b border-slate-200/12 bg-[#121923]/92 backdrop-blur-md px-3 py-2.5 sm:px-6">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3">
        {/* Top-Left Authentic SAO HP Bar */}
        <div className="flex min-w-[270px] flex-1 items-center gap-3">
          {/* Level Plaque */}
          <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded border border-slate-300/25 bg-[#1b2433] text-slate-100">
            <span className="font-hud text-[9px] font-semibold tracking-widest text-slate-400">LV</span>
            <span className="font-hud text-base font-bold leading-none">{player.level}</span>
          </div>

          <div className="min-w-0 flex-1 max-w-md">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-hud truncate text-sm font-bold tracking-wide text-slate-50">
                {session.profile.name}
              </span>
              <span className="rounded border border-slate-300/15 bg-white/5 px-1.5 py-0.5 text-[10px] text-slate-300">
                {session.profile.weapon}
              </span>
              {player.spouse && (
                <span className="flex items-center gap-1.5 rounded-full border border-[#e3a024]/50 bg-[#e3a024]/15 py-0.5 pl-0.5 pr-2 text-[10px] font-medium text-amber-200">
                  <CharacterAvatar name={player.spouse} size="xs" ringClassName="border-[#e3a024]" />
                  <Heart className="h-2.5 w-2.5 fill-[#e3a024] text-[#e3a024]" />
                  {player.spouse}
                </span>
              )}
            </div>

            {/* Classic Tapered SAO HP Gauge */}
            <div className="mt-1.5 flex items-center gap-2.5">
              <div className="sao-hp-bar h-3 flex-1 overflow-hidden border border-slate-300/35 bg-[#090d14] p-[2px]">
                <div
                  className={`sao-hp-bar h-full transition-all duration-500 ${hpBarColor}`}
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
              <span className="font-hud shrink-0 text-xs font-semibold text-slate-200">
                {player.hp} <span className="text-slate-500">/ {player.max_hp}</span>
              </span>
            </div>

            {/* Col + Status Effects */}
            <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-medium text-amber-300/90">
                <Coins className="h-3 w-3" />
                {player.col.toLocaleString()} Col
              </span>
              {player.status_effects.length > 0 && (
                <span className="flex items-center gap-1 text-slate-300">
                  <ShieldAlert className="h-3 w-3 text-[#e3a024]" />
                  {player.status_effects.join(' • ')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: World Coordinates & Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <div className="hidden rounded border border-slate-300/12 bg-white/[0.03] px-3 py-1.5 text-xs xl:block">
            <div className="flex items-center gap-3 text-slate-200">
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="h-3.5 w-3.5 text-[#e3a024]" />
                {world_arc} — {location}
              </span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                {in_game_date}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400">
              <GitBranch className="h-3 w-3 text-slate-500" />
              <span>Canon Divergence: {canon_divergence}</span>
            </div>
          </div>

          {/* Model Selector */}
          <div className="flex items-center rounded border border-slate-300/15 bg-[#0b1018] px-2 py-1 text-[11px]">
            <Cpu className="mr-1.5 h-3.5 w-3.5 text-slate-400" />
            <select
              value={model}
              onChange={(e) => onToggleModel(e.target.value)}
              aria-label="เลือกโมเดล Gemini"
              className="cursor-pointer bg-transparent font-medium text-slate-200 focus:outline-none"
            >
              {PRESET_GEMINI_MODELS.map((m) => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-slate-100">
                  {m.label} ({m.id})
                </option>
              ))}
              {!PRESET_GEMINI_MODELS.some((m) => m.id === model) && (
                <option value={model} className="bg-slate-900 text-slate-100">
                  Custom: {model}
                </option>
              )}
            </select>
          </div>

          <button
            type="button"
            onClick={onToggleFastMode}
            title="ลด Thinking Budget เพื่อให้ AI ตอบเร็วขึ้น"
            className={`flex items-center gap-1 rounded border px-2.5 py-1.5 text-[11px] font-medium transition ${
              fastMode
                ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
                : 'border-slate-300/15 bg-white/[0.03] text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="h-3 w-3" />
            {fastMode ? 'Fast' : 'Deep'}
          </button>

          {demoMode && (
            <span className="rounded border border-[#e3a024]/40 bg-[#e3a024]/15 px-2 py-1 text-[10px] font-semibold text-amber-200">
              DEMO
            </span>
          )}

          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 rounded border border-slate-300/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Save / Settings</span>
          </button>

          <button
            type="button"
            onClick={onExitToTitle}
            className="flex items-center gap-1 rounded border border-slate-300/15 bg-white/[0.03] px-2.5 py-1.5 text-xs text-slate-300 transition hover:border-rose-400/40 hover:bg-rose-500/15 hover:text-rose-200"
            title="กลับหน้า Link Start"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Compact Location Bar for smaller screens */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/10 pt-1.5 text-[11px] text-slate-300 xl:hidden">
        <span className="flex items-center gap-1">
          <MapPin className="h-3 w-3 text-[#e3a024]" />
          {world_arc} • {location}
        </span>
        <span className="text-slate-400">{in_game_date}</span>
      </div>
    </header>
  )
}
