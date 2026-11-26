import { useState } from 'react'
import {
  ArrowRightLeft,
  Compass,
  FolderOpen,
  Heart,
  KeyRound,
  Play,
  Settings,
  Shield,
  Sparkles,
  Swords,
  Trash2,
} from 'lucide-react'
import { ROMANCE_ROSTER } from '../data/romanceRoster'
import type {
  AppSettings,
  PlayerProfile,
  RomanceCharacterProfile,
  SavedRomanceBond,
  StoryMode,
  WeaponType,
  WorldArc,
} from '../types/game'
import { CharacterAvatar } from './CharacterAvatar'
import { OstControlPill } from './OstControlPill'
import type { OstControlsState } from './OstControlPill'
import { RomanceCharacterPickerModal } from './RomanceCharacterPickerModal'

interface LinkStartScreenProps {
  settings: AppSettings
  hasAutoSave: boolean
  hasAnySaves: boolean
  savedBonds: SavedRomanceBond[]
  ostControls: OstControlsState
  onDeleteBond: (characterName: string) => void
  onStartNewGame: (profile: PlayerProfile) => void
  onResumeAutoSave: () => void
  onOpenTransfer: () => void
  onOpenSettings: () => void
}

const WEAPONS: { value: WeaponType; label: string; desc: string }[] = [
  { value: 'One-Handed Sword', label: 'One-Handed Sword', desc: 'สมดุล คล่องตัว คอมโบต่อเนื่อง' },
  { value: 'Rapier', label: 'Rapier', desc: 'แทงเร็วแม่นยำ สไตล์อัศวินภาคี' },
  { value: 'Dagger', label: 'Dagger', desc: 'ความเร็วสูง ลอบโจมตี & ซัพพอร์ต' },
  { value: 'Katana', label: 'Katana', desc: 'ฟันเฉือนรุนแรง สไตล์ตะวันออก' },
  { value: 'Two-Handed Sword', label: 'Two-Handed Sword', desc: 'พลังโจมตีหนักหน่วง ทลายเกราะ' },
  { value: 'Spear / Halberd', label: 'Spear / Halberd', desc: 'ระยะโจมตีกว้าง คุมพื้นที่ได้ดี' },
  { value: 'Gun & Photon Sword', label: 'Gun & Photon Sword', desc: 'ปืน & ดาบแสง (GGO / Crossover)' },
  { value: 'Mace / Hammer', label: 'Mace / Hammer', desc: 'สายปะทะอึด ชนบอสแนวหน้า' },
]

const ARCS: { value: WorldArc; subtitle: string; badge: string }[] = [
  { value: 'Aincrad (Floor 1)', subtitle: 'ปราสาทลอยฟ้า 100 ชั้น — จุดเริ่มต้นสาย 2022 Canon (แยกสายกับ Progressive)', badge: '2022 Canon' },
  { value: 'Progressive', subtitle: 'ตะลุยทีละชั้นแบบ Floor-by-Floor คู่หูแนวหน้า (แยกสายกับ Aincrad)', badge: 'Floor-by-Floor' },
  { value: 'ALfheim Online', subtitle: 'โลกแห่งภูต เวทมนตร์ และปีกบิน (รองรับย้ายเซฟจาก Aincrad/Progressive)', badge: 'Fairy World' },
  { value: 'Gun Gale Online', subtitle: 'สมรภูมิปืนไฟไซไฟ Bullet of Bullets', badge: 'Sci-Fi FPS' },
  { value: 'Underworld', subtitle: 'อาณาจักรจิตวิญญาณ Sacred Arts & Incarnation', badge: 'Alicization' },
  { value: 'Gameverse Crossover', subtitle: 'รวมตัวละครข้ามจักรวาล (Philia, Strea, Rain ฯลฯ)', badge: 'All-Stars' },
]

export function LinkStartScreen({
  settings,
  hasAutoSave,
  hasAnySaves,
  savedBonds,
  ostControls,
  onDeleteBond,
  onStartNewGame,
  onResumeAutoSave,
  onOpenTransfer,
  onOpenSettings,
}: LinkStartScreenProps) {
  const [name, setName] = useState('Kazuto')
  const [weapon, setWeapon] = useState<WeaponType>('One-Handed Sword')
  const [startingArc, setStartingArc] = useState<WorldArc>('Aincrad (Floor 1)')
  const [storyMode, setStoryMode] = useState<StoryMode>('canon')
  const [romanceTarget, setRomanceTarget] = useState<RomanceCharacterProfile>(ROMANCE_ROSTER[0])
  const [isRomancePickerOpen, setIsRomancePickerOpen] = useState(false)
  const [selectedBondNames, setSelectedBondNames] = useState<string[]>([])
  const [isLinking, setIsLinking] = useState(false)

  const toggleBondSelection = (charName: string) => {
    setSelectedBondNames((prev) =>
      prev.includes(charName) ? prev.filter((n) => n !== charName) : [...prev, charName]
    )
  }

  const launchGame = (overrideTarget?: RomanceCharacterProfile, overrideMode?: StoryMode) => {
    const trimmed = name.trim() || 'PlayerOne'
    const modeToUse = overrideMode ?? storyMode
    const targetToUse = overrideTarget ?? romanceTarget
    const carriedBonds =
      modeToUse === 'romance'
        ? []
        : savedBonds.filter((b) => selectedBondNames.includes(b.characterName))

    setIsLinking(true)
    setTimeout(() => {
      onStartNewGame({
        name: trimmed,
        weapon,
        startingArc,
        storyMode: modeToUse,
        romanceTarget: modeToUse === 'romance' ? targetToUse : null,
        preGameBonds: carriedBonds.length > 0 ? carriedBonds : undefined,
      })
    }, 750)
  }

  const handleLinkStart = () => {
    launchGame()
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0b1017]">
      {/* Link Start Calibration Overlay */}
      {isLinking && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080c12]/95 backdrop-blur-sm">
          <div className="animate-spin-slow flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#e3a024] border-t-transparent" />
          <div className="font-hud mt-5 text-2xl font-bold tracking-[0.28em] text-slate-100 uppercase">
            Link Start
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            {storyMode === 'romance'
              ? `กำลังเข้าสู่เนื้อเรื่องกับ ${romanceTarget.name}...`
              : `กำลังเชื่อมต่อเข้าสู่ ${startingArc}...`}
          </p>
        </div>
      )}

      {/* Top Game Bar */}
      <header className="border-b border-white/[0.08] bg-[#0d131c] px-5 py-3.5 sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-baseline gap-3">
            <h1 className="font-hud text-xl font-bold tracking-[0.14em] text-white sm:text-2xl">
              SWORD ART ONLINE
            </h1>
            <span className="hidden text-xs text-slate-400 sm:inline">
              Interactive Novel &amp; Roleplay
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {hasAutoSave && (
              <button
                onClick={onResumeAutoSave}
                className="flex items-center gap-1.5 rounded border border-emerald-400/35 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-200 transition hover:bg-emerald-500/20"
              >
                <FolderOpen className="h-3.5 w-3.5" />
                เล่นต่อจากเซฟล่าสุด
              </button>
            )}
            {hasAnySaves && (
              <button
                onClick={onOpenTransfer}
                className="flex items-center gap-1.5 rounded border border-white/[0.12] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-[#e3a024]/50 hover:text-amber-200"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                ย้ายเซฟข้ามภาค
              </button>
            )}
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 rounded border border-white/[0.12] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/[0.08]"
            >
              <Settings className="h-3.5 w-3.5" />
              {settings.apiKey ? 'ตั้งค่า / เซฟเกม' : settings.demoMode ? 'โหมดทดลอง' : 'ตั้งค่า API Key'}
            </button>
            <OstControlPill ost={ostControls} />
          </div>
        </div>
      </header>

      {/* Main Content (Clean Architectural Split without Nested Card Soup) */}
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-5 py-6 sm:px-8">
        {!settings.apiKey && !settings.demoMode && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-l-2 border-[#e3a024] bg-[#e3a024]/[0.07] px-4 py-2.5 text-xs text-amber-100">
            <div className="flex items-center gap-2">
              <KeyRound className="h-3.5 w-3.5 shrink-0 text-[#e3a024]" />
              <span>
                ยังไม่ได้ใส่ <strong>Gemini API Key</strong> — กดตั้งค่าเพื่อกรอกคีย์ หรือเปิดโหมดทดลอง (Demo) เพื่อเล่นทันที
              </span>
            </div>
            <button
              onClick={onOpenSettings}
              className="font-semibold text-[#f0c05e] underline underline-offset-2 hover:text-white"
            >
              เปิดตั้งค่า
            </button>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
          {/* Left Column: Player Identity, Mode & Companion */}
          <div className="space-y-6 lg:col-span-5">
            <div>
              <label className="block text-xs font-medium text-slate-400">
                ชื่อตัวละคร (Player Name)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={28}
                placeholder="ตั้งชื่อตัวละคร..."
                className="mt-1.5 w-full border-b border-white/20 bg-transparent px-1 py-2 text-base font-semibold text-white placeholder-slate-600 transition focus:border-[#e3a024] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">
                เลือกโหมดการเล่น
              </label>
              <div className="divide-y divide-white/[0.06] border-y border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setStoryMode('canon')}
                  className={`flex w-full items-center justify-between gap-3 border-l-2 px-3.5 py-3 text-left transition ${
                    storyMode === 'canon'
                      ? 'border-l-[#e3a024] bg-[#e3a024]/[0.08] text-white'
                      : 'border-l-transparent text-slate-300 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className={`h-4 w-4 ${storyMode === 'canon' ? 'text-[#e3a024]' : 'text-slate-500'}`} />
                    <div>
                      <div className="text-sm font-medium">อิงเส้นเรื่องหลัก (Canon)</div>
                      <div className="text-[11px] text-slate-400">เริ่มตามไทม์ไลน์หลัก แต่เปลี่ยนชะตากรรมได้</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStoryMode('sandbox')}
                  className={`flex w-full items-center justify-between gap-3 border-l-2 px-3.5 py-3 text-left transition ${
                    storyMode === 'sandbox'
                      ? 'border-l-[#e3a024] bg-[#e3a024]/[0.08] text-white'
                      : 'border-l-transparent text-slate-300 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Sparkles className={`h-4 w-4 ${storyMode === 'sandbox' ? 'text-[#e3a024]' : 'text-slate-500'}`} />
                    <div>
                      <div className="text-sm font-medium">อิสระเต็มรูปแบบ (Sandbox AU)</div>
                      <div className="text-[11px] text-slate-400">พบเจอตัวละครข้ามภาคและสร้างเส้นเรื่องใหม่เอง</div>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStoryMode('romance')
                    setIsRomancePickerOpen(true)
                  }}
                  className={`flex w-full items-center justify-between gap-3 border-l-2 px-3.5 py-3 text-left transition ${
                    storyMode === 'romance'
                      ? 'border-l-rose-400 bg-rose-500/[0.1] text-white'
                      : 'border-l-transparent text-slate-300 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Heart className={`h-4 w-4 ${storyMode === 'romance' ? 'text-rose-400' : 'text-slate-500'}`} />
                    <div>
                      <div className="text-sm font-medium">โหมดจีบตัวละคร (Pre-Game Romance)</div>
                      <div className="text-[11px] text-slate-400">ทำความรู้จักและคบหาก่อนเข้าเกม พกความสัมพันธ์ข้ามเซฟได้</div>
                    </div>
                  </div>
                  <span className="shrink-0 text-[11px] font-medium text-rose-300">
                    เลือกตัวละคร ›
                  </span>
                </button>
              </div>
            </div>

            {storyMode === 'romance' ? (
              <div className="flex items-center justify-between gap-3 border-l-2 border-rose-400 bg-white/[0.025] px-3.5 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <CharacterAvatar
                    name={romanceTarget.name}
                    size="md"
                    ringClassName="border-rose-400/75"
                  />
                  <div className="min-w-0">
                    <div className="font-raj text-sm font-bold text-white">{romanceTarget.name}</div>
                    <div className="truncate text-[11px] text-slate-400">{romanceTarget.perk.shortLabel}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRomancePickerOpen(true)}
                  className="shrink-0 text-xs font-medium text-rose-200 underline underline-offset-2 hover:text-white"
                >
                  เปลี่ยน
                </button>
              </div>
            ) : (
              savedBonds.length > 0 && (
                <div>
                  <div className="mb-1.5 flex items-center justify-between text-xs text-slate-400">
                    <span>พกความสัมพันธ์ก่อนเข้าเกม</span>
                    <span>เลือกแล้ว {selectedBondNames.length}</span>
                  </div>
                  <div className="space-y-1.5">
                    {savedBonds.map((bond) => {
                      const checked = selectedBondNames.includes(bond.characterName)
                      return (
                        <div
                          key={bond.characterName}
                          className={`flex items-center justify-between gap-2 border-l-2 px-3 py-2 text-xs transition ${
                            checked
                              ? 'border-l-[#e3a024] bg-[#e3a024]/[0.1] text-white'
                              : 'border-l-white/10 bg-white/[0.02] text-slate-300'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleBondSelection(bond.characterName)}
                            className="flex min-w-0 flex-1 items-center gap-2 text-left"
                          >
                            <CharacterAvatar name={bond.characterName} size="xs" />
                            <div className="min-w-0 flex-1">
                              <span className="font-medium text-white">{bond.characterName}</span>{' '}
                              <span className="text-[11px] text-rose-300">
                                ({bond.relationship_tier} · {bond.affection})
                              </span>
                              {bond.perkUnlocked && (
                                <div className="truncate text-[10px] text-[#f0c05e]">
                                  {bond.perkTitle}
                                </div>
                              )}
                            </div>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteBond(bond.characterName)}
                            title="ลบข้อมูลความสัมพันธ์นี้"
                            className="p-1 text-slate-500 transition hover:text-rose-300"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Right Column: Weapon, World Arc & Launch */}
          <div className="flex flex-col justify-between space-y-6 lg:col-span-7">
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Swords className="h-3.5 w-3.5" />
                อาวุธประจำตัว
              </label>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {WEAPONS.map((w) => {
                  const active = weapon === w.value
                  return (
                    <button
                      key={w.value}
                      type="button"
                      onClick={() => setWeapon(w.value)}
                      title={w.desc}
                      className={`rounded border px-2.5 py-2 text-left transition ${
                        active
                          ? 'border-[#e3a024] bg-[#e3a024]/15 text-white'
                          : 'border-white/[0.08] bg-white/[0.02] text-slate-300 hover:border-white/25'
                      }`}
                    >
                      <div className="truncate text-xs font-medium">{w.label}</div>
                      <div className="mt-0.5 truncate text-[10px] text-slate-400">{w.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                <Compass className="h-3.5 w-3.5" />
                {storyMode === 'romance'
                  ? 'โลกที่จะเข้าไปเล่นด้วยกันหลังจีบ'
                  : 'โลกเริ่มต้น (World Arc)'}
              </label>
              <div className="grid gap-2 sm:grid-cols-2">
                {ARCS.map((arc) => {
                  const active = startingArc === arc.value
                  return (
                    <button
                      key={arc.value}
                      type="button"
                      onClick={() => setStartingArc(arc.value)}
                      className={`border-l-2 px-3.5 py-2.5 text-left transition ${
                        active
                          ? 'border-l-[#e3a024] bg-[#e3a024]/[0.1] text-white'
                          : 'border-l-white/10 bg-white/[0.02] text-slate-300 hover:border-l-white/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-raj text-sm font-bold">{arc.value}</span>
                        <span className="text-[10px] text-slate-400">{arc.badge}</span>
                      </div>
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">{arc.subtitle}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col items-stretch justify-between gap-4 border-t border-white/[0.08] pt-5 sm:flex-row sm:items-center">
              <div className="text-xs text-slate-400">
                <span>
                  AI: <strong className="font-mono text-slate-200">{settings.model}</strong>
                </span>
                <span className="mx-2 text-slate-600">·</span>
                <span>
                  {settings.demoMode ? 'โหมดจำลอง (Demo)' : 'Gemini + SAO Wiki'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLinkStart}
                className="font-hud flex items-center justify-center gap-2 rounded bg-[#e3a024] px-7 py-3 text-sm font-bold tracking-[0.16em] text-slate-950 uppercase transition hover:bg-[#eeb440] active:scale-[0.99]"
              >
                <Play className="h-3.5 w-3.5 fill-slate-950" />
                {storyMode === 'romance' ? 'START ROMANCE' : 'LINK START'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {isRomancePickerOpen && (
        <RomanceCharacterPickerModal
          initialSelected={romanceTarget}
          onSelect={(character, startImmediately) => {
            setRomanceTarget(character)
            setStoryMode('romance')
            setIsRomancePickerOpen(false)
            if (startImmediately) {
              launchGame(character, 'romance')
            }
          }}
          onClose={() => setIsRomancePickerOpen(false)}
        />
      )}
    </div>
  )
}
