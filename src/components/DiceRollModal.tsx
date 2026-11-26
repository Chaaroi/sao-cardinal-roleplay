import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Dices, Shield, Sparkles, Swords, X, XCircle } from 'lucide-react'
import type { CharacterStatState, DiceChallenge } from '../types/game'
import {
  calculateD20SuccessChance,
  computeEquipmentDiceBonuses,
  computeStatDiceModifiers,
  getChallengeOptions,
} from '../utils/diceSystem'

export interface DiceRollResolution {
  d20: number
  statBonus: number
  equipBonus: number
  total: number
  dc: number
  chosenApproach: string
  outcome: 'CRITICAL SUCCESS' | 'SUCCESS' | 'FAILED' | 'CRITICAL FAIL'
  promptText: string
}

interface DiceRollModalProps {
  challenge: DiceChallenge
  stats: CharacterStatState
  equippedItems: string[]
  onConfirmResolution: (resolution: DiceRollResolution) => void
  onClose: () => void
}

export function DiceRollModal({
  challenge,
  stats,
  equippedItems,
  onConfirmResolution,
  onClose,
}: DiceRollModalProps) {
  const options = useMemo(() => getChallengeOptions(challenge), [challenge])
  const [selectedId, setSelectedId] = useState<string>(
    challenge.default_option_id ?? options[0]?.id ?? 'primary'
  )
  const [isRolling, setIsRolling] = useState(false)
  const [displayNumber, setDisplayNumber] = useState<number>(20)
  const [finalD20, setFinalD20] = useState<number | null>(null)

  const computedOptions = useMemo(() => {
    return options.map((opt) => {
      const statMod = computeStatDiceModifiers(stats, opt.required_stats)
      const equipMod = computeEquipmentDiceBonuses(
        equippedItems,
        opt.required_stats,
        `${challenge.title} ${opt.label} ${opt.description} ${challenge.source_action ?? ''}`
      )
      const totalBonus = statMod.total + equipMod.total
      const successChancePct = calculateD20SuccessChance(opt.dc, totalBonus)
      return {
        opt,
        statMod,
        equipMod,
        totalBonus,
        successChancePct,
      }
    })
  }, [challenge.source_action, challenge.title, equippedItems, options, stats])

  const activeEntry =
    computedOptions.find((e) => e.opt.id === selectedId) ?? computedOptions[0]

  useEffect(() => {
    if (!isRolling) return
    const interval = setInterval(() => {
      setDisplayNumber(Math.floor(Math.random() * 20) + 1)
    }, 65)

    const timer = setTimeout(() => {
      clearInterval(interval)
      const rolled = Math.floor(Math.random() * 20) + 1
      setDisplayNumber(rolled)
      setFinalD20(rolled)
      setIsRolling(false)
    }, 850)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [isRolling])

  const { opt: activeOpt, statMod, equipMod, totalBonus, successChancePct } = activeEntry
  const totalRoll = finalD20 !== null ? finalD20 + totalBonus : null

  const outcome: DiceRollResolution['outcome'] | null =
    finalD20 === null || totalRoll === null
      ? null
      : finalD20 === 20
        ? 'CRITICAL SUCCESS'
        : finalD20 === 1
          ? 'CRITICAL FAIL'
          : totalRoll >= activeOpt.dc
            ? 'SUCCESS'
            : 'FAILED'

  const isWin = outcome === 'SUCCESS' || outcome === 'CRITICAL SUCCESS'

  const handleConfirm = () => {
    if (finalD20 === null || totalRoll === null || !outcome) return
    const statSummary = statMod.items
      .map((s) => `${s.stat} ${s.value} (${s.bonus >= 0 ? '+' : ''}${s.bonus})`)
      .join(', ')
    const equipSummary =
      equipMod.items.length > 0
        ? equipMod.items.map((e) => `${e.name} (+${e.bonus})`).join(', ')
        : 'ไม่มี'

    const promptText = `[DICE ROLL RESULT: ${challenge.title}]
- Chosen Approach: ${activeOpt.label} (${activeOpt.description || challenge.description})
- Original Action: ${challenge.source_action || challenge.description}
- Success Chance Shown: ${successChancePct}%
- 1d20 Rolled: ${finalD20} | Stat Bonus (${statSummary}): ${statMod.total >= 0 ? '+' : ''}${statMod.total} | Equipment Bonus (${equipSummary}): +${equipMod.total}
- Total Score: ${totalRoll} vs DC ${activeOpt.dc}
- Outcome: ${outcome}
- Promised Effect: ${isWin ? activeOpt.on_success : activeOpt.on_fail}
กรุณาเล่าผลลัพธ์ต่อเนื่องตามแนวทางที่ผู้เล่นเลือก (${activeOpt.label}) และผลลูกเต๋า (${outcome}) นี้ทันที`

    onConfirmResolution({
      d20: finalD20,
      statBonus: statMod.total,
      equipBonus: equipMod.total,
      total: totalRoll,
      dc: activeOpt.dc,
      chosenApproach: activeOpt.label,
      outcome,
      promptText,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06090e]/82 p-4 backdrop-blur-sm">
      <div className="sao-panel animate-alert-pop max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-300/15 pb-3.5">
          <div>
            <div className="font-hud flex items-center gap-1.5 text-[10px] font-bold tracking-[0.18em] text-[#e3a024] uppercase">
              <Dices className="h-3.5 w-3.5" />
              Cardinal Tactical Choice &amp; Probability Check (1d20)
            </div>
            <h2 className="font-hud mt-0.5 text-lg font-bold text-white">{challenge.title}</h2>
            <p className="mt-0.5 text-xs text-slate-300">{challenge.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
            aria-label="พับหน้าทอยเต๋า"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Multiple Tactical Options Selector */}
        {computedOptions.length > 1 && (
          <div className="mt-4">
            <div className="mb-2 text-[11px] font-semibold tracking-wide text-slate-300">
              เลือกแนวทางที่ต้องการ (โอกาสสำเร็จคำนวณจาก Stat และอุปกรณ์ปัจจุบัน):
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {computedOptions.map((entry) => {
                const isSelected = entry.opt.id === activeOpt.id
                const chanceColor =
                  entry.successChancePct >= 65
                    ? 'border-emerald-400/45 bg-emerald-500/15 text-emerald-200'
                    : entry.successChancePct >= 40
                      ? 'border-[#e3a024]/50 bg-[#e3a024]/15 text-[#f0c05e]'
                      : 'border-rose-400/45 bg-rose-500/15 text-rose-200'

                return (
                  <button
                    key={entry.opt.id}
                    type="button"
                    disabled={isRolling || finalD20 !== null}
                    onClick={() => setSelectedId(entry.opt.id)}
                    className={`flex flex-col justify-between rounded-md border p-3 text-left transition ${
                      isSelected
                        ? 'border-[#e3a024] bg-[#e3a024]/15'
                        : 'border-slate-300/15 bg-[#0b1018] hover:border-slate-300/35'
                    } disabled:cursor-default`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{entry.opt.label}</div>
                      {entry.opt.description && (
                        <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-slate-300">
                          {entry.opt.description}
                        </p>
                      )}
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1 border-t border-slate-300/10 pt-2">
                      <span className="font-hud text-[10px] text-slate-300">
                        {entry.opt.required_stats.join('+')} (DC {entry.opt.dc})
                      </span>
                      <span
                        className={`font-hud rounded border px-1.5 py-0.5 text-[10px] font-bold ${chanceColor}`}
                      >
                        สำเร็จ {entry.successChancePct}%
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Active Option Stat & Equipment Modifiers */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-slate-300/15 bg-[#0b1018] p-3">
            <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-slate-200">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#e3a024]" />
                Stat ที่ใช้ ({activeOpt.label})
              </span>
              <span className="font-hud text-[#f0c05e]">โอกาสสำเร็จ {successChancePct}%</span>
            </div>
            <div className="mt-2 space-y-1 text-xs">
              {statMod.items.map((s) => (
                <div key={s.stat} className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">
                    {s.stat} ({s.value})
                  </span>
                  <span className="font-hud font-bold text-[#f0c05e]">
                    {s.bonus >= 0 ? `+${s.bonus}` : s.bonus}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-slate-300/15 bg-[#0b1018] p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-200">
              <Swords className="h-3.5 w-3.5 text-[#e3a024]" />
              โบนัสจากอุปกรณ์ที่สวมใส่
            </div>
            <div className="mt-2 space-y-1 text-xs">
              {equipMod.items.length === 0 ? (
                <div className="text-[11px] text-slate-500">
                  ไม่มีอุปกรณ์ที่เสริมสายนี้ (+0)
                </div>
              ) : (
                equipMod.items.map((eq) => (
                  <div key={eq.name} className="flex items-center justify-between gap-2">
                    <span className="truncate text-slate-200" title={eq.reason}>
                      {eq.name}
                    </span>
                    <span className="font-hud shrink-0 font-bold text-emerald-300">
                      +{eq.bonus}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Win / Loss Stakes */}
        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
          <div className="rounded-md border border-emerald-400/30 bg-emerald-500/8 p-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              ถ้าทอยชนะ (รวม ≥ {activeOpt.dc})
            </div>
            <p className="mt-1 leading-relaxed text-emerald-100/90">{activeOpt.on_success}</p>
          </div>
          <div className="rounded-md border border-rose-400/30 bg-rose-500/8 p-3 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-rose-300">
              <XCircle className="h-3.5 w-3.5" />
              ถ้าทอยแพ้ (รวม &lt; {activeOpt.dc})
            </div>
            <p className="mt-1 leading-relaxed text-rose-100/90">{activeOpt.on_fail}</p>
          </div>
        </div>

        {/* D20 Roller Visual */}
        <div className="mt-4 flex flex-col items-center rounded-md border border-slate-300/15 bg-[#0b1018] p-4 text-center">
          <div className="mb-2.5 flex flex-wrap items-center justify-center gap-2 text-[11px] font-semibold tracking-wider text-slate-300 uppercase">
            <span>
              Target: <strong className="font-hud text-[#f0c05e]">DC {activeOpt.dc}</strong>
            </span>
            <span>•</span>
            <span>
              โบนัสรวม:{' '}
              <strong className="font-hud text-white">
                {totalBonus >= 0 ? `+${totalBonus}` : totalBonus}
              </strong>
            </span>
            <span>•</span>
            <span>
              โอกาสสำเร็จ:{' '}
              <strong className="font-hud text-emerald-300">{successChancePct}%</strong>
            </span>
          </div>

          <div
            className={`sao-hex flex h-24 w-24 items-center justify-center border-2 transition-all duration-300 ${
              isRolling
                ? 'animate-spin border-[#e3a024] bg-[#e3a024]/20 text-[#f0c05e]'
                : outcome === null
                  ? 'border-[#e3a024]/60 bg-[#121923] text-white'
                  : isWin
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
                    : 'border-rose-400 bg-rose-500/20 text-rose-200'
            }`}
          >
            <span className="font-hud text-3xl font-extrabold">{displayNumber}</span>
          </div>

          {finalD20 !== null && totalRoll !== null && outcome && (
            <div className="mt-3 space-y-1">
              <div className="font-hud text-xs text-slate-300">
                ลูกเต๋า ({finalD20}) {statMod.total >= 0 ? '+' : ''} {statMod.total} (Stat) + {equipMod.total} (Gear) ={' '}
                <span className="text-base font-extrabold text-white">{totalRoll}</span>{' '}
                <span className="text-slate-400">(vs DC {activeOpt.dc})</span>
              </div>
              <div
                className={`font-hud text-base font-bold tracking-[0.14em] uppercase ${
                  isWin ? 'text-emerald-300' : 'text-rose-300'
                }`}
              >
                {outcome === 'CRITICAL SUCCESS'
                  ? 'CRITICAL SUCCESS — ชนะขาดลอย'
                  : outcome === 'SUCCESS'
                    ? 'SUCCESS — ทอยชนะ'
                    : outcome === 'CRITICAL FAIL'
                      ? 'CRITICAL FAIL — พลาดท่าอย่างจัง'
                      : 'FAILED — ทอยแพ้'}
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap justify-center gap-2.5">
            {finalD20 === null ? (
              <button
                type="button"
                disabled={isRolling}
                onClick={() => setIsRolling(true)}
                className="font-hud flex items-center gap-2 rounded border border-[#f5be58]/60 bg-[#e3a024] px-6 py-2.5 text-xs font-bold tracking-[0.14em] text-slate-950 uppercase transition hover:bg-[#f0b43c] disabled:opacity-60"
              >
                <Dices className="h-4 w-4" />
                {isRolling ? 'กำลังทอย...' : 'ทอยลูกเต๋า (Roll 1d20)'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirm}
                className={`font-hud flex items-center gap-2 rounded border px-6 py-2.5 text-xs font-bold tracking-wider uppercase transition ${
                  isWin
                    ? 'border-emerald-300/60 bg-emerald-400 text-slate-950 hover:bg-emerald-300'
                    : 'border-rose-300/60 bg-rose-500 text-white hover:bg-rose-400'
                }`}
              >
                <Shield className="h-4 w-4" />
                ส่งผลลัพธ์เข้าสู่เนื้อเรื่อง
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
