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
      <div className="sao-panel rounded-md p-5 text-center">
        <Users className="mx-auto h-6 w-6 text-slate-500" />
        <h3 className="font-hud mt-2 text-xs font-bold tracking-[0.14em] text-slate-300 uppercase">
          Relationship &amp; Romance
        </h3>
        <p className="mt-1 text-[11px] text-slate-500">
          ยังไม่มีข้อมูลตัวละคร พูดคุยหรือพบปะ NPC ในเนื้อเรื่องเพื่อปลดล็อก
        </p>
      </div>
    )
  }

  return (
    <div className="sao-panel flex flex-col gap-3 rounded-md p-4">
      <div className="flex items-center justify-between border-b border-slate-200/12 pb-2.5">
        <div className="flex items-center gap-2">
          <Heart className="h-3.5 w-3.5 text-rose-400" />
          <h3 className="font-hud text-xs font-bold tracking-[0.14em] text-slate-200 uppercase">
            Relationships ({characters.length})
          </h3>
        </div>
        <span className="text-[10px] text-slate-500">900+ ขอแต่งงานได้</span>
      </div>

      <div className="max-h-[380px] space-y-2.5 overflow-y-auto pr-1">
        {characters.map((char) => {
          const inScene = inSceneNames.includes(char.name)
          const inParty = partyMembers.includes(char.name) || char.in_party
          const canPropose = (char.can_propose || char.affection >= 900) && !char.is_married
          const progressPct = Math.max(0, Math.min(100, ((char.affection + 100) / 1100) * 100))

          const gaugeColor = char.is_married
            ? 'bg-[#e3a024]'
            : char.affection >= 700
              ? 'bg-rose-400'
              : char.affection >= 250
                ? 'bg-sky-400'
                : char.affection >= 0
                  ? 'bg-slate-300'
                  : 'bg-rose-600'

          return (
            <div
              key={char.name}
              className={`rounded border p-3 transition ${
                char.is_married
                  ? 'border-[#e3a024]/50 bg-[#e3a024]/[0.07]'
                  : inScene
                    ? 'border-slate-300/20 bg-white/[0.04]'
                    : 'border-slate-300/10 bg-white/[0.02] opacity-80'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                  <CharacterAvatar
                    name={char.name}
                    size="md"
                    ringClassName={
                      char.is_married
                        ? 'border-[#e3a024]'
                        : char.affection >= 500
                          ? 'border-rose-300/80'
                          : 'border-slate-300/50'
                    }
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-raj text-sm font-bold text-slate-100">{char.name}</span>
                      {inScene && (
                        <span className="rounded border border-emerald-400/35 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-200">
                          IN SCENE
                        </span>
                      )}
                      {inParty && (
                        <span className="rounded border border-slate-300/25 bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold text-slate-200">
                          PARTY
                        </span>
                      )}
                      {char.is_married && (
                        <span className="flex items-center gap-0.5 rounded border border-[#e3a024]/50 bg-[#e3a024]/20 px-1.5 py-0.5 text-[9px] font-semibold text-amber-200">
                          <Crown className="h-2.5 w-2.5" /> SPOUSE
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-400">
                      <span className="font-medium text-slate-200">{char.relationship_tier}</span> · {char.mood}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-hud text-xs font-bold text-slate-100">
                    {char.affection} <span className="text-[10px] text-slate-500">/ 1000</span>
                  </div>
                  {char.affection_delta && char.affection_delta !== '0' && (
                    <span
                      className={`text-[10px] font-semibold ${
                        char.affection_delta.startsWith('-') ? 'text-rose-400' : 'text-emerald-300'
                      }`}
                    >
                      {char.affection_delta}
                    </span>
                  )}
                </div>
              </div>

              {/* Clean Affection Gauge */}
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#090d14]">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${gaugeColor}`}
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
                    className="flex items-center gap-1 rounded border border-slate-300/15 bg-white/[0.04] px-2 py-1 text-[11px] text-slate-200 transition hover:border-slate-300/35 hover:bg-white/[0.08] disabled:opacity-45"
                  >
                    <UserPlus className="h-3 w-3" />
                    ชวนเข้าปาร์ตี้
                  </button>
                )}

                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setGiftTarget(giftTarget === char.name ? null : char.name)}
                  className="flex items-center gap-1 rounded border border-slate-300/15 bg-white/[0.04] px-2 py-1 text-[11px] text-slate-200 transition hover:border-rose-300/40 hover:text-rose-200 disabled:opacity-45"
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
                  className="flex items-center gap-1 rounded border border-slate-300/15 bg-white/[0.04] px-2 py-1 text-[11px] text-slate-200 transition hover:border-rose-300/40 hover:text-rose-200 disabled:opacity-45"
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
                    className="flex items-center gap-1 rounded bg-[#e3a024] px-2.5 py-1 text-[11px] font-bold text-slate-950 transition hover:bg-[#eeb440] disabled:opacity-45"
                  >
                    <Sparkles className="h-3 w-3" />
                    ขอแต่งงาน (Propose)
                  </button>
                )}
              </div>

              {/* Inline Gift Picker */}
              {giftTarget === char.name && (
                <div className="mt-2 rounded border border-slate-300/15 bg-[#0b1018] p-2.5">
                  <div className="mb-1.5 text-[10px] font-semibold text-slate-300">
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
                        className="rounded border border-slate-300/15 bg-white/[0.04] px-2 py-0.5 text-[10px] text-slate-200 hover:border-[#e3a024]/50 hover:text-amber-200"
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
                      className="rounded border border-[#e3a024]/40 bg-[#e3a024]/15 px-2 py-0.5 text-[10px] text-amber-200 hover:bg-[#e3a024]/25"
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
