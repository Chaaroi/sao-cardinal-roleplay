import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import {
  BookOpen,
  Bot,
  Camera,
  ChevronDown,
  ChevronUp,
  Dices,
  Download,
  ExternalLink,
  Loader2,
  Maximize2,
  Send,
  ShoppingBag,
  Sparkles,
  Square,
  User,
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
    <div className="sao-panel flex h-full min-h-[540px] flex-col rounded-xl overflow-hidden">
      {/* Chat Header */}
      <div className="flex items-center justify-between border-b border-cyan-200/20 bg-slate-950/40 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
          <span className="font-hud text-xs font-bold tracking-widest text-cyan-100 uppercase">
            Cardinal Narrative Log
          </span>
        </div>
        <span className="text-[11px] text-slate-400">
          พิมพ์คำสั่งได้อย่างอิสระ หรือเลือก Choice ด้านล่าง
        </span>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">
        {messages.map((msg) => {
          const isUser = msg.role === 'user'
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${
                  isUser
                    ? 'border-sky-300/60 bg-sky-500/25 text-sky-100'
                    : 'border-cyan-300/60 bg-cyan-500/20 text-cyan-200'
                }`}
              >
                {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`max-w-[88%] rounded-xl border px-4 py-3 text-sm leading-relaxed ${
                  isUser
                    ? 'border-sky-300/35 bg-sky-500/15 text-sky-50'
                    : 'border-white/15 bg-slate-900/65 text-slate-100'
                }`}
              >
                <div className="mb-1.5 flex items-center justify-between gap-3 text-[11px]">
                  <span className="font-hud font-bold tracking-wider uppercase text-cyan-200">
                    {isUser ? playerName : 'Cardinal System // GM'}
                  </span>
                  {msg.modelUsed && !isUser && (
                    <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-300">
                      {msg.modelUsed}
                    </span>
                  )}
                </div>

                {!isUser &&
                  msg.stateSnapshot &&
                  msg.stateSnapshot.characters_in_scene.length > 0 && (
                    <div className="mb-2 flex flex-wrap items-center gap-2 border-b border-white/10 pb-2">
                      {msg.stateSnapshot.characters_in_scene.map((ch) => (
                        <div
                          key={ch.name}
                          className="flex items-center gap-1.5 rounded-full border border-cyan-300/30 bg-slate-950/60 py-0.5 pl-0.5 pr-2.5 text-[11px]"
                        >
                          <CharacterAvatar
                            name={ch.name}
                            size="xs"
                            ringClassName={
                              ch.is_married
                                ? 'border-amber-300'
                                : ch.affection >= 500
                                  ? 'border-pink-400'
                                  : 'border-cyan-300/70'
                            }
                          />
                          <span className="font-semibold text-cyan-100">{ch.name}</span>
                          <span className="text-[10px] text-slate-400">({ch.mood})</span>
                        </div>
                      ))}
                    </div>
                  )}

                {isUser ? (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <div className="sao-markdown text-sm text-slate-100">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                )}

                {/* Event CG Image Rendering */}
                {!isUser && msg.eventImage && (
                  <div className="mt-3 overflow-hidden rounded-xl border border-cyan-300/45 bg-slate-950/80 shadow-[0_0_24px_rgba(56,189,248,0.2)]">
                    <div className="flex items-center justify-between border-b border-white/10 bg-slate-900/80 px-3 py-1.5 text-[11px]">
                      <div className="flex items-center gap-1.5 font-semibold text-cyan-200">
                        <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                        <span>
                          {msg.eventImage.eventType === 'marriage'
                            ? '💍 MARRIAGE EVENT CG'
                            : '📸 EVENT CG'}
                          {msg.eventImage.characterName ? ` • ${msg.eventImage.characterName}` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setLightboxCG(msg.eventImage!)}
                          className="rounded p-1 text-slate-300 hover:bg-white/10 hover:text-white"
                          title="ขยายภาพเต็มจอ"
                        >
                          <Maximize2 className="h-3.5 w-3.5" />
                        </button>
                        <a
                          href={msg.eventImage.imageUrl}
                          download={`sao-cg-${msg.eventImage.characterName || 'scene'}.jpg`}
                          className="rounded p-1 text-slate-300 hover:bg-white/10 hover:text-white"
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
                        className="max-h-80 w-full object-cover transition duration-300 hover:scale-[1.02]"
                      />
                    </button>
                    <div className="flex items-center justify-between px-3 py-1.5 text-[11px] text-slate-300">
                      <span>{msg.eventImage.caption}</span>
                      {msg.eventImage.modelUsed && (
                        <span className="font-mono text-[10px] text-slate-400">
                          {msg.eventImage.modelUsed}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {!isUser && !msg.eventImage && generatingImageMsgId === msg.id && (
                  <div className="mt-3 flex items-center gap-2 rounded-lg border border-cyan-300/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-100">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-300" />
                    <span>Cardinal กำลังเรนเดอร์ภาพ Event CG ให้ฉากนี้...</span>
                  </div>
                )}

                {msg.stateSnapshot && (
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedJsonId(expandedJsonId === msg.id ? null : msg.id)
                      }
                      className="flex items-center gap-1 text-[11px] text-cyan-300/80 hover:text-cyan-200"
                    >
                      {expandedJsonId === msg.id ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                      สถานะที่ Cardinal อัปเดต ({msg.stateSnapshot.location})
                    </button>

                    {!msg.eventImage &&
                      onRequestSceneImage &&
                      generatingImageMsgId !== msg.id && (
                        <button
                          type="button"
                          disabled={Boolean(generatingImageMsgId)}
                          onClick={() => onRequestSceneImage(msg.id)}
                          className="flex items-center gap-1 rounded border border-pink-300/35 bg-pink-500/10 px-2 py-0.5 text-[10px] font-semibold text-pink-100 transition hover:bg-pink-500/25 disabled:opacity-40"
                        >
                          <Camera className="h-3 w-3" />
                          เจนภาพฉากนี้
                        </button>
                      )}
                  </div>
                )}
                {msg.stateSnapshot && expandedJsonId === msg.id && (
                  <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-slate-950/80 p-2.5 text-[11px] text-cyan-100">
                    {JSON.stringify(msg.stateSnapshot, null, 2)}
                  </pre>
                )}

                {!isUser && msg.wikiReferences && msg.wikiReferences.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-white/10 pt-2">
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <BookOpen className="h-3 w-3 text-cyan-300" />
                      อ้างอิง SAO Wiki:
                    </span>
                    {msg.wikiReferences.map((ref) => (
                      <a
                        key={ref.title}
                        href={ref.url}
                        target="_blank"
                        rel="noreferrer"
                        title={ref.summary}
                        className="flex items-center gap-1 rounded border border-cyan-300/30 bg-cyan-500/10 px-1.5 py-0.5 text-[10px] text-cyan-200 hover:bg-cyan-400/25"
                      >
                        {ref.title}
                        <ExternalLink className="h-2.5 w-2.5 opacity-75" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {isLoading && (
          <div className="space-y-3">
            {streamingText ? (
              <div className="flex gap-3">
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-300/60 bg-cyan-500/20 text-cyan-200">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="max-w-[88%] rounded-xl border border-cyan-300/35 bg-slate-900/75 px-4 py-3 text-sm text-slate-100">
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-[11px]">
                    <span className="font-hud font-bold tracking-wider uppercase text-cyan-200">
                      Cardinal System // Streaming...
                    </span>
                    <span className="text-[10px] text-cyan-300/80">{elapsedSeconds.toFixed(1)}s</span>
                  </div>
                  <div className="sao-markdown text-sm text-slate-100">
                    <ReactMarkdown>{streamingText}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cyan-300/25 bg-cyan-500/10 px-4 py-2.5 text-xs text-cyan-100">
              <div className="flex items-center gap-2.5">
                <Loader2 className="h-4 w-4 animate-spin text-cyan-300" />
                <span>
                  {streamingText
                    ? `กำลังรับข้อความจาก Cardinal... (${elapsedSeconds.toFixed(1)}s)`
                    : `Cardinal System กำลังคิดและเชื่อมต่อโมเดล... (${elapsedSeconds.toFixed(1)}s)`}
                </span>
              </div>
              {onCancelRequest && (
                <button
                  type="button"
                  onClick={onCancelRequest}
                  className="flex items-center gap-1 rounded border border-rose-300/40 bg-rose-500/20 px-2.5 py-1 text-[11px] font-semibold text-rose-100 hover:bg-rose-500/35"
                >
                  <Square className="h-3 w-3 fill-rose-200" />
                  หยุด
                </button>
              )}
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-xl border border-rose-400/50 bg-rose-500/15 px-4 py-3 text-sm text-rose-100">
            <div className="leading-relaxed">
              <strong>เกิดข้อผิดพลาด:</strong> {errorMessage}
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {onRetry && (
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={onRetry}
                  className="rounded-md border border-cyan-300/60 bg-cyan-500/25 px-3 py-1 text-xs font-semibold text-cyan-50 hover:bg-cyan-500/40 disabled:opacity-45"
                >
                  ลองใหม่อีกครั้ง (Retry)
                </button>
              )}
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="rounded-md border border-rose-200/50 bg-rose-500/25 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-500/40"
                >
                  เปิด Settings เช็กคีย์ / โมเดล
                </button>
              )}
              {onEnableDemoMode && (
                <button
                  type="button"
                  onClick={onEnableDemoMode}
                  className="rounded-md border border-amber-300/50 bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-100 hover:bg-amber-500/35"
                >
                  สลับใช้ Demo Mode เล่นทดสอบ
                </button>
              )}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested Choices + Shop Bar + Free Input */}
      <div className="border-t border-cyan-200/20 bg-slate-950/55 p-3 sm:p-4">
        {pendingDiceChallenge && onOpenPendingDice && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-cyan-300/60 bg-gradient-to-r from-cyan-500/20 to-slate-900/85 px-3.5 py-2 text-xs">
            <div className="flex items-center gap-2 text-cyan-100">
              <Dices className="h-4 w-4 text-amber-300" />
              <span>
                รอผลทอยเต๋า: <strong>{pendingDiceChallenge.title}</strong> (ใช้{' '}
                {pendingDiceChallenge.required_stats.join(' + ')}, DC {pendingDiceChallenge.dc})
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenPendingDice}
              className="font-hud flex items-center gap-1.5 rounded-md border border-amber-200 bg-gradient-to-r from-amber-400 to-yellow-300 px-3 py-1 text-[11px] font-bold text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.45)] transition hover:brightness-110"
            >
              <Dices className="h-3.5 w-3.5" />
              เปิดหน้าทอยเต๋า
            </button>
          </div>
        )}
        {activeShop && activeShop.items.length > 0 && onOpenShop && (
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-300/55 bg-gradient-to-r from-amber-500/20 to-slate-900/80 px-3.5 py-2 text-xs">
            <div className="flex items-center gap-2 text-amber-100">
              <ShoppingBag className="h-4 w-4 text-amber-300" />
              <span>
                กำลังอยู่ที่ร้าน <strong>{activeShop.shop_name}</strong> (มีสินค้า{' '}
                {activeShop.items.filter((i) => i.stock > 0).length} รายการ)
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenShop}
              className="font-hud flex items-center gap-1.5 rounded-md border border-amber-200 bg-gradient-to-r from-amber-400 to-yellow-300 px-3 py-1 text-[11px] font-bold text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.45)] transition hover:brightness-110"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              เปิดหน้าร้านค้า
            </button>
          </div>
        )}
        {latestChoices.length > 0 && !isLoading && (
          <div className="mb-3">
            <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-cyan-200">
              <Sparkles className="h-3 w-3" />
              ทางเลือกแนะนำ (คลิกเพื่อส่งทันที หรือพิมพ์เองด้านล่าง):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {latestChoices.map((choice, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSendMessage(choice)}
                  className="rounded-lg border border-cyan-300/35 bg-cyan-500/10 px-3 py-1.5 text-left text-xs text-cyan-50 transition hover:border-cyan-300 hover:bg-cyan-400/25"
                >
                  {idx + 1}. {choice}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="พิมพ์การกระทำหรือบทพูดของคุณอย่างอิสระ (เช่น 'หันไปยิ้มให้ Asuna แล้วชวนออกล่าบอส')..."
            className="flex-1 rounded-lg border border-cyan-200/30 bg-slate-900/80 px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/25 disabled:opacity-60"
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
              title="เปิดหน้าทอยลูกเต๋า 1d20 สำหรับการกระทำนี้ (อ้างอิง Stat + อุปกรณ์)"
              className="font-hud flex items-center gap-1.5 rounded-lg border border-amber-300/60 bg-amber-500/20 px-3 py-2.5 text-xs font-bold text-amber-100 transition hover:bg-amber-400/30 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Dices className="h-4 w-4 text-amber-300" />
              <span className="hidden md:inline">ทอยเต๋า</span>
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="font-hud flex items-center gap-1.5 rounded-lg border border-cyan-200/60 bg-gradient-to-r from-cyan-500 to-sky-400 px-4 py-2.5 text-xs font-bold tracking-wider text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">ส่งคำสั่ง</span>
          </button>
        </form>
      </div>

      {/* Lightbox Modal for Fullscreen Event CG */}
      {lightboxCG && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 p-4 backdrop-blur-md"
          onClick={() => setLightboxCG(null)}
        >
          <div
            className="sao-panel relative max-w-4xl overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/15 px-4 py-2.5">
              <span className="font-hud text-xs font-bold text-cyan-200">
                {lightboxCG.caption}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={lightboxCG.imageUrl}
                  download={`sao-cg-${lightboxCG.characterName || 'scene'}.jpg`}
                  className="flex items-center gap-1 rounded border border-cyan-300/40 bg-cyan-500/20 px-2.5 py-1 text-xs text-cyan-100 hover:bg-cyan-500/35"
                >
                  <Download className="h-3.5 w-3.5" />
                  บันทึกภาพ
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxCG(null)}
                  className="rounded p-1 text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <img
              src={lightboxCG.imageUrl}
              alt={lightboxCG.caption}
              className="max-h-[80vh] w-full object-contain bg-black"
            />
          </div>
        </div>
      )}
    </div>
  )
}
