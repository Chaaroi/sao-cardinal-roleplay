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

  const hpBarColor =
    hpPercent > 50
      ? 'from-emerald-400 via-green-400 to-emerald-500 shadow-[0_0_14px_rgba(52,211,153,0.55)]'
      : hpPercent > 20
        ? 'from-yellow-300 via-amber-400 to-orange-400 shadow-[0_0_14px_rgba(251,191,36,0.55)]'
        : 'from-rose-500 via-red-500 to-red-600 shadow-[0_0_18px_rgba(239,68,68,0.8)] animate-pulse'

  return (
    <header className="sao-panel sticky top-0 z-30 border-x-0 border-t-0 px-3 py-2.5 sm:px-5">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3">
        {/* Top-Left Classic SAO HP Bar + Player Stats */}
        <div className="flex min-w-[270px] flex-1 items-center gap-3">
          {/* Hex Level Badge */}
          <div className="sao-hex flex h-12 w-12 shrink-0 flex-col items-center justify-center bg-gradient-to-br from-cyan-400/35 to-sky-700/60 text-white shadow-[0_0_16px_rgba(56,189,248,0.35)]">
            <span className="font-hud text-[9px] tracking-widest text-cyan-200">LV</span>
            <span className="font-hud text-base font-extrabold leading-none">{player.level}</span>
          </div>

          <div className="min-w-0 flex-1 max-w-md">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-hud truncate text-sm font-bold tracking-wide text-white">
                {session.profile.name}
              </span>
              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-cyan-200">
                {session.profile.weapon}
              </span>
              {player.spouse && (
                <span className="flex items-center gap-1.5 rounded-full border border-amber-300/60 bg-amber-400/20 py-0.5 pl-0.5 pr-2 text-[10px] font-semibold text-amber-200">
                  <CharacterAvatar name={player.spouse} size="xs" ringClassName="border-amber-300" />
                  <Heart className="h-2.5 w-2.5 fill-amber-300 text-amber-300" />
                  Married: {player.spouse}
                </span>
              )}
            </div>

            {/* Skewed SAO HP Gauge */}
            <div className="mt-1.5 flex items-center gap-2.5">
              <div className="sao-hp-skew h-3.5 flex-1 overflow-hidden border border-white/40 bg-slate-950/75 p-0.5">
                <div
                  className={`h-full bg-gradient-to-r transition-all duration-500 ${hpBarColor}`}
                  style={{ width: `${hpPercent}%` }}
                />
              </div>
              <span className="font-hud shrink-0 text-xs font-bold text-slate-100">
                {player.hp} <span className="text-slate-400">/ {player.max_hp}</span>
              </span>
            </div>

            {/* Col + Status Effects */}
            <div className="mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-300">
              <span className="flex items-center gap-1 font-semibold text-amber-300">
                <Coins className="h-3 w-3" />
                {player.col.toLocaleString()} Col
              </span>
              {player.status_effects.length > 0 && (
                <span className="flex items-center gap-1 text-cyan-200">
                  <ShieldAlert className="h-3 w-3" />
                  {player.status_effects.join(' • ')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center/Right: World Coordinates & Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="sao-panel-light hidden rounded-lg px-3 py-1.5 text-xs xl:block">
            <div className="flex items-center gap-3 text-cyan-100">
              <span className="flex items-center gap-1 font-semibold">
                <MapPin className="h-3.5 w-3.5 text-cyan-300" />
                {world_arc} — {location}
              </span>
              <span className="text-white/30">|</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Calendar className="h-3.5 w-3.5 text-cyan-300" />
                {in_game_date}
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-300">
              <GitBranch className="h-3 w-3 text-amber-300" />
              <span>Canon Divergence: {canon_divergence}</span>
            </div>
          </div>

          {/* Model Quick Switcher */}
          <div className="flex items-center rounded-lg border border-cyan-200/25 bg-slate-950/60 px-2 py-1 text-[11px]">
            <Cpu className="mr-1.5 h-3.5 w-3.5 text-cyan-300" />
            <select
              value={model}
              onChange={(e) => onToggleModel(e.target.value)}
              aria-label="เลือกโมเดล Gemini"
              className="bg-transparent font-semibold text-cyan-100 focus:outline-none cursor-pointer"
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
            title="ลด Thinking Budget เพื่อให้ AI ตอบเร็วขึ้นมาก"
            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold transition ${
              fastMode
                ? 'border-emerald-300/50 bg-emerald-500/20 text-emerald-100'
                : 'border-white/15 bg-slate-900/50 text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="h-3.5 w-3.5" />
            {fastMode ? 'Fast' : 'Deep'}
          </button>

          {demoMode && (
            <span className="rounded-full border border-amber-300/50 bg-amber-400/20 px-2.5 py-1 text-[10px] font-bold text-amber-200">
              DEMO
            </span>
          )}

          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-200/30 bg-white/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-white/20"
          >
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Save / Settings</span>
          </button>

          <button
            type="button"
            onClick={onExitToTitle}
            className="flex items-center gap-1 rounded-lg border border-rose-300/30 bg-rose-500/15 px-2.5 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/30"
            title="กลับหน้า Link Start"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Compact Location Bar for smaller screens */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-1.5 text-[11px] text-cyan-100 xl:hidden">
        <span className="flex items-center gap-1 font-medium">
          <MapPin className="h-3 w-3 text-cyan-300" />
          {world_arc} • {location}
        </span>
        <span className="text-slate-300">{in_game_date}</span>
      </div>
    </header>
  )
}
