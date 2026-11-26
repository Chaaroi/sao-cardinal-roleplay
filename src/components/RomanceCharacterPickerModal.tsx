import { useEffect, useState } from 'react'
import {
  BookOpen,
  Check,
  Heart,
  Loader2,
  Search,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
} from 'lucide-react'
import { createCustomWikiCharacterPreset, ROMANCE_ROSTER } from '../data/romanceRoster'
import { fetchCharacterWikiProfile, searchSaoWiki } from '../services/wikiLoreService'
import type { RomanceCharacterProfile } from '../types/game'
import { CharacterAvatar } from './CharacterAvatar'

interface RomanceCharacterPickerModalProps {
  initialSelected?: RomanceCharacterProfile | null
  onSelect: (character: RomanceCharacterProfile, startImmediately?: boolean) => void
  onClose: () => void
}

export function RomanceCharacterPickerModal({
  initialSelected,
  onSelect,
  onClose,
}: RomanceCharacterPickerModalProps) {
  const [filterText, setFilterText] = useState('')
  const [wikiResults, setWikiResults] = useState<RomanceCharacterProfile[]>([])
  const [isSearchingWiki, setIsSearchingWiki] = useState(false)
  const [wikiSearchError, setWikiSearchError] = useState<string | null>(null)

  const [selected, setSelected] = useState<RomanceCharacterProfile>(
    initialSelected ?? ROMANCE_ROSTER[0]
  )
  const [liveWikiInfo, setLiveWikiInfo] = useState<{
    title: string
    excerpt: string
    url: string
  } | null>(null)
  const [isLoadingWikiBio, setIsLoadingWikiBio] = useState(false)

  useEffect(() => {
    let active = true
    setIsLoadingWikiBio(true)
    setLiveWikiInfo(null)

    void fetchCharacterWikiProfile(selected.wikiTitle || selected.name)
      .then((res) => {
        if (!active || !res) return
        setLiveWikiInfo({
          title: res.entry.title,
          excerpt: res.personalitySnippet || res.entry.summary,
          url: res.entry.url,
        })
        if (!selected.wikiExcerpt && (res.personalitySnippet || res.entry.summary)) {
          setSelected((prev) =>
            prev.id === selected.id
              ? {
                  ...prev,
                  wikiExcerpt: (res.personalitySnippet || res.entry.summary).slice(0, 500),
                  thumbnailUrl: prev.thumbnailUrl || res.entry.thumbnailUrl,
                }
              : prev
          )
        }
      })
      .finally(() => {
        if (active) setIsLoadingWikiBio(false)
      })

    return () => {
      active = false
    }
  }, [selected.id, selected.name, selected.wikiTitle])

  const filteredRoster = ROMANCE_ROSTER.filter((char) => {
    const q = filterText.trim().toLowerCase()
    if (!q) return true
    return (
      char.name.toLowerCase().includes(q) ||
      char.wikiTitle.toLowerCase().includes(q) ||
      char.roleTitle.toLowerCase().includes(q) ||
      char.perk.title.toLowerCase().includes(q)
    )
  })

  const combinedList = [
    ...filteredRoster,
    ...wikiResults.filter(
      (wr) => !filteredRoster.some((fr) => fr.name.toLowerCase() === wr.name.toLowerCase())
    ),
  ]

  const handleWikiSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const query = filterText.trim()
    if (!query) return
    setIsSearchingWiki(true)
    setWikiSearchError(null)
    try {
      const entries = await searchSaoWiki(query, 4)
      if (entries.length === 0) {
        setWikiSearchError('ไม่พบตัวละครที่ตรงกันใน SAO Fandom Wiki')
      } else {
        const mapped = entries.map((entry) => createCustomWikiCharacterPreset(entry, query))
        setWikiResults(mapped)
        setSelected(mapped[0])
      }
    } catch {
      setWikiSearchError('ไม่สามารถเชื่อมต่อ SAO Fandom Wiki ได้ในขณะนี้')
    } finally {
      setIsSearchingWiki(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06090e]/84 p-3 sm:p-5 backdrop-blur-sm">
      <div className="sao-panel flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300/15 bg-[#0b1018] px-5 py-4">
          <div>
            <div className="font-hud flex items-center gap-1.5 text-[10px] font-bold tracking-[0.18em] text-[#e3a024] uppercase">
              <Heart className="h-3.5 w-3.5 text-rose-400" />
              Pre-Game Romance Mode // เลือกตัวละครที่ต้องการจีบ
            </div>
            <h2 className="font-hud mt-0.5 text-lg font-bold text-white">
              ทำความรู้จักและสานสัมพันธ์ก่อนเข้าสู่โลกเกมด้วยกัน
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              ข้อมูลบุคลิก ความชอบ และของที่เกลียดอ้างอิงจาก SAO Fandom Wiki — เมื่อคบหากันแล้ว สามารถพกพาความสัมพันธ์และสิทธิ์พิเศษไปใช้ในเซฟอื่นๆ ได้
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
            aria-label="ปิดหน้าต่างเลือกตัวละคร"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="grid flex-1 overflow-hidden lg:grid-cols-12">
          {/* Left: Search & Character Grid */}
          <div className="flex flex-col overflow-hidden border-b border-slate-300/12 bg-[#0b1018]/65 lg:col-span-5 lg:border-r lg:border-b-0">
            <form onSubmit={(e) => void handleWikiSearch(e)} className="border-b border-slate-300/12 p-3.5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                    placeholder="กรองชื่อหรือค้นจาก SAO Wiki..."
                    className="w-full rounded border border-slate-300/20 bg-[#121923] py-1.5 pr-3 pl-8 text-xs text-slate-100 placeholder-slate-500 focus:border-[#e3a024] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearchingWiki || !filterText.trim()}
                  className="flex shrink-0 items-center gap-1 rounded border border-[#e3a024]/50 bg-[#e3a024]/15 px-2.5 py-1.5 text-[11px] font-semibold text-[#f0c05e] transition hover:bg-[#e3a024]/25 disabled:opacity-45"
                >
                  {isSearchingWiki ? <Loader2 className="h-3 w-3 animate-spin" /> : <BookOpen className="h-3 w-3" />}
                  ค้นจาก Wiki
                </button>
              </div>
              {wikiSearchError && (
                <div className="mt-1.5 text-[11px] text-rose-300">{wikiSearchError}</div>
              )}
            </form>

            <div className="flex-1 space-y-1.5 overflow-y-auto p-3">
              {combinedList.map((char) => {
                const isSelected = selected.id === char.id
                return (
                  <button
                    key={char.id}
                    type="button"
                    onClick={() => setSelected(char)}
                    className={`flex w-full items-center gap-3 rounded-md border p-2.5 text-left transition ${
                      isSelected
                        ? 'border-[#e3a024] bg-[#e3a024]/15'
                        : 'border-slate-300/12 bg-[#121923]/80 hover:border-slate-300/35'
                    }`}
                  >
                    <CharacterAvatar
                      name={char.name}
                      size="md"
                      ringClassName={isSelected ? 'border-[#e3a024]' : 'border-slate-300/40'}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-raj truncate text-sm font-bold text-white">
                          {char.name}
                        </span>
                        <span className="rounded border border-slate-300/15 bg-white/[0.04] px-1.5 py-0.5 text-[9px] text-slate-300">
                          {char.perk.actionType === 'shop' ? 'ร้านค้าพิเศษ' : 'สกิลคู่หู'}
                        </span>
                      </div>
                      <div className="truncate text-[11px] text-slate-400">{char.roleTitle}</div>
                      <div className="mt-0.5 truncate text-[10px] text-[#f0c05e]/90">
                        สิทธิ์พิเศษ: {char.perk.shortLabel}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right: Selected Character Wiki Detail & Perks */}
          <div className="flex flex-1 flex-col overflow-y-auto p-5 lg:col-span-7">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-300/12 pb-4">
              <div className="flex items-center gap-3.5">
                <CharacterAvatar
                  name={selected.name}
                  size="lg"
                  ringClassName="border-[#e3a024]"
                />
                <div>
                  <div className="font-hud text-[10px] font-bold tracking-[0.16em] text-[#e3a024] uppercase">
                    Wiki Profile: {selected.wikiTitle}
                  </div>
                  <h3 className="font-hud text-xl font-bold text-white">{selected.name}</h3>
                  <div className="text-xs text-slate-300">{selected.roleTitle}</div>
                </div>
              </div>

              <div className="rounded border border-slate-300/15 bg-[#0b1018] px-3 py-1.5 text-[11px] text-slate-300">
                สถานที่พบกันก่อนเข้าเกม:
                <div className="mt-0.5 font-medium text-slate-100">{selected.realWorldSetting}</div>
              </div>
            </div>

            {/* Personality & Live Wiki Excerpt */}
            <div className="mt-4 space-y-3">
              <div className="rounded-md border border-slate-300/15 bg-[#0b1018] p-3.5">
                <div className="font-hud flex items-center justify-between text-[11px] font-bold tracking-wider text-slate-200 uppercase">
                  <span>บุคลิกและข้อมูลจาก SAO Wiki</span>
                  {isLoadingWikiBio && (
                    <span className="flex items-center gap-1 text-[10px] font-normal text-[#f0c05e]">
                      <Loader2 className="h-3 w-3 animate-spin" /> กำลังดึงข้อมูล Wiki ล่าสุด...
                    </span>
                  )}
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-200">
                  {selected.personality}
                </p>
                {liveWikiInfo && (
                  <div className="mt-2.5 border-t border-slate-300/10 pt-2 text-[11px] leading-relaxed text-slate-400">
                    <span className="font-semibold text-slate-300">SAO Fandom Wiki ({liveWikiInfo.title}):</span>{' '}
                    {liveWikiInfo.excerpt}
                  </div>
                )}
              </div>

              {/* Loves / Likes / Dislikes */}
              <div className="grid gap-2.5 sm:grid-cols-3">
                <div className="rounded-md border border-rose-400/30 bg-rose-500/[0.06] p-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-200">
                    <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400" />
                    สิ่งที่รักเป็นพิเศษ
                  </div>
                  <ul className="mt-1.5 space-y-1 text-[11px] leading-snug text-slate-200">
                    {selected.loves.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-md border border-emerald-400/30 bg-emerald-500/[0.06] p-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-200">
                    <ThumbsUp className="h-3.5 w-3.5 text-emerald-400" />
                    สิ่งที่ชอบ
                  </div>
                  <ul className="mt-1.5 space-y-1 text-[11px] leading-snug text-slate-200">
                    {selected.likes.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-md border border-slate-400/25 bg-white/[0.03] p-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
                    <ThumbsDown className="h-3.5 w-3.5 text-slate-400" />
                    สิ่งที่ไม่ชอบ / เกลียด
                  </div>
                  <ul className="mt-1.5 space-y-1 text-[11px] leading-snug text-slate-300">
                    {selected.dislikes.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Companion Perk Box */}
              <div className="rounded-md border border-[#e3a024]/45 bg-[#e3a024]/[0.08] p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#f0c05e]">
                    <Sparkles className="h-4 w-4 text-[#e3a024]" />
                    สิทธิ์พิเศษที่จะได้รับเมื่อคบหากัน (Affection ≥ {selected.perk.unlockAffection})
                  </div>
                  <span className="rounded border border-[#e3a024]/40 bg-[#e3a024]/15 px-2 py-0.5 text-[10px] font-semibold text-amber-100">
                    ใช้ได้ทั้งในเซฟนี้และพกไปเซฟอื่น
                  </span>
                </div>
                <div className="mt-1.5 text-xs font-semibold text-white">{selected.perk.title}</div>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-200">
                  {selected.perk.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-300/15 bg-[#0b1018] px-5 py-3.5">
          <span className="text-[11px] text-slate-400">
            กำลังเลือก: <strong className="text-white">{selected.name}</strong>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-slate-300/20 bg-white/[0.04] px-3.5 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.08]"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={() => onSelect(selected, false)}
              className="flex items-center gap-1.5 rounded border border-[#e3a024]/55 bg-[#e3a024]/15 px-4 py-2 text-xs font-semibold text-[#f0c05e] transition hover:bg-[#e3a024]/25"
            >
              <Check className="h-3.5 w-3.5" />
              เลือกตัวละครนี้
            </button>
            <button
              type="button"
              onClick={() => onSelect(selected, true)}
              className="font-hud flex items-center gap-1.5 rounded border border-[#f5be58]/60 bg-[#e3a024] px-5 py-2 text-xs font-bold tracking-[0.1em] text-slate-950 uppercase transition hover:bg-[#f0b43c]"
            >
              <Heart className="h-3.5 w-3.5 fill-slate-950" />
              เลือกและเริ่มจีบเลย
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
