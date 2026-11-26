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
  equipment: { label: 'อาวุธ / อุปกรณ์', color: 'bg-white/8 text-slate-200 border-slate-300/25' },
  consumable: { label: 'ไอเทมกดใช้', color: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30' },
  material: { label: 'วัตถุดิบ', color: 'bg-[#e3a024]/15 text-amber-200 border-[#e3a024]/35' },
  special: { label: 'ไอเทมพิเศษ', color: 'bg-rose-500/15 text-rose-200 border-rose-400/30' },
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
    <div className="space-y-3">
      {/* Sub-Section Switcher */}
      <div className="grid grid-cols-3 gap-1 border-b border-white/[0.08] pb-2">
        <button
          type="button"
          onClick={() => setTab('inventory')}
          className={`flex items-center justify-center gap-1 rounded py-1.5 text-[11px] font-semibold transition ${
            tab === 'inventory'
              ? 'bg-[#e3a024]/20 text-amber-100'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Backpack className="h-3.5 w-3.5" />
          กระเป๋า ({inventory.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('world')}
          className={`flex items-center justify-center gap-1 rounded py-1.5 text-[11px] font-semibold transition ${
            tab === 'world'
              ? 'bg-[#e3a024]/20 text-amber-100'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <GitBranch className="h-3.5 w-3.5" />
          ปาร์ตี้ &amp; โลก
        </button>
        <button
          type="button"
          onClick={() => setTab('wiki')}
          className={`flex items-center justify-center gap-1 rounded py-1.5 text-[11px] font-semibold transition ${
            tab === 'wiki'
              ? 'bg-[#e3a024]/20 text-amber-100'
              : 'text-slate-400 hover:text-slate-200'
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
          <div className="flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <Info className="h-3 w-3 text-slate-400" />
              ชี้เมาส์หรือแตะที่ไอเทมเพื่อดูสรรพคุณ
            </span>
          </div>

          <div className="space-y-1.5">
            {inventory.length === 0 ? (
              <p className="py-4 text-center text-xs text-slate-500">กระเป๋าว่างเปล่า</p>
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
                    className={`flex cursor-pointer items-center justify-between rounded border px-3 py-2 text-xs transition ${
                      isSelected
                        ? 'border-[#e3a024]/60 bg-[#e3a024]/10'
                        : 'border-slate-300/10 bg-white/[0.025] hover:border-slate-300/25'
                    }`}
                  >
                    <div className="min-w-0">
                      <span className="font-medium text-slate-100">{item.name}</span>
                      <span className="ml-2 rounded bg-white/8 px-1.5 py-0.5 text-[10px] text-slate-300">
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
                        className="shrink-0 rounded border border-slate-300/20 bg-white/[0.05] px-2 py-0.5 text-[10px] font-medium text-slate-200 hover:border-[#e3a024]/50 hover:text-amber-200 disabled:opacity-45"
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
                        className={`shrink-0 rounded border px-2 py-0.5 text-[10px] font-medium transition ${
                          equippedItems.includes(item.name)
                            ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-200'
                            : 'border-slate-300/20 bg-white/[0.04] text-slate-300 hover:border-[#e3a024]/50 hover:text-amber-200'
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

          {/* SAO Item Description Card */}
          {activeItem && (
            <div className="animate-alert-pop rounded border border-slate-300/20 bg-[#0b1018] p-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-raj text-sm font-bold text-slate-100">
                  {activeItem.name}
                </span>
                <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${activeCat.color}`}>
                  {activeCat.label}
                </span>
              </div>
              <div className="mt-1.5 leading-relaxed text-slate-300">
                {activeDesc ? (
                  <p>{activeDesc}</p>
                ) : loadingItemName === activeItem.name ? (
                  <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Loader2 className="h-3 w-3 animate-spin text-[#e3a024]" />
                    Cardinal กำลังวิเคราะห์คำอธิบายไอเทม...
                  </span>
                ) : null}
              </div>
            </div>
          )}

          {/* Marriage Shared Inventory & Shared Home */}
          {isMarried && (
            <div className="rounded border border-[#e3a024]/40 bg-[#e3a024]/[0.07] p-3">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-200">
                <span className="flex items-center gap-1.5">
                  <PackageOpen className="h-3.5 w-3.5" />
                  Shared Inventory ({worldState.player.spouse})
                </span>
              </div>
              {sharedHome && (
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-amber-100/85">
                  <Home className="h-3.5 w-3.5 text-[#e3a024]" />
                  <span>บ้านร่วมกัน: {sharedHome}</span>
                </div>
              )}
              <div className="mt-2 space-y-1 text-[11px] text-slate-300">
                {sharedInventory.length === 0 ? (
                  <p className="text-amber-100/65">
                    ปลดล็อกช่องเก็บของร่วมแล้ว พิมพ์เก็บหรือแบ่งไอเทมกับคู่สมรสได้ทันที
                  </p>
                ) : (
                  sharedInventory.map((item) => (
                    <div
                      key={item.name}
                      onMouseEnter={() => setHoveredItem(item)}
                      onClick={() =>
                        setPinnedItem((prev) => (prev?.name === item.name ? null : item))
                      }
                      className="flex cursor-pointer justify-between rounded px-1.5 py-0.5 hover:bg-[#e3a024]/15"
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
            <div className="flex items-center gap-1.5 font-semibold text-slate-200">
              <Users className="h-3.5 w-3.5 text-[#e3a024]" />
              สมาชิกปาร์ตี้ปัจจุบัน
            </div>
            {partyMembers.length === 0 ? (
              <p className="mt-1 text-[11px] text-slate-500">กำลังเดินทางแบบ Solo Player</p>
            ) : (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {partyMembers.map((member) => (
                  <span
                    key={member}
                    className="flex items-center gap-1.5 rounded-full border border-slate-300/25 bg-white/[0.05] py-0.5 pl-0.5 pr-2.5 text-[11px] text-slate-200"
                  >
                    <CharacterAvatar name={member} size="xs" ringClassName="border-slate-300/60" />
                    {member}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-200/10 pt-2.5">
            <div className="flex items-center gap-1.5 font-semibold text-amber-200">
              <GitBranch className="h-3.5 w-3.5 text-[#e3a024]" />
              Butterfly Effects &amp; World Events
            </div>
            <div className="mt-1.5 max-h-36 space-y-1.5 overflow-y-auto pr-1">
              {butterflyEffects.length === 0 ? (
                <p className="text-[11px] text-slate-500">
                  ยังไม่มีการเปลี่ยนแปลงเส้นเรื่องสำคัญในตอนนี้
                </p>
              ) : (
                butterflyEffects.map((ev, i) => (
                  <div
                    key={i}
                    className="rounded border border-slate-300/10 bg-[#0b1018] px-2.5 py-1.5 text-[11px] text-slate-300"
                  >
                    · {ev}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-3 space-y-2.5 text-xs">
          <div className="text-[11px] text-slate-400">
            เชื่อมต่อกับ{' '}
            <a
              href="https://swordartonline.fandom.com/wiki/Sword_Art_Online_Wiki"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-amber-300 underline hover:text-amber-200"
            >
              SAO Fandom Wiki
            </a>{' '}
            (ดึงข้อมูลอัตโนมัติทุกเทิร์น &amp; ค้นหาได้ที่นี่)
          </div>

          <form onSubmit={handleWikiSubmit} className="flex gap-1.5">
            <input
              type="text"
              value={wikiQuery}
              onChange={(e) => setWikiQuery(e.target.value)}
              placeholder="ค้นหาตัวละคร ชั้น บอส อาวุธ..."
              className="flex-1 rounded border border-slate-300/20 bg-[#0b1018] px-2.5 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:border-[#e3a024] focus:outline-none"
            />
            <button
              type="submit"
              disabled={wikiLoading || !wikiQuery.trim()}
              className="flex items-center gap-1 rounded border border-slate-300/25 bg-white/[0.06] px-2.5 py-1.5 text-xs font-medium text-slate-200 hover:border-[#e3a024]/50 disabled:opacity-45"
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
                className="rounded border border-slate-300/12 bg-white/[0.03] px-2 py-0.5 text-[10px] text-slate-300 hover:border-[#e3a024]/45 hover:text-amber-200"
              >
                {topic}
              </button>
            ))}
          </div>

          <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
            {wikiLoading ? (
              <div className="flex items-center justify-center gap-2 py-6 text-slate-300">
                <Loader2 className="h-4 w-4 animate-spin text-[#e3a024]" />
                <span>กำลังดึงข้อมูลจาก SAO Fandom Wiki...</span>
              </div>
            ) : wikiResults.length > 0 ? (
              wikiResults.map((entry) => (
                <div
                  key={entry.title}
                  className="rounded border border-slate-300/15 bg-[#0b1018] p-2.5"
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
                        className="h-12 w-12 shrink-0 rounded border border-slate-300/15 object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-raj truncate text-sm font-bold text-slate-100">
                          {entry.title}
                        </span>
                        <a
                          href={entry.url}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 text-slate-400 hover:text-amber-300"
                          title="เปิดบน SAO Fandom Wiki"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                      <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-slate-400">
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
                        className="mt-1.5 flex items-center gap-1 rounded border border-slate-300/20 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-slate-200 hover:border-[#e3a024]/50 hover:text-amber-200 disabled:opacity-45"
                      >
                        <Sparkles className="h-3 w-3 text-[#e3a024]" />
                        นำเข้าสู่เนื้อเรื่อง
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : wikiSearchedOnce ? (
              <p className="py-4 text-center text-[11px] text-slate-500">
                ไม่พบบทความที่ตรงกับคำค้นหา
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
