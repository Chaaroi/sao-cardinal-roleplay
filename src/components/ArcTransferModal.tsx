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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06090e]/82 p-4 backdrop-blur-sm">
      <div className="sao-panel max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg p-6">
        <div className="flex items-center justify-between border-b border-slate-300/15 pb-3.5">
          <div>
            <div className="font-hud text-[11px] font-bold tracking-[0.18em] text-[#e3a024] uppercase">
              The Seed // World Arc Transfer
            </div>
            <h2 className="font-hud text-lg font-bold text-white">
              ย้ายเซฟไปเล่นภาคถัดไป (คงค่าความสัมพันธ์ทั้งหมด)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
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
              <label className="font-hud block text-xs font-semibold tracking-[0.12em] text-slate-300 uppercase">
                1. เลือกเซฟต้นทางที่ต้องการย้ายข้อมูล
              </label>
              <select
                value={selectedSourceId}
                onChange={(e) => handleSelectSource(e.target.value)}
                className="mt-2 w-full rounded border border-slate-300/20 bg-[#0b1018] px-3.5 py-2.5 text-xs text-white focus:border-[#e3a024] focus:outline-none"
              >
                {sourceOptions.map((opt) => (
                  <option key={opt.id} value={opt.id} className="bg-[#0d131c]">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Carried Over Memory Preview */}
            {selectedSource && (
              <div className="rounded-md border border-slate-300/15 bg-[#0b1018] p-4 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold text-white">
                    {selectedSource.profile.name} • Lv.{selectedSource.worldState.player.level} •{' '}
                    <span className="text-[#f0c05e]">{selectedSource.profile.startingArc}</span>
                  </div>
                  {originRoute && (
                    <span className="rounded border border-[#e3a024]/30 bg-[#e3a024]/12 px-2 py-0.5 text-[10px] text-[#f0c05e]">
                      เส้นทางเริ่มต้น: {originRoute}
                    </span>
                  )}
                </div>

                {selectedSource.worldState.player.spouse && (
                  <div className="mt-2 flex items-center gap-1.5 text-[#f0c05e]">
                    <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400" />
                    <span>คู่สมรสที่จะย้ายตามไป: <strong className="text-white">{selectedSource.worldState.player.spouse}</strong></span>
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
                          className="flex items-center gap-1.5 rounded-full border border-slate-300/15 bg-white/[0.04] py-0.5 pl-0.5 pr-2.5 text-[11px]"
                        >
                          <CharacterAvatar name={c.name} size="xs" />
                          <span className="text-slate-100">{c.name}</span>
                          <span className="text-rose-300">({c.affection})</span>
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
                <label className="font-hud block text-xs font-semibold tracking-[0.12em] text-slate-300 uppercase">
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
                        className={`rounded-md border p-3 text-left transition ${
                          !eligibility.allowed
                            ? 'cursor-not-allowed border-rose-400/20 bg-[#0b1018]/60 opacity-50'
                            : isSelected
                              ? 'border-[#e3a024] bg-[#e3a024]/15 text-white'
                              : eligibility.recommended
                                ? 'border-emerald-400/40 bg-emerald-500/10 text-slate-100 hover:border-emerald-300/70'
                                : 'border-slate-300/15 bg-[#0b1018] text-slate-300 hover:border-slate-300/35'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-raj text-sm font-bold">{arc}</span>
                          {!eligibility.allowed ? (
                            <span className="flex items-center gap-1 rounded bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-bold text-rose-200">
                              <Lock className="h-2.5 w-2.5" /> ล็อก
                            </span>
                          ) : eligibility.recommended ? (
                            <span className="flex items-center gap-1 rounded bg-emerald-400/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-200">
                              <Sparkles className="h-2.5 w-2.5" /> แนะนำต่อจากภาคนี้
                            </span>
                          ) : isSelected ? (
                            <CheckCircle2 className="h-4 w-4 text-[#e3a024]" />
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
                <label className="font-hud flex items-center gap-1.5 text-xs font-semibold tracking-[0.12em] text-slate-300 uppercase">
                  <Swords className="h-3.5 w-3.5 text-[#e3a024]" />
                  3. อาวุธที่จะใช้ใน {targetArc}
                </label>
                <select
                  value={weapon}
                  onChange={(e) => setWeapon(e.target.value as WeaponType)}
                  className="mt-2 w-full rounded border border-slate-300/20 bg-[#0b1018] px-3.5 py-2 text-xs text-white focus:border-[#e3a024] focus:outline-none"
                >
                  {WEAPON_OPTIONS.map((w) => (
                    <option key={w} value={w} className="bg-[#0d131c]">
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2 border-t border-slate-300/12 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded border border-slate-300/20 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.08]"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={!selectedSource || !targetArc}
                onClick={handleConfirm}
                className="font-hud flex items-center gap-1.5 rounded border border-[#f5be58]/60 bg-[#e3a024] px-5 py-2 text-xs font-bold tracking-wider text-slate-950 uppercase transition hover:bg-[#f0b43c] disabled:opacity-40"
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
