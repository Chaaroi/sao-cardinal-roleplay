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
    <div className="sao-panel flex h-full min-h-[540px] flex-col overflow-hidden rounded-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/12 bg-[#0b1018]/70 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-2 rotate-45 bg-[#e3a024]" />
          <span className="font-hud text-xs font-bold tracking-[0.16em] text-slate-200 uppercase">
            Cardinal Story Chronicle
          </span>
        </div>
        <span className="text-[11px] text-slate-500">
          พิมพ์คำสั่งอิสระ หรือเลือกตัวเลือกด้านล่าง
        </span>
      </div>

      {/* Narrative Chronicle Feed (Editorial Visual Novel Style) */}
      <div className="flex-1 divide-y divide-slate-200/8 overflow-y-auto px-5 py-2 sm:px-7">
        {messages.map((msg) => {
          const isUser = msg.role === 'user'

          if (isUser) {
            return (
              <div key={msg.id} className="py-3.5">
                <div className="border-l-2 border-[#e3a024] bg-white/[0.03] px-4 py-2.5">
                  <div className="font-hud text-[10px] font-bold tracking-widest text-[#e3a024] uppercase">
                    ▸ {playerName}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-100">
                    {msg.text}
                  </p>
                </div>
              </div>
            )
          }

          return (
            <article key={msg.id} className="py-5">
              {/* Scene Header & Character Strip */}
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-hud text-[10px] font-bold tracking-[0.16em] text-slate-400 uppercase">
                    Cardinal System
                  </span>
                  {msg.stateSnapshot && msg.stateSnapshot.characters_in_scene.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {msg.stateSnapshot.characters_in_scene.map((ch) => (
                        <div
                          key={ch.name}
                          className="flex items-center gap-1.5 rounded border border-slate-300/15 bg-white/[0.04] py-0.5 pl-0.5 pr-2 text-[11px]"
                        >
                          <CharacterAvatar
                            name={ch.name}
                            size="xs"
                            ringClassName={
                              ch.is_married
                                ? 'border-[#e3a024]'
                                : ch.affection >= 500
                                  ? 'border-rose-300/80'
                                  : 'border-slate-300/60'
                            }
                          />
                          <span className="font-medium text-slate-200">{ch.name}</span>
                          <span className="text-[10px] text-slate-400">· {ch.mood}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {msg.modelUsed && (
                  <span className="font-mono text-[10px] text-slate-500">
                    {msg.modelUsed}
                  </span>
                )}
              </div>

              {/* Light Novel Narrative */}
              <div className="sao-markdown text-[15px] text-slate-100">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>

              {/* Event CG Frame */}
              {msg.eventImage && (
                <div className="mt-4 overflow-hidden rounded border border-slate-300/20 bg-[#0b1018]">
                  <div className="flex items-center justify-between border-b border-slate-200/10 px-3.5 py-2 text-[11px]">
                    <div className="flex items-center gap-2 font-medium text-slate-200">
                      {msg.eventImage.eventType === 'marriage' ? (
                        <Gem className="h-3.5 w-3.5 text-[#e3a024]" />
                      ) : (
                        <Camera className="h-3.5 w-3.5 text-slate-300" />
                      )}
                      <span>
                        {msg.eventImage.eventType === 'marriage'
                          ? 'Marriage Event CG'
                          : 'Event CG'}
                        {msg.eventImage.characterName ? ` — ${msg.eventImage.characterName}` : ''}
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
                    {msg.eventImage.modelUsed && (
                      <span className="font-mono text-[10px] text-slate-500">
                        {msg.eventImage.modelUsed}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {!msg.eventImage && generatingImageMsgId === msg.id && (
                <div className="mt-3 flex items-center gap-2 rounded border border-slate-300/15 bg-white/[0.03] px-3 py-2 text-xs text-slate-300">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#e3a024]" />
                  <span>กำลังเรนเดอร์ภาพ Event CG ของฉากนี้...</span>
                </div>
              )}

              {/* Subtle Metadata Footer */}
              {msg.stateSnapshot && (
                <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedJsonId(expandedJsonId === msg.id ? null : msg.id)
                    }
                    className="flex items-center gap-1 text-slate-500 transition hover:text-slate-300"
                  >
                    {expandedJsonId === msg.id ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                    พิกัด: {msg.stateSnapshot.location}
                  </button>

                  {!msg.eventImage &&
                    onRequestSceneImage &&
                    generatingImageMsgId !== msg.id && (
                      <button
                        type="button"
                        disabled={Boolean(generatingImageMsgId)}
                        onClick={() => onRequestSceneImage(msg.id)}
                        className="flex items-center gap-1.5 rounded border border-slate-300/15 bg-white/[0.03] px-2.5 py-1 text-[10px] font-medium text-slate-300 transition hover:border-[#e3a024]/50 hover:text-amber-200 disabled:opacity-40"
                      >
                        <Camera className="h-3 w-3" />
                        เจนภาพฉากนี้
                      </button>
                    )}
                </div>
              )}

              {msg.stateSnapshot && expandedJsonId === msg.id && (
                <pre className="mt-2 max-h-48 overflow-auto rounded border border-slate-200/10 bg-[#090d14] p-3 text-[11px] text-slate-300">
                  {JSON.stringify(msg.stateSnapshot, null, 2)}
                </pre>
              )}

              {msg.wikiReferences && msg.wikiReferences.length > 0 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    <BookOpen className="h-3 w-3" />
                    SAO Wiki:
                  </span>
                  {msg.wikiReferences.map((ref) => (
                    <a
                      key={ref.title}
                      href={ref.url}
                      target="_blank"
                      rel="noreferrer"
                      title={ref.summary}
                      className="flex items-center gap-1 rounded border border-slate-300/15 bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-slate-300 transition hover:border-slate-300/35 hover:text-white"
                    >
                      {ref.title}
                      <ExternalLink className="h-2.5 w-2.5 opacity-65" />
                    </a>
                  ))}
                </div>
              )}
            </article>
          )
        })}

        {isLoading && (
          <div className="py-4 space-y-3">
            {streamingText ? (
              <div>
                <div className="mb-2 flex items-center justify-between text-[10px]">
                  <span className="font-hud font-bold tracking-[0.16em] text-[#e3a024] uppercase">
                    Cardinal System // Streaming
                  </span>
                  <span className="font-mono text-slate-400">{elapsedSeconds.toFixed(1)}s</span>
                </div>
                <div className="sao-markdown text-[15px] text-slate-100">
                  <ReactMarkdown>{streamingText}</ReactMarkdown>
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-300/15 bg-white/[0.03] px-3.5 py-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#e3a024]" />
                <span>
                  {streamingText
                    ? `กำลังรับเนื้อเรื่อง... (${elapsedSeconds.toFixed(1)}s)`
                    : `กำลังประมวลผลเหตุการณ์... (${elapsedSeconds.toFixed(1)}s)`}
                </span>
              </div>
              {onCancelRequest && (
                <button
                  type="button"
                  onClick={onCancelRequest}
                  className="flex items-center gap-1 rounded border border-rose-400/35 bg-rose-500/15 px-2.5 py-1 text-[11px] font-medium text-rose-200 hover:bg-rose-500/25"
                >
                  <Square className="h-3 w-3 fill-rose-200" />
                  หยุด
                </button>
              )}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="my-3 rounded border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-xs text-rose-100">
            <div className="leading-relaxed">
              <strong>เกิดข้อผิดพลาด:</strong> {errorMessage}
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {onRetry && (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={onRetry}
                  className="rounded border border-slate-200/35 bg-white/10 px-3 py-1 font-medium text-white hover:bg-white/20 disabled:opacity-45"
                >
                  ลองใหม่อีกครั้ง (Retry)
                </button>
              )}
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="rounded border border-rose-300/40 bg-rose-500/20 px-3 py-1 font-medium text-rose-100 hover:bg-rose-500/30"
                >
                  เปิด Settings
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

      {/* Bottom Action & Input Dock */}
      <div className="border-t border-slate-200/12 bg-[#0b1018]/90 p-3.5 sm:p-4">
        {pendingDiceChallenge && onOpenPendingDice && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded border border-[#e3a024]/45 bg-[#e3a024]/10 px-3.5 py-2 text-xs">
            <div className="flex items-center gap-2 text-amber-100">
              <Dices className="h-4 w-4 text-[#e3a024]" />
              <span>
                รอผลทอยเต๋า: <strong>{pendingDiceChallenge.title}</strong> ({pendingDiceChallenge.required_stats.join(' + ')}, DC {pendingDiceChallenge.dc})
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenPendingDice}
              className="font-hud flex items-center gap-1.5 rounded bg-[#e3a024] px-3 py-1 text-[11px] font-bold text-slate-950 transition hover:bg-[#eeb440]"
            >
              <Dices className="h-3.5 w-3.5" />
              เปิดหน้าทอยเต๋า
            </button>
          </div>
        )}

        {activeShop && activeShop.items.length > 0 && onOpenShop && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded border border-[#e3a024]/45 bg-[#e3a024]/10 px-3.5 py-2 text-xs">
            <div className="flex items-center gap-2 text-amber-100">
              <ShoppingBag className="h-4 w-4 text-[#e3a024]" />
              <span>
                กำลังอยู่ที่ร้าน <strong>{activeShop.shop_name}</strong> ({activeShop.items.filter((i) => i.stock > 0).length} รายการ)
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenShop}
              className="font-hud flex items-center gap-1.5 rounded bg-[#e3a024] px-3 py-1 text-[11px] font-bold text-slate-950 transition hover:bg-[#eeb440]"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              เปิดหน้าร้านค้า
            </button>
          </div>
        )}

        {/* SAO Floating Menu Choice Rows */}
        {latestChoices.length > 0 && !isLoading && (
          <div className="mb-3 grid gap-1.5 sm:grid-cols-2">
            {latestChoices.map((choice, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSendMessage(choice)}
                className="sao-menu-row group flex items-center gap-2.5 rounded px-3 py-2 text-left text-xs text-slate-200"
              >
                <span className="font-hud flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border border-slate-400/25 bg-white/[0.04] text-[10px] font-bold text-slate-300 group-hover:border-[#e3a024]/60 group-hover:text-[#e3a024]">
                  {idx + 1}
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
            placeholder="พิมพ์การกระทำหรือบทพูดของคุณอย่างอิสระ..."
            className="flex-1 rounded border border-slate-300/20 bg-[#121923] px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:border-[#e3a024] focus:outline-none disabled:opacity-60"
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
              title="เปิดหน้าทอยลูกเต๋า 1d20 สำหรับการกระทำนี้"
              className="font-hud flex items-center gap-1.5 rounded border border-slate-300/25 bg-white/[0.05] px-3 py-2.5 text-xs font-semibold text-slate-200 transition hover:border-[#e3a024]/60 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Dices className="h-4 w-4 text-[#e3a024]" />
              <span className="hidden md:inline">ทอยเต๋า</span>
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="font-hud flex items-center gap-1.5 rounded bg-[#e3a024] px-4 py-2.5 text-xs font-bold tracking-wider text-slate-950 transition hover:bg-[#eeb440] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">ส่งคำสั่ง</span>
          </button>
        </form>
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
