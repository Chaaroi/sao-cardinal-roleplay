import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  Backpack,
  BookOpen,
  ExternalLink,
  GitBranch,
  Home,
  Info,
  Loader2,
  PackageOpen,
  Search,
  Sparkles,
  Users,
} from 'lucide-react'
import { getCachedItemDescription, resolveItemDescription } from '../services/itemService'
import { searchSaoWiki } from '../services/wikiLoreService'
import type { AppSettings, GameSession, InventoryItem, WikiLoreEntry } from '../types/game'
import { CharacterAvatar } from './CharacterAvatar'

interface InventoryPanelProps {
  session: GameSession
  settings: AppSettings
  isLoading: boolean
  onQuickAction: (prompt: string) => void
  onToggleEquip?: (itemName: string) => void
}

const CATEGORY_LABELS: Record<NonNullable<InventoryItem['category']>, { label: string; color: string }> = {
  equipment: { label: 'อาวุธ / อุปกรณ์', color: 'bg-sky-500/20 text-sky-200 border-sky-300/35' },
  consumable: { label: 'ไอเทมกดใช้', color: 'bg-emerald-500/20 text-emerald-200 border-emerald-300/35' },
  material: { label: 'วัตถุดิบ', color: 'bg-amber-500/20 text-amber-200 border-amber-300/35' },
  special: { label: 'ไอเทมพิเศษ', color: 'bg-pink-500/20 text-pink-200 border-pink-300/35' },
}

const WIKI_QUICK_TOPICS = ['Asuna', 'Argo', 'Philia', 'Elucidator', 'Laughing Coffin', 'Floor 22']

export function InventoryPanel({
  session,
  settings,
  isLoading,
  onQuickAction,
  onToggleEquip,
}: InventoryPanelProps) {
  const [tab, setTab] = useState<'inventory' | 'world' | 'wiki'>('inventory')
  const [hoveredItem, setHoveredItem] = useState<InventoryItem | null>(null)
  const [pinnedItem, setPinnedItem] = useState<InventoryItem | null>(null)
  const [descriptions, setDescriptions] = useState<Record<string, string>>({})
  const [loadingItemName, setLoadingItemName] = useState<string | null>(null)

  const [wikiQuery, setWikiQuery] = useState('')
  const [wikiResults, setWikiResults] = useState<WikiLoreEntry[]>([])
  const [wikiLoading, setWikiLoading] = useState(false)
  const [wikiSearchedOnce, setWikiSearchedOnce] = useState(false)

  const { inventory, sharedInventory, sharedHome, partyMembers, butterflyEffects, worldState } = session
  const equippedItems = session.equippedItems ?? [session.profile.weapon]
  const isMarried = Boolean(worldState.player.spouse)

  const activeItem = hoveredItem ?? pinnedItem

  useEffect(() => {
    if (!activeItem) return
    const key = activeItem.name.trim().toLowerCase()
    if (descriptions[key]) return

    const syncDesc = getCachedItemDescription(activeItem)
    if (syncDesc) {
      setDescriptions((prev) => ({ ...prev, [key]: syncDesc }))
      return
    }

    let cancelled = false
    setLoadingItemName(activeItem.name)
    void resolveItemDescription({
      item: activeItem,
      apiKey: settings.apiKey,
      model: settings.model,
      worldArc: worldState.world_arc,
      demoMode: settings.demoMode,
    }).then((desc) => {
      if (!cancelled) {
        setDescriptions((prev) => ({ ...prev, [key]: desc }))
        setLoadingItemName((curr) => (curr === activeItem.name ? null : curr))
      }
    })

    return () => {
      cancelled = true
    }
  }, [activeItem, descriptions, settings.apiKey, settings.demoMode, settings.model, worldState.world_arc])

  const handleWikiSearch = async (queryText: string) => {
    const q = queryText.trim()
    if (!q) return
    setWikiQuery(q)
    setWikiLoading(true)
    setWikiSearchedOnce(true)
    try {
      const hits = await searchSaoWiki(q, 5)
      setWikiResults(hits)
    } finally {
      setWikiLoading(false)
    }
  }

  const handleWikiSubmit = (e: FormEvent) => {
    e.preventDefault()
    void handleWikiSearch(wikiQuery)
  }

  const activeDesc = activeItem
    ? descriptions[activeItem.name.trim().toLowerCase()] || getCachedItemDescription(activeItem)
    : null
  const activeCat = CATEGORY_LABELS[activeItem?.category ?? 'special']

  return (
    <div className="sao-panel rounded-xl p-4">
      {/* Tab Switcher */}
      <div className="grid grid-cols-3 gap-1 rounded-lg border border-white/10 bg-slate-950/50 p-1">
        <button
          type="button"
          onClick={() => setTab('inventory')}
          className={`flex items-center justify-center gap-1 rounded-md py-1.5 text-[11px] font-semibold transition ${
            tab === 'inventory'
              ? 'bg-cyan-400/20 text-cyan-100'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Backpack className="h-3.5 w-3.5" />
          กระเป๋า ({inventory.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('world')}
          className={`flex items-center justify-center gap-1 rounded-md py-1.5 text-[11px] font-semibold transition ${
            tab === 'world'
              ? 'bg-cyan-400/20 text-cyan-100'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <GitBranch className="h-3.5 w-3.5" />
          ปาร์ตี้ &amp; โลก
        </button>
        <button
          type="button"
          onClick={() => setTab('wiki')}
          className={`flex items-center justify-center gap-1 rounded-md py-1.5 text-[11px] font-semibold transition ${
            tab === 'wiki'
              ? 'bg-cyan-400/20 text-cyan-100'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BookOpen className="h-3.5 w-3.5" />
          SAO Wiki
        </button>
      </div>

      {tab === 'inventory' ? (
        <div
          className="mt-3 space-y-2.5"
          onMouseLeave={() => setHoveredItem(null)}
        >
          <div className="flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Info className="h-3 w-3 text-cyan-300" />
              ชี้เมาส์หรือแตะที่ไอเทมเพื่อดูสรรพคุณ
            </span>
          </div>

          <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
            {inventory.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-400">กระเป๋าว่างเปล่า</p>
            ) : (
              inventory.map((item) => {
                const isSelected = activeItem?.name === item.name
                return (
                  <div
                    key={item.name}
                    onMouseEnter={() => setHoveredItem(item)}
                    onClick={() =>
                      setPinnedItem((prev) => (prev?.name === item.name ? null : item))
                    }
                    className={`flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-xs transition ${
                      isSelected
                        ? 'border-cyan-300/70 bg-cyan-500/15 shadow-[0_0_12px_rgba(56,189,248,0.18)]'
                        : 'border-white/10 bg-slate-900/55 hover:border-cyan-300/35'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="font-medium text-slate-100">{item.name}</span>
                      <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-cyan-200">
                        x{item.quantity}
                      </span>
                    </div>
                    {item.category === 'consumable' && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={(e) => {
                          e.stopPropagation()
                          onQuickAction(`หยิบใช้ไอเทม "${item.name}" จากกระเป๋า`)
                        }}
                        className="shrink-0 rounded border border-cyan-300/40 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-100 hover:bg-cyan-400/30 disabled:opacity-45"
                      >
                        ใช้ไอเทม
                      </button>
                    )}
                    {item.category === 'equipment' && onToggleEquip && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onToggleEquip(item.name)
                        }}
                        className={`shrink-0 rounded border px-2 py-0.5 text-[10px] font-semibold transition ${
                          equippedItems.includes(item.name)
                            ? 'border-emerald-300/70 bg-emerald-500/25 text-emerald-100'
                            : 'border-sky-300/35 bg-sky-500/10 text-sky-200 hover:bg-sky-400/25'
                        }`}
                      >
                        {equippedItems.includes(item.name) ? 'กำลังสวมใส่' : 'สวมใส่'}
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* SAO Item Description Inspector Tooltip Card */}
          {activeItem && (
            <div className="animate-alert-pop rounded-lg border border-cyan-300/55 bg-slate-950/90 p-3 text-xs shadow-[0_0_20px_rgba(56,189,248,0.22)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-raj text-sm font-bold text-cyan-100">
                  {activeItem.name}
                </span>
                <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${activeCat.color}`}>
                  {activeCat.label}
                </span>
              </div>
              <div className="mt-1.5 leading-relaxed text-slate-200">
                {activeDesc ? (
                  <p>{activeDesc}</p>
                ) : loadingItemName === activeItem.name ? (
                  <span className="flex items-center gap-1.5 text-[11px] text-cyan-300">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Cardinal กำลังวิเคราะห์คำอธิบายไอเทม...
                  </span>
                ) : null}
              </div>
            </div>
          )}

          {/* Marriage Shared Inventory & Shared Home */}
          {isMarried && (
            <div className="rounded-lg border border-amber-300/45 bg-amber-500/10 p-3">
              <div className="flex items-center justify-between text-xs font-bold text-amber-200">
                <span className="flex items-center gap-1.5">
                  <PackageOpen className="h-3.5 w-3.5" />
                  Shared Inventory ({worldState.player.spouse})
                </span>
              </div>
              {sharedHome && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-100/90">
                  <Home className="h-3.5 w-3.5 text-amber-300" />
                  <span>บ้านร่วมกัน: {sharedHome}</span>
                </div>
              )}
              <div className="mt-2 space-y-1 text-[11px] text-slate-200">
                {sharedInventory.length === 0 ? (
                  <p className="text-amber-100/70">
                    ปลดล็อกช่องเก็บของร่วมแล้ว! พิมพ์เก็บ/แบ่งไอเทมกับคู่สมรสได้ทันที
                  </p>
                ) : (
                  sharedInventory.map((item) => (
                    <div
                      key={item.name}
                      onMouseEnter={() => setHoveredItem(item)}
                      onClick={() =>
                        setPinnedItem((prev) => (prev?.name === item.name ? null : item))
                      }
                      className="flex cursor-pointer justify-between rounded px-1.5 py-0.5 hover:bg-amber-400/15"
                    >
                      <span>{item.name}</span>
                      <span className="text-amber-200">x{item.quantity}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      ) : tab === 'world' ? (
        <div className="mt-3 space-y-3 text-xs">
          <div>
            <div className="flex items-center gap-1.5 font-semibold text-cyan-200">
              <Users className="h-3.5 w-3.5" />
              สมาชิกปาร์ตี้ปัจจุบัน
            </div>
            {partyMembers.length === 0 ? (
              <p className="mt-1 text-[11px] text-slate-400">กำลังเดินทางแบบ Solo Player</p>
            ) : (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {partyMembers.map((member) => (
                  <span
                    key={member}
                    className="flex items-center gap-1.5 rounded-full border border-sky-300/40 bg-sky-500/20 py-0.5 pl-0.5 pr-2.5 text-[11px] text-sky-100"
                  >
                    <CharacterAvatar name={member} size="xs" ringClassName="border-sky-300" />
                    {member}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-white/10 pt-2.5">
            <div className="flex items-center gap-1.5 font-semibold text-amber-200">
              <GitBranch className="h-3.5 w-3.5" />
              Butterfly Effects &amp; World Events
            </div>
            <div className="mt-1.5 max-h-36 space-y-1.5 overflow-y-auto pr-1">
              {butterflyEffects.length === 0 ? (
                <p className="text-[11px] text-slate-400">
                  ยังไม่มีการเปลี่ยนแปลงเส้นเรื่องสำคัญในตอนนี้
                </p>
              ) : (
                butterflyEffects.map((ev, i) => (
                  <div
                    key={i}
                    className="rounded border border-amber-300/20 bg-slate-950/60 px-2.5 py-1.5 text-[11px] text-amber-100"
                  >
                    • {ev}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3 space-y-2.5 text-xs">
          <div className="text-[11px] text-slate-300">
            เชื่อมต่อตรงกับ{' '}
            <a
              href="https://swordartonline.fandom.com/wiki/Sword_Art_Online_Wiki"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-cyan-300 underline hover:text-cyan-200"
            >
              SAO Fandom Wiki
            </a>{' '}
            (ดึงข้อมูลอัตโนมัติทุกเทิร์น &amp; ค้นหาเองได้ที่นี่)
          </div>

          <form onSubmit={handleWikiSubmit} className="flex gap-1.5">
            <input
              type="text"
              value={wikiQuery}
              onChange={(e) => setWikiQuery(e.target.value)}
              placeholder="ค้นหาตัวละคร ชั้น บอส อาวุธ (ภาษาอังกฤษ)..."
              className="flex-1 rounded-md border border-cyan-200/25 bg-slate-950/75 px-2.5 py-1.5 text-xs text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={wikiLoading || !wikiQuery.trim()}
              className="flex items-center gap-1 rounded-md border border-cyan-300/50 bg-cyan-500/20 px-2.5 py-1.5 text-xs font-semibold text-cyan-100 hover:bg-cyan-400/35 disabled:opacity-45"
            >
              {wikiLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
            </button>
          </form>

          <div className="flex flex-wrap gap-1">
            {WIKI_QUICK_TOPICS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => void handleWikiSearch(topic)}
                className="rounded border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] text-slate-200 hover:border-cyan-300/45 hover:bg-cyan-500/15"
              >
                {topic}
              </button>
            ))}
          </div>

          <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {wikiLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-cyan-200">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>กำลังดึงข้อมูลจาก SAO Fandom Wiki...</span>
              </div>
            ) : wikiResults.length > 0 ? (
              wikiResults.map((entry) => (
                <div
                  key={entry.title}
                  className="rounded-lg border border-cyan-300/25 bg-slate-950/70 p-2.5"
                >
                  <div className="flex items-start gap-2.5">
                    {entry.thumbnailUrl && (
                      <img
                        src={entry.thumbnailUrl}
                        alt={entry.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                        className="h-12 w-12 shrink-0 rounded-md border border-white/15 object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-raj text-sm font-bold text-cyan-100 truncate">
                          {entry.title}
                        </span>
                        <a
                          href={entry.url}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 text-cyan-300 hover:text-cyan-100"
                          title="เปิดบน SAO Fandom Wiki"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                      <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-slate-300">
                        {entry.summary}
                      </p>
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() =>
                          onQuickAction(
                            `ค้นหาและพบเจอ/อ้างอิงเรื่องราวเกี่ยวกับ "${entry.title}" ตามข้อมูลใน SAO Wiki`
                          )
                        }
                        className="mt-1.5 flex items-center gap-1 rounded border border-cyan-300/35 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-100 hover:bg-cyan-400/30 disabled:opacity-45"
                      >
                        <Sparkles className="h-3 w-3" />
                        นำเข้าสู่เนื้อเรื่อง
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : wikiSearchedOnce ? (
              <p className="py-4 text-center text-[11px] text-slate-400">
                ไม่พบบทความที่ตรงกับคำค้นหา
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
