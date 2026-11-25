import { useMemo, useState } from 'react'
import { ArrowRight, CheckCircle2, Heart, Lock, Sparkles, Swords, X } from 'lucide-react'
import type { GameSession, SaveSlotMeta, WeaponType, WorldArc } from '../types/game'
import {
  ALL_WORLD_ARCS,
  createTransferredSession,
  getArcTransferEligibility,
  getOriginRoute,
} from '../utils/arcTransfer'
import { CharacterAvatar } from './CharacterAvatar'

interface ArcTransferModalProps {
  currentSession: GameSession | null
  autoSaveSession: GameSession | null
  saveSlots: SaveSlotMeta[]
  onConfirmTransfer: (transferredSession: GameSession) => void
  onClose: () => void
}

const WEAPON_OPTIONS: WeaponType[] = [
  'One-Handed Sword',
  'Rapier',
  'Dagger',
  'Katana',
  'Two-Handed Sword',
  'Spear / Halberd',
  'Gun & Photon Sword',
  'Mace / Hammer',
]

export function ArcTransferModal({
  currentSession,
  autoSaveSession,
  saveSlots,
  onConfirmTransfer,
  onClose,
}: ArcTransferModalProps) {
  const sourceOptions = useMemo(() => {
    const list: { id: string; label: string; session: GameSession }[] = []
    if (currentSession) {
      list.push({
        id: 'current',
        label: `เกมที่กำลังเล่น: ${currentSession.profile.name} (${currentSession.profile.startingArc})`,
        session: currentSession,
      })
    }
    if (autoSaveSession && autoSaveSession.id !== currentSession?.id) {
      list.push({
        id: 'autosave',
        label: `เซฟล่าสุด (Auto-Save): ${autoSaveSession.profile.name} (${autoSaveSession.profile.startingArc})`,
        session: autoSaveSession,
      })
    }
    for (const slot of saveSlots) {
      list.push({
        id: slot.slotId,
        label: `${slot.slotId.toUpperCase()}: ${slot.label}`,
        session: slot.session,
      })
    }
    return list
  }, [autoSaveSession, currentSession, saveSlots])

  const [selectedSourceId, setSelectedSourceId] = useState<string>(
    sourceOptions[0]?.id ?? ''
  )

  const selectedSource =
    sourceOptions.find((s) => s.id === selectedSourceId)?.session ?? sourceOptions[0]?.session ?? null

  const defaultTarget = useMemo<WorldArc | null>(() => {
    if (!selectedSource) return null
    const recommended = ALL_WORLD_ARCS.find(
      (arc) => getArcTransferEligibility(selectedSource, arc).recommended
    )
    if (recommended) return recommended
    return (
      ALL_WORLD_ARCS.find((arc) => getArcTransferEligibility(selectedSource, arc).allowed) ?? null
    )
  }, [selectedSource])

  const [targetArc, setTargetArc] = useState<WorldArc | null>(defaultTarget)
  const [weapon, setWeapon] = useState<WeaponType>(
    selectedSource?.profile.weapon ?? 'One-Handed Sword'
  )

  const handleSelectSource = (id: string) => {
    setSelectedSourceId(id)
    const nextSource = sourceOptions.find((s) => s.id === id)?.session
    if (nextSource) {
      setWeapon(nextSource.profile.weapon)
      const nextTarget =
        ALL_WORLD_ARCS.find((arc) => getArcTransferEligibility(nextSource, arc).recommended) ??
        ALL_WORLD_ARCS.find((arc) => getArcTransferEligibility(nextSource, arc).allowed) ??
        null
      setTargetArc(nextTarget)
    }
  }

  const handleConfirm = () => {
    if (!selectedSource || !targetArc) return
    const check = getArcTransferEligibility(selectedSource, targetArc)
    if (!check.allowed) return
    const nextSession = createTransferredSession(selectedSource, targetArc, weapon)
    onConfirmTransfer(nextSession)
    onClose()
  }

  const knownChars = selectedSource ? Object.values(selectedSource.knownCharacters) : []
  const originRoute = selectedSource ? getOriginRoute(selectedSource) : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="sao-panel max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl p-6">
        <div className="flex items-center justify-between border-b border-cyan-200/20 pb-3">
          <div>
            <div className="font-hud text-[11px] font-bold tracking-widest text-cyan-300 uppercase">
              The Seed // World Arc Transfer
            </div>
            <h2 className="font-hud text-lg font-bold text-white">
              ย้ายเซฟไปเล่นภาคถัดไป (คงค่าความสัมพันธ์ทั้งหมด)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {sourceOptions.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-300">
            ยังไม่มีเซฟเกมสำหรับโอนย้าย กรุณาเริ่มเล่นและบันทึกเซฟอย่างน้อย 1 ครั้งก่อนครับ
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            {/* Step 1: Select Source Save */}
            <div>
              <label className="font-hud block text-xs font-semibold tracking-wider text-cyan-200 uppercase">
                1. เลือกเซฟต้นทางที่ต้องการย้ายข้อมูล
              </label>
              <select
                value={selectedSourceId}
                onChange={(e) => handleSelectSource(e.target.value)}
                className="mt-2 w-full rounded-lg border border-cyan-200/30 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 focus:outline-none"
              >
                {sourceOptions.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-slate-900">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Carried Over Memory Preview */}
            {selectedSource && (
              <div className="rounded-xl border border-cyan-300/25 bg-slate-950/60 p-4 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold text-white">
                    {selectedSource.profile.name} • Lv.{selectedSource.worldState.player.level} •{' '}
                    <span className="text-cyan-200">{selectedSource.profile.startingArc}</span>
                  </div>
                  {originRoute && (
                    <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] text-amber-200">
                      เส้นทางเริ่มต้น: {originRoute}
                    </span>
                  )}
                </div>

                {selectedSource.worldState.player.spouse && (
                  <div className="mt-2 flex items-center gap-1.5 text-amber-200">
                    <Heart className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
                    <span>คู่สมรสที่จะย้ายตามไป: <strong>{selectedSource.worldState.player.spouse}</strong></span>
                  </div>
                )}

                <div className="mt-2.5">
                  <div className="text-[11px] text-slate-400">
                    ความสัมพันธ์ที่จะโอนย้าย ({knownChars.length} คน):
                  </div>
                  {knownChars.length === 0 ? (
                    <div className="mt-1 text-[11px] text-slate-500">ยังไม่มีตัวละครที่บันทึกไว้</div>
                  ) : (
                    <div className="mt-1.5 flex flex-wrap gap-2">
                      {knownChars.slice(0, 6).map((c) => (
                        <div
                          key={c.name}
                          className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 py-0.5 pl-0.5 pr-2.5 text-[11px]"
                        >
                          <CharacterAvatar name={c.name} size="xs" />
                          <span className="text-slate-100">{c.name}</span>
                          <span className="text-pink-300">({c.affection})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Select Target Arc */}
            {selectedSource && (
              <div>
                <label className="font-hud block text-xs font-semibold tracking-wider text-cyan-200 uppercase">
                  2. เลือกภาคปลายทาง (Aincrad ↔ Progressive ข้ามหากันไม่ได้)
                </label>
                <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                  {ALL_WORLD_ARCS.map((arc) => {
                    const eligibility = getArcTransferEligibility(selectedSource, arc)
                    const isSelected = targetArc === arc && eligibility.allowed
                    return (
                      <button
                        key={arc}
                        type="button"
                        disabled={!eligibility.allowed}
                        onClick={() => setTargetArc(arc)}
                        className={`rounded-lg border p-3 text-left transition ${
                          !eligibility.allowed
                            ? 'cursor-not-allowed border-rose-400/20 bg-slate-950/45 opacity-55'
                            : isSelected
                              ? 'border-cyan-300 bg-cyan-400/20 text-white shadow-[0_0_16px_rgba(56,189,248,0.25)]'
                              : eligibility.recommended
                                ? 'border-emerald-300/45 bg-emerald-500/10 text-slate-100 hover:border-emerald-300'
                                : 'border-white/15 bg-slate-900/50 text-slate-300 hover:border-white/30'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-raj text-sm font-bold">{arc}</span>
                          {!eligibility.allowed ? (
                            <span className="flex items-center gap-1 rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-200">
                              <Lock className="h-2.5 w-2.5" /> ล็อก
                            </span>
                          ) : eligibility.recommended ? (
                            <span className="flex items-center gap-1 rounded bg-emerald-400/25 px-1.5 py-0.5 text-[9px] font-bold text-emerald-200">
                              <Sparkles className="h-2.5 w-2.5" /> แนะนำต่อจากภาคนี้
                            </span>
                          ) : isSelected ? (
                            <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                          ) : null}
                        </div>
                        {!eligibility.allowed && eligibility.reason && (
                          <p className="mt-1 text-[10px] leading-snug text-rose-200/85">
                            {eligibility.reason}
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Weapon Selection for New World */}
            {selectedSource && targetArc && (
              <div>
                <label className="font-hud flex items-center gap-1.5 text-xs font-semibold tracking-wider text-cyan-200 uppercase">
                  <Swords className="h-3.5 w-3.5" />
                  3. อาวุธที่จะใช้ใน {targetArc}
                </label>
                <select
                  value={weapon}
                  onChange={(e) => setWeapon(e.target.value as WeaponType)}
                  className="mt-2 w-full rounded-lg border border-cyan-200/30 bg-slate-950/80 px-3.5 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                >
                  {WEAPON_OPTIONS.map((w) => (
                    <option key={w} value={w} className="bg-slate-900">
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-white/15 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={!selectedSource || !targetArc}
                onClick={handleConfirm}
                className="font-hud flex items-center gap-1.5 rounded-lg border border-cyan-200/70 bg-gradient-to-r from-cyan-500 to-sky-400 px-5 py-2 text-xs font-bold tracking-wider text-slate-950 uppercase disabled:opacity-40"
              >
                <span>Transfer &amp; Link Start</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
