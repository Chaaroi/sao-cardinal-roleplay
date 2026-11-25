import { useState } from 'react'
import { Crown, Gift, Heart, Sparkles, UserPlus, Users } from 'lucide-react'
import type { CharacterState, InventoryItem } from '../types/game'
import { CharacterAvatar } from './CharacterAvatar'

interface RelationshipPanelProps {
  knownCharacters: Record<string, CharacterState>
  inSceneNames: string[]
  partyMembers: string[]
  inventory: InventoryItem[]
  isLoading: boolean
  onQuickAction: (prompt: string) => void
}

export function RelationshipPanel({
  knownCharacters,
  inSceneNames,
  partyMembers,
  inventory,
  isLoading,
  onQuickAction,
}: RelationshipPanelProps) {
  const [giftTarget, setGiftTarget] = useState<string | null>(null)
  const characters = Object.values(knownCharacters).sort((a, b) => {
    if (a.is_married !== b.is_married) return a.is_married ? -1 : 1
    const aInScene = inSceneNames.includes(a.name) ? 1 : 0
    const bInScene = inSceneNames.includes(b.name) ? 1 : 0
    if (aInScene !== bInScene) return bInScene - aInScene
    return b.affection - a.affection
  })

  if (characters.length === 0) {
    return (
      <div className="sao-panel rounded-xl p-5 text-center">
        <Users className="mx-auto h-8 w-8 text-cyan-300/60" />
        <h3 className="font-hud mt-2 text-xs font-bold tracking-wider text-cyan-100 uppercase">
          Relationship & Romance
        </h3>
        <p className="mt-1.5 text-xs text-slate-400">
          ยังไม่มีข้อมูลตัวละครในความทรงจำ ลองพูดคุยหรือพบปะ NPC ในเนื้อเรื่องเพื่อปลดล็อกการ์ดความสัมพันธ์
        </p>
      </div>
    )
  }

  return (
    <div className="sao-panel flex flex-col gap-3 rounded-xl p-4">
      <div className="flex items-center justify-between border-b border-cyan-200/20 pb-2.5">
        <div className="flex items-center gap-2">
          <Heart className="h-4 w-4 text-pink-400" />
          <h3 className="font-hud text-xs font-bold tracking-widest text-cyan-100 uppercase">
            Relationship & Romance ({characters.length})
          </h3>
        </div>
        <span className="text-[10px] text-slate-400">900+ ปลดล็อกขอแต่งงาน</span>
      </div>

      <div className="max-h-[460px] space-y-3 overflow-y-auto pr-1">
        {characters.map((char) => {
          const inScene = inSceneNames.includes(char.name)
          const inParty = partyMembers.includes(char.name) || char.in_party
          const canPropose = (char.can_propose || char.affection >= 900) && !char.is_married
          const progressPct = Math.max(0, Math.min(100, ((char.affection + 100) / 1100) * 100))

          const gaugeColor = char.is_married
            ? 'from-amber-300 via-yellow-400 to-amber-500 shadow-[0_0_12px_rgba(251,191,36,0.65)]'
            : char.affection >= 700
              ? 'from-pink-400 via-rose-400 to-pink-500 shadow-[0_0_10px_rgba(244,114,182,0.5)]'
              : char.affection >= 250
                ? 'from-cyan-300 via-sky-400 to-indigo-400'
                : char.affection >= 0
                  ? 'from-slate-300 to-cyan-300'
                  : 'from-rose-600 to-red-700'

          return (
            <div
              key={char.name}
              className={`rounded-lg border p-3 transition ${
                char.is_married
                  ? 'border-amber-300/65 bg-gradient-to-br from-amber-500/15 to-slate-900/75 shadow-[0_0_18px_rgba(251,191,36,0.18)]'
                  : inScene
                    ? 'border-cyan-300/45 bg-slate-900/70'
                    : 'border-white/10 bg-slate-950/55 opacity-85'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <CharacterAvatar
                    name={char.name}
                    size="md"
                    ringClassName={
                      char.is_married
                        ? 'border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.55)]'
                        : char.affection >= 500
                          ? 'border-pink-400 shadow-[0_0_10px_rgba(244,114,182,0.45)]'
                          : 'border-cyan-300/65'
                    }
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-raj text-sm font-bold text-white">{char.name}</span>
                      {inScene && (
                        <span className="rounded bg-emerald-400/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-200">
                          IN SCENE
                        </span>
                      )}
                      {inParty && (
                        <span className="rounded bg-sky-400/20 px-1.5 py-0.5 text-[9px] font-bold text-sky-200">
                          PARTY
                        </span>
                      )}
                      {char.is_married && (
                        <span className="flex items-center gap-0.5 rounded bg-amber-400/25 px-1.5 py-0.5 text-[9px] font-bold text-amber-200">
                          <Crown className="h-2.5 w-2.5" /> SPOUSE
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-300">
                      สถานะ: <span className="font-semibold text-cyan-200">{char.relationship_tier}</span> • อารมณ์:{' '}
                      <span className="text-sky-200">{char.mood}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-hud text-xs font-bold text-white">
                    {char.affection} <span className="text-[10px] text-slate-400">/ 1000</span>
                  </div>
                  {char.affection_delta && char.affection_delta !== '0' && (
                    <span
                      className={`text-[10px] font-bold ${
                        char.affection_delta.startsWith('-') ? 'text-rose-400' : 'text-pink-300'
                      }`}
                    >
                      ({char.affection_delta})
                    </span>
                  )}
                </div>
              </div>

              {/* Affection Gauge */}
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-950/80 p-[1px]">
                <div
                  className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${gaugeColor}`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {/* Quick Actions */}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {!inParty && (
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() =>
                      onQuickAction(`ชวน ${char.name} เข้าปาร์ตี้ร่วมเดินทางด้วยกัน`)
                    }
                    className="flex items-center gap-1 rounded border border-cyan-300/30 bg-cyan-500/10 px-2 py-1 text-[11px] text-cyan-100 transition hover:bg-cyan-400/25 disabled:opacity-45"
                  >
                    <UserPlus className="h-3 w-3" />
                    ชวนเข้าปาร์ตี้
                  </button>
                )}

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setGiftTarget(giftTarget === char.name ? null : char.name)}
                  className="flex items-center gap-1 rounded border border-pink-300/30 bg-pink-500/10 px-2 py-1 text-[11px] text-pink-100 transition hover:bg-pink-400/25 disabled:opacity-45"
                >
                  <Gift className="h-3 w-3" />
                  มอบของขวัญ
                </button>

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() =>
                    onQuickAction(`ชวน ${char.name} ออกไปเดตหรือใช้เวลาส่วนตัวด้วยกัน`)
                  }
                  className="flex items-center gap-1 rounded border border-sky-300/30 bg-sky-500/10 px-2 py-1 text-[11px] text-sky-100 transition hover:bg-sky-400/25 disabled:opacity-45"
                >
                  <Heart className="h-3 w-3" />
                  ชวนออกเดต
                </button>

                {canPropose && (
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() =>
                      onQuickAction(
                        `[SYSTEM ACTION: Marriage Proposal] หยิบแหวนแต่งงานออกมาและกดเมนูขอแต่งงานกับ ${char.name} อย่างจริงใจ`
                      )
                    }
                    className="flex items-center gap-1 rounded border border-amber-300 bg-gradient-to-r from-amber-400 to-yellow-300 px-2.5 py-1 text-[11px] font-bold text-slate-950 shadow-[0_0_16px_rgba(251,191,36,0.65)] transition hover:brightness-110 disabled:opacity-45"
                  >
                    <Sparkles className="h-3 w-3" />
                    ขอแต่งงาน (Propose)
                  </button>
                )}
              </div>

              {/* Inline Gift Picker */}
              {giftTarget === char.name && (
                <div className="mt-2 rounded-md border border-pink-300/30 bg-slate-950/80 p-2">
                  <div className="mb-1.5 text-[10px] font-semibold text-pink-200">
                    เลือกของขวัญมอบให้ {char.name}:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {inventory.slice(0, 6).map((item) => (
                      <button
                        key={item.name}
                        type="button"
                        disabled={isLoading}
                        onClick={() => {
                          setGiftTarget(null)
                          onQuickAction(`มอบไอเทม "${item.name}" เป็นของขวัญให้แก่ ${char.name}`)
                        }}
                        className="rounded border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] text-slate-200 hover:border-pink-300/50 hover:bg-pink-500/20"
                      >
                        {item.name} (x{item.quantity})
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => {
                        setGiftTarget(null)
                        onQuickAction(`ซื้อของขวัญพิเศษที่ร้านค้าใกล้เคียงแล้วมอบให้ ${char.name}`)
                      }}
                      className="rounded border border-pink-300/40 bg-pink-500/15 px-2 py-0.5 text-[10px] text-pink-100 hover:bg-pink-500/30"
                    >
                      + ซื้อของขวัญใหม่ให้
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
