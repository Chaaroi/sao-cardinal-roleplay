import { useState } from 'react'
import {
  ChevronDown,
  ExternalLink,
  Music,
  RotateCcw,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react'
import {
  getTracksForSituation,
  OST_SITUATION_LABELS,
  SAO_OST_PLAYLIST_URL,
  SAO_OST_TRACKS,
} from '../data/saoOstCatalog'
import type { OstSituation, OstTrack } from '../data/saoOstCatalog'

export interface OstControlsState {
  enabled: boolean
  volume: number
  isPlaying: boolean
  activeSituation: OstSituation
  manualSituation: OstSituation | null
  currentTrack: OstTrack
  onToggleEnabled: () => void
  onChangeVolume: (vol: number) => void
  onNextTrack: () => void
  onSelectSituation: (situation: OstSituation | null) => void
  onSelectTrack: (track: OstTrack) => void
}

interface OstControlPillProps {
  ost: OstControlsState
  compact?: boolean
}

const ALL_SITUATIONS: OstSituation[] = [
  'town',
  'combat',
  'danger',
  'romance_daily',
  'romance',
  'marriage',
  'shop',
  'victory',
  'sorrow',
  'exploration_alo',
  'combat_alo',
  'combat_ggo',
  'title',
]

export function OstControlPill({ ost, compact = false }: OstControlPillProps) {
  const [isOpen, setIsOpen] = useState(false)
  const moodTracks = getTracksForSituation(ost.activeSituation)

  return (
    <div className="relative">
      <div className="flex items-center rounded border border-slate-300/18 bg-[#0b1018]">
        {/* Explicit ON / OFF Toggle */}
        <button
          type="button"
          onClick={ost.onToggleEnabled}
          title={ost.enabled ? 'ปิดเพลง SAO OST' : 'เปิดเพลง SAO OST ตามสถานการณ์'}
          className={`flex items-center gap-1.5 rounded-l px-2.5 py-1.5 text-[11px] font-semibold transition ${
            ost.enabled
              ? 'bg-[#e3a024]/15 text-[#f0c05e] hover:bg-[#e3a024]/25'
              : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
          }`}
        >
          {ost.enabled ? (
            <Volume2 className={`h-3.5 w-3.5 ${ost.isPlaying ? 'text-[#e3a024]' : 'text-amber-200/70'}`} />
          ) : (
            <VolumeX className="h-3.5 w-3.5 text-slate-500" />
          )}
          <span className="font-hud tracking-wider uppercase">
            OST {ost.enabled ? 'ON' : 'OFF'}
          </span>
        </button>

        {/* Situation + Track Drawer Trigger */}
        {ost.enabled && (
          <>
            <button
              type="button"
              onClick={() => setIsOpen((v) => !v)}
              title={`กำลังเล่น: ${ost.currentTrack.title} (${OST_SITUATION_LABELS[ost.activeSituation]})`}
              className="flex items-center gap-1.5 border-l border-slate-300/12 px-2.5 py-1.5 text-[11px] text-slate-200 transition hover:bg-white/[0.05]"
            >
              {!compact && (
                <span className="hidden rounded bg-white/[0.06] px-1.5 py-0.5 font-hud text-[9px] font-bold tracking-wider text-slate-300 sm:inline">
                  {OST_SITUATION_LABELS[ost.activeSituation]}
                </span>
              )}
              <span className="max-w-[120px] truncate font-medium text-slate-100">
                {ost.currentTrack.title}
              </span>
              <ChevronDown className="h-3 w-3 shrink-0 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={ost.onNextTrack}
              title="เปลี่ยนเพลงถัดไปในสถานการณ์นี้"
              className="border-l border-slate-300/12 px-2 py-1.5 text-slate-400 transition hover:bg-white/[0.05] hover:text-white"
              aria-label="เพลงถัดไป"
            >
              <SkipForward className="h-3.5 w-3.5" />
            </button>
          </>
        )}
      </div>

      {/* Expandable Mixer / Playlist Popover */}
      {isOpen && ost.enabled && (
        <div className="sao-panel absolute right-0 z-50 mt-2 w-80 rounded-lg border border-slate-300/20 p-3.5 shadow-[0_18px_40px_rgba(3,7,14,0.85)]">
          <div className="flex items-center justify-between border-b border-slate-300/12 pb-2.5">
            <div className="flex items-center gap-1.5">
              <Music className="h-3.5 w-3.5 text-[#e3a024]" />
              <span className="font-hud text-[11px] font-bold tracking-[0.12em] text-white uppercase">
                SAO Dynamic OST Player
              </span>
            </div>
            <a
              href={SAO_OST_PLAYLIST_URL}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-[10px] text-slate-400 transition hover:text-[#f0c05e]"
            >
              YouTube Playlist ({SAO_OST_TRACKS.length})
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>

          {/* Current Track Status */}
          <div className="mt-2.5 rounded border border-slate-300/12 bg-[#0b1018] p-2.5">
            <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400">
              <span className="font-hud font-bold tracking-wider text-[#f0c05e]">
                {ost.manualSituation ? 'MANUAL MOOD' : 'AUTO SCENE'} • {OST_SITUATION_LABELS[ost.activeSituation]}
              </span>
              <span className={ost.isPlaying ? 'text-emerald-300' : 'text-amber-200'}>
                {ost.isPlaying ? 'Playing' : 'คลิกปุ่มใดก็ได้เพื่อเริ่มเสียง'}
              </span>
            </div>
            <div className="mt-1 truncate text-xs font-semibold text-white">
              {ost.currentTrack.title}
            </div>
          </div>

          {/* Volume Control */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span>ระดับเสียง (Volume)</span>
              <span className="font-hud font-bold text-[#f0c05e]">{ost.volume}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={ost.volume}
              onChange={(e) => ost.onChangeVolume(Number(e.target.value))}
              className="mt-1 h-1.5 w-full cursor-pointer accent-[#e3a024]"
            />
          </div>

          {/* Auto vs Manual Mood Selector */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-slate-300">
              <span>โหมดเลือกอารมณ์เพลง</span>
              {ost.manualSituation && (
                <button
                  type="button"
                  onClick={() => ost.onSelectSituation(null)}
                  className="flex items-center gap-1 text-[10px] text-[#f0c05e] hover:underline"
                >
                  <RotateCcw className="h-2.5 w-2.5" />
                  กลับเป็นอัตโนมัติ
                </button>
              )}
            </div>
            <select
              value={ost.manualSituation ?? 'auto'}
              onChange={(e) => {
                const v = e.target.value
                ost.onSelectSituation(v === 'auto' ? null : (v as OstSituation))
              }}
              className="mt-1 w-full rounded border border-slate-300/20 bg-[#0b1018] px-2.5 py-1.5 text-xs text-slate-100 focus:border-[#e3a024] focus:outline-none"
            >
              <option value="auto" className="bg-[#0d131c]">
                อัตโนมัติตามสถานการณ์ในเกม (Auto)
              </option>
              {ALL_SITUATIONS.map((sit) => (
                <option key={sit} value={sit} className="bg-[#0d131c]">
                  {OST_SITUATION_LABELS[sit]}
                </option>
              ))}
            </select>
          </div>

          {/* Track Picker for Active Mood */}
          <div className="mt-3">
            <div className="mb-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
              เพลงในสถานการณ์นี้ ({moodTracks.length})
            </div>
            <div className="max-h-36 space-y-1 overflow-y-auto pr-1">
              {moodTracks.map((t) => {
                const active = t.videoId === ost.currentTrack.videoId
                return (
                  <button
                    key={t.videoId}
                    type="button"
                    onClick={() => ost.onSelectTrack(t)}
                    className={`flex w-full items-center justify-between rounded border px-2.5 py-1.5 text-left text-[11px] transition ${
                      active
                        ? 'border-[#e3a024]/70 bg-[#e3a024]/15 font-semibold text-white'
                        : 'border-slate-300/10 bg-[#0b1018] text-slate-300 hover:border-slate-300/30'
                    }`}
                  >
                    <span className="truncate">{t.title}</span>
                    {active && <span className="text-[9px] text-[#f0c05e]">NOW</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
