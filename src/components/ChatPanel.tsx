import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  BookOpen,
  Camera,
  ChevronDown,
  ChevronUp,
  Dices,
  Download,
  ExternalLink,
  Gem,
  Loader2,
  Maximize2,
  Send,
  ShoppingBag,
  Square,
  X,
} from 'lucide-react'
import type { ChatMessage, DiceChallenge, EventCG, ShopState } from '../types/game'
import { splitNarrativeAndChoices } from '../utils/jsonStateParser'
import { CharacterAvatar } from './CharacterAvatar'

interface ChatPanelProps {
  messages: ChatMessage[]
  playerName: string
  isLoading: boolean
  streamingText?: string
  elapsedSeconds?: number
  generatingImageMsgId?: string | null
  activeShop?: ShopState | null
  pendingDiceChallenge?: DiceChallenge | null
  errorMessage: string | null
  onSendMessage: (text: string) => void
  onTriggerManualDice?: (text: string) => void
  onOpenPendingDice?: () => void
  onCancelRequest?: () => void
  onRetry?: () => void
  onEnableDemoMode?: () => void
  onOpenSettings?: () => void
  onOpenShop?: () => void
  onRequestSceneImage?: (messageId: string) => void
}

export function ChatPanel({
  messages,
  playerName,
  isLoading,
  streamingText = '',
  elapsedSeconds = 0,
  generatingImageMsgId = null,
  activeShop = null,
  pendingDiceChallenge = null,
  errorMessage,
  onSendMessage,
  onTriggerManualDice,
  onOpenPendingDice,
  onCancelRequest,
  onRetry,
  onEnableDemoMode,
  onOpenSettings,
  onOpenShop,
  onRequestSceneImage,
}: ChatPanelProps) {
  const [input, setInput] = useState('')
  const [expandedJsonId, setExpandedJsonId] = useState<string | null>(null)
  const [lightboxCG, setLightboxCG] = useState<EventCG | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading, streamingText])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    setInput('')
    onSendMessage(trimmed)
  }

  const latestModelMessage = [...messages].reverse().find((m) => m.role === 'model')
  const latestChoices = latestModelMessage?.choices ?? []

  return (
    <div className="flex h-full min-h-[500px] flex-col bg-[#0b1017]">
      {/* Light Novel Story Feed */}
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-8">
        <div className="mx-auto max-w-[740px] divide-y divide-white/[0.06]">
          {messages.map((msg) => {
            const isUser = msg.role === 'user'

            if (isUser) {
              return (
                <div key={msg.id} className="py-4">
                  <div className="border-l-2 border-[#e3a024] pl-3.5">
                    <div className="text-[11px] font-semibold text-[#f0c05e]">
                      {playerName}
                    </div>
                    <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                      {msg.text}
                    </p>
                  </div>
                </div>
              )
            }

            return (
              <article key={msg.id} className="py-6">
                {/* Character Presence Strip (shown cleanly only when NPCs are in scene) */}
                {msg.stateSnapshot && msg.stateSnapshot.characters_in_scene.length > 0 && (
                  <div className="mb-3.5 flex flex-wrap items-center gap-2">
                    {msg.stateSnapshot.characters_in_scene.map((ch) => (
                      <div
                        key={ch.name}
                        className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] py-0.5 pl-0.5 pr-2.5 text-[11px]"
                      >
                        <CharacterAvatar
                          name={ch.name}
                          size="xs"
                          ringClassName={
                            ch.is_married
                              ? 'border-[#e3a024]'
                              : ch.affection >= 500
                                ? 'border-rose-300/75'
                                : 'border-slate-300/50'
                          }
                        />
                        <span className="font-medium text-slate-100">{ch.name}</span>
                        <span className="text-[10px] text-slate-400">{ch.mood}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Light Novel Narrative (keep suggested choices out of prose body) */}
                <div className="sao-markdown text-[15px] leading-[1.85] text-[#e9ecf2]">
                  <ReactMarkdown>
                    {splitNarrativeAndChoices(msg.text).cleanNarrative}
                  </ReactMarkdown>
                </div>

                {/* Event CG Frame */}
                {msg.eventImage && (
                  <div className="mt-5 overflow-hidden rounded border border-white/[0.1] bg-[#0f1621]">
                    <div className="flex items-center justify-between border-b border-white/[0.07] px-3.5 py-2 text-[11px]">
                      <div className="flex items-center gap-2 font-medium text-slate-200">
                        {msg.eventImage.eventType === 'marriage' ? (
                          <Gem className="h-3.5 w-3.5 text-[#e3a024]" />
                        ) : (
                          <Camera className="h-3.5 w-3.5 text-slate-300" />
                        )}
                        <span>
                          {msg.eventImage.characterName || 'Event CG'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setLightboxCG(msg.eventImage!)}
                          className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-slate-100"
                          title="ขยายภาพเต็มจอ"
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                        </button>
                        <a
                          href={msg.eventImage.imageUrl}
                          download={`sao-cg-${msg.eventImage.characterName || 'scene'}.jpg`}
                          className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-slate-100"
                          title="ดาวน์โหลดภาพ CG"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLightboxCG(msg.eventImage!)}
                      className="block w-full cursor-zoom-in overflow-hidden"
                    >
                      <img
                        src={msg.eventImage.imageUrl}
                        alt={msg.eventImage.caption}
                        className="max-h-80 w-full object-cover transition duration-300 hover:scale-[1.01]"
                      />
                    </button>
                    <div className="flex items-center justify-between px-3.5 py-1.5 text-[11px] text-slate-400">
                      <span>{msg.eventImage.caption}</span>
                    </div>
                  </div>
                )}

                {!msg.eventImage && generatingImageMsgId === msg.id && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-[#e3a024]" />
                    <span>กำลังวาดภาพประกอบฉาก...</span>
                  </div>
                )}

                {/* Subtle Scene Metadata */}
                {msg.stateSnapshot && (
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                    <div className="flex flex-wrap items-center gap-3 text-slate-500">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedJsonId(expandedJsonId === msg.id ? null : msg.id)
                        }
                        className="flex items-center gap-1 transition hover:text-slate-300"
                      >
                        {expandedJsonId === msg.id ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                        {msg.stateSnapshot.location}
                      </button>

                      {msg.wikiReferences && msg.wikiReferences.length > 0 && (
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="h-3 w-3 opacity-70" />
                          {msg.wikiReferences.map((ref) => (
                            <a
                              key={ref.title}
                              href={ref.url}
                              target="_blank"
                              rel="noreferrer"
                              title={ref.summary}
                              className="inline-flex items-center gap-0.5 text-slate-400 underline decoration-slate-600 underline-offset-2 hover:text-slate-200"
                            >
                              {ref.title}
                              <ExternalLink className="h-2.5 w-2.5 opacity-65" />
                            </a>
                          ))}
                        </span>
                      )}
                    </div>

                    {!msg.eventImage &&
                      onRequestSceneImage &&
                      generatingImageMsgId !== msg.id && (
                        <button
                          type="button"
                          disabled={Boolean(generatingImageMsgId)}
                          onClick={() => onRequestSceneImage(msg.id)}
                          className="flex items-center gap-1 text-[11px] text-slate-500 transition hover:text-[#f0c05e] disabled:opacity-40"
                        >
                          <Camera className="h-3 w-3" />
                          วาดภาพฉากนี้
                        </button>
                      )}
                  </div>
                )}

                {msg.stateSnapshot && expandedJsonId === msg.id && (
                  <pre className="mt-2 max-h-48 overflow-auto rounded border border-white/[0.08] bg-[#080c12] p-3 text-[11px] text-slate-300">
                    {JSON.stringify(msg.stateSnapshot, null, 2)}
                  </pre>
                )}
              </article>
            )
          })}

          {isLoading && (
            <div className="space-y-3 py-5">
              {streamingText ? (
                <div className="sao-markdown text-[15px] leading-[1.85] text-[#e9ecf2]">
                  <ReactMarkdown>{streamingText}</ReactMarkdown>
                </div>
              ) : null}

              <div className="flex items-center justify-between gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#e3a024]" />
                  <span>
                    {streamingText
                      ? `กำลังเล่าเรื่อง... (${elapsedSeconds.toFixed(1)}s)`
                      : `กำลังประมวลผลฉากถัดไป... (${elapsedSeconds.toFixed(1)}s)`}
                  </span>
                </div>
                {onCancelRequest && (
                  <button
                    type="button"
                    onClick={onCancelRequest}
                    className="flex items-center gap-1 rounded border border-rose-400/35 bg-rose-500/12 px-2.5 py-1 text-[11px] font-medium text-rose-200 hover:bg-rose-500/20"
                  >
                    <Square className="h-3 w-3 fill-rose-200" />
                    หยุด
                  </button>
                )}
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="my-3 rounded border border-rose-400/35 bg-rose-500/10 px-4 py-3 text-xs text-rose-100">
              <div className="leading-relaxed">
                <strong>เกิดข้อผิดพลาด:</strong> {errorMessage}
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {onRetry && (
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={onRetry}
                    className="rounded border border-white/25 bg-white/10 px-3 py-1 font-medium text-white hover:bg-white/20 disabled:opacity-45"
                  >
                    ลองใหม่อีกครั้ง
                  </button>
                )}
                {onOpenSettings && (
                  <button
                    type="button"
                    onClick={onOpenSettings}
                    className="rounded border border-rose-300/40 bg-rose-500/20 px-3 py-1 font-medium text-rose-100 hover:bg-rose-500/30"
                  >
                    เปิดตั้งค่า
                  </button>
                )}
                {onEnableDemoMode && (
                  <button
                    type="button"
                    onClick={onEnableDemoMode}
                    className="rounded border border-[#e3a024]/50 bg-[#e3a024]/15 px-3 py-1 font-medium text-amber-200 hover:bg-[#e3a024]/25"
                  >
                    สลับใช้ Demo Mode
                  </button>
                )}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Bottom Choice & Command Bar */}
      <div className="border-t border-white/[0.08] bg-[#0d131c] px-4 py-3 sm:px-8">
        <div className="mx-auto max-w-[740px]">
          {pendingDiceChallenge && onOpenPendingDice && (
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 rounded border border-[#e3a024]/45 bg-[#e3a024]/10 px-3 py-1.5 text-xs">
              <div className="flex items-center gap-2 text-amber-100">
                <Dices className="h-4 w-4 text-[#e3a024]" />
                <span>
                  {pendingDiceChallenge.title} ({pendingDiceChallenge.required_stats.join('+')} · DC {pendingDiceChallenge.dc})
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenPendingDice}
                className="font-hud flex items-center gap-1 rounded bg-[#e3a024] px-3 py-1 text-[11px] font-bold text-slate-950 transition hover:bg-[#eeb440]"
              >
                <Dices className="h-3.5 w-3.5" />
                ทอยลูกเต๋า
              </button>
            </div>
          )}

          {activeShop && activeShop.items.length > 0 && onOpenShop && (
            <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 rounded border border-[#e3a024]/45 bg-[#e3a024]/10 px-3 py-1.5 text-xs">
              <div className="flex items-center gap-2 text-amber-100">
                <ShoppingBag className="h-4 w-4 text-[#e3a024]" />
                <span>
                  {activeShop.shop_name} ({activeShop.items.filter((i) => i.stock > 0).length} รายการ)
                </span>
              </div>
              <button
                type="button"
                onClick={onOpenShop}
                className="font-hud flex items-center gap-1 rounded bg-[#e3a024] px-3 py-1 text-[11px] font-bold text-slate-950 transition hover:bg-[#eeb440]"
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                เปิดร้านค้า
              </button>
            </div>
          )}

          {/* Clean Numbered Visual Novel Choices */}
          {latestChoices.length > 0 && !isLoading && (
            <div className="mb-2.5 grid gap-1.5 sm:grid-cols-2">
              {latestChoices.map((choice, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSendMessage(choice)}
                  className="group flex items-start gap-2.5 border-l-2 border-white/[0.1] bg-white/[0.025] px-3 py-2 text-left text-xs text-slate-200 transition hover:border-[#e3a024] hover:bg-[#e3a024]/[0.08] hover:text-white"
                >
                  <span className="font-hud mt-0.5 text-[11px] font-bold text-slate-500 group-hover:text-[#e3a024]">
                    {idx + 1}.
                  </span>
                  <span className="line-clamp-2 leading-snug">{choice}</span>
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="พิมพ์การกระทำหรือบทพูดของคุณ..."
              className="flex-1 rounded border border-white/[0.12] bg-[#080c12] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-[#e3a024] focus:outline-none disabled:opacity-60"
            />
            {onTriggerManualDice && (
              <button
                type="button"
                disabled={isLoading}
                onClick={() => {
                  const txt = input.trim() || 'ทอยลูกเต๋าทดสอบสถานการณ์ปัจจุบัน'
                  setInput('')
                  onTriggerManualDice(txt)
                }}
                title="เปิดหน้าทอยลูกเต๋า 1d20"
                className="flex items-center gap-1.5 rounded border border-white/[0.12] bg-white/[0.04] px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-[#e3a024]/50 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Dices className="h-4 w-4 text-[#e3a024]" />
                <span className="hidden md:inline">ทอยเต๋า</span>
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex items-center gap-1.5 rounded bg-[#e3a024] px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-[#eeb440] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">ส่ง</span>
            </button>
          </form>
        </div>
      </div>

      {/* Lightbox Modal for Event CG */}
      {lightboxCG && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setLightboxCG(null)}
        >
          <div
            className="sao-panel relative max-w-4xl overflow-hidden rounded-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200/15 px-4 py-2.5">
              <span className="font-hud text-xs font-bold text-slate-200">
                {lightboxCG.caption}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={lightboxCG.imageUrl}
                  download={`sao-cg-${lightboxCG.characterName || 'scene'}.jpg`}
                  className="flex items-center gap-1 rounded border border-slate-300/25 bg-white/10 px-2.5 py-1 text-xs text-slate-200 hover:bg-white/20"
                >
                  <Download className="h-3.5 w-3.5" />
                  บันทึกภาพ
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxCG(null)}
                  className="rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <img
              src={lightboxCG.imageUrl}
              alt={lightboxCG.caption}
              className="max-h-[80vh] w-full bg-black object-contain"
            />
          </div>
        </div>
      )}
    </div>
  )
}
