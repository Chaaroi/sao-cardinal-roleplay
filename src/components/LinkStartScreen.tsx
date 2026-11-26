import { useState } from 'react'
import {
  ArrowRightLeft,
  Compass,
  FolderOpen,
  KeyRound,
  Play,
  Settings,
  Shield,
  Sparkles,
  Swords,
} from 'lucide-react'
import type {
  AppSettings,
  PlayerProfile,
  StoryMode,
  WeaponType,
  WorldArc,
} from '../types/game'

interface LinkStartScreenProps {
  settings: AppSettings
  hasAutoSave: boolean
  hasAnySaves: boolean
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
  onStartNewGame,
  onResumeAutoSave,
  onOpenTransfer,
  onOpenSettings,
}: LinkStartScreenProps) {
  const [name, setName] = useState('Kazuto')
  const [weapon, setWeapon] = useState<WeaponType>('One-Handed Sword')
  const [startingArc, setStartingArc] = useState<WorldArc>('Aincrad (Floor 1)')
  const [storyMode, setStoryMode] = useState<StoryMode>('canon')
  const [isLinking, setIsLinking] = useState(false)

  const handleLinkStart = () => {
    const trimmed = name.trim() || 'PlayerOne'
    setIsLinking(true)
    setTimeout(() => {
      onStartNewGame({
        name: trimmed,
        weapon,
        startingArc,
        storyMode,
      })
    }, 750)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-8">
      {/* Subtle Architectural Calibration Rings */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden opacity-15">
        <div className="animate-spin-slow h-[720px] w-[720px] rounded-full border border-dashed border-slate-300/35" />
        <div className="animate-spin-reverse absolute h-[520px] w-[520px] rounded-full border border-slate-400/20" />
      </div>

      {/* Link Start Calibration Overlay */}
      {isLinking && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#090e16]/95 backdrop-blur-md">
          <div className="animate-spin-slow flex h-28 w-28 items-center justify-center rounded-full border-2 border-[#e3a024] border-t-transparent" />
          <div className="font-hud mt-6 text-2xl font-bold tracking-[0.3em] text-slate-100 uppercase">
            Link Start
          </div>
          <p className="mt-1.5 text-xs text-slate-400">
            กำลังซิงค์ระบบ Cardinal เข้าสู่ {startingArc}...
          </p>
        </div>
      )}

      <div className="sao-panel relative z-10 w-full max-w-4xl rounded-md p-6 sm:p-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/12 pb-5">
          <div>
            <div className="font-hud flex items-center gap-2 text-[11px] font-semibold tracking-[0.2em] text-[#e3a024] uppercase">
              <span className="h-1.5 w-1.5 rotate-45 bg-[#e3a024]" />
              Cardinal System // Omniverse Roleplay
            </div>
            <h1 className="font-hud mt-1 text-2xl font-bold tracking-wide text-slate-50 sm:text-3xl">
              SWORD ART ONLINE
            </h1>
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
                className="flex items-center gap-1.5 rounded border border-[#e3a024]/40 bg-[#e3a024]/10 px-3 py-1.5 text-xs font-medium text-amber-200 transition hover:bg-[#e3a024]/20"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                ย้ายเซฟข้ามภาค
              </button>
            )}
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 rounded border border-slate-300/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
            >
              <Settings className="h-3.5 w-3.5" />
              {settings.apiKey ? 'ตั้งค่า / เซฟเกม' : settings.demoMode ? 'โหมด Demo' : 'ตั้งค่า API Key'}
            </button>
          </div>
        </div>

        {/* Missing API Key Notice */}
        {!settings.apiKey && !settings.demoMode && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded border border-[#e3a024]/35 bg-[#e3a024]/10 px-4 py-2.5 text-xs text-amber-100">
            <div className="flex items-center gap-2">
              <KeyRound className="h-3.5 w-3.5 shrink-0 text-[#e3a024]" />
              <span>
                ยังไม่ได้กรอก <strong>Gemini API Key</strong> — กดตั้งค่าเพื่อใส่คีย์ หรือเปิด Demo Mode เพื่อลองเล่นได้ทันที
              </span>
            </div>
            <button
              onClick={onOpenSettings}
              className="rounded border border-[#e3a024]/50 bg-[#e3a024]/20 px-2.5 py-1 font-medium text-amber-100 hover:bg-[#e3a024]/30"
            >
              ตั้งค่า
            </button>
          </div>
        )}

        {/* Body */}
        <div className="mt-6 grid gap-7 lg:grid-cols-12">
          {/* Left: Character Profile */}
          <div className="space-y-5 lg:col-span-5">
            <div>
              <label className="font-hud block text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Player Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={28}
                placeholder="ตั้งชื่อตัวละคร..."
                className="mt-1.5 w-full rounded border border-slate-300/20 bg-[#0b1018] px-3.5 py-2 text-sm text-slate-100 placeholder-slate-500 focus:border-[#e3a024] focus:outline-none"
              />
            </div>

            <div>
              <label className="font-hud block text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Story Progression Mode
              </label>
              <div className="mt-1.5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStoryMode('canon')}
                  className={`rounded border p-2.5 text-left transition ${
                    storyMode === 'canon'
                      ? 'border-[#e3a024]/80 bg-[#e3a024]/12 text-slate-50'
                      : 'border-slate-300/12 bg-white/[0.02] text-slate-400 hover:border-slate-300/25 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <Shield className="h-3.5 w-3.5 text-[#e3a024]" />
                    อิงเส้นเรื่องหลัก
                  </div>
                  <p className="mt-1 text-[11px] opacity-75">เริ่มตาม Canon แต่เปลี่ยนชะตาได้</p>
                </button>
                <button
                  type="button"
                  onClick={() => setStoryMode('sandbox')}
                  className={`rounded border p-2.5 text-left transition ${
                    storyMode === 'sandbox'
                      ? 'border-[#e3a024]/80 bg-[#e3a024]/12 text-slate-50'
                      : 'border-slate-300/12 bg-white/[0.02] text-slate-400 hover:border-slate-300/25 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <Sparkles className="h-3.5 w-3.5 text-[#e3a024]" />
                    อิสระเต็มรูปแบบ
                  </div>
                  <p className="mt-1 text-[11px] opacity-75">Sandbox / AU ข้ามภาคอิสระ</p>
                </button>
              </div>
            </div>

            <div>
              <label className="font-hud flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                <Swords className="h-3.5 w-3.5 text-slate-400" />
                Starting Weapon
              </label>
              <div className="mt-1.5 max-h-56 space-y-1 overflow-y-auto pr-1">
                {WEAPONS.map((w) => {
                  const active = weapon === w.value
                  return (
                    <button
                      key={w.value}
                      type="button"
                      onClick={() => setWeapon(w.value)}
                      className={`flex w-full items-center justify-between rounded border px-3 py-2 text-left transition ${
                        active
                          ? 'border-[#e3a024]/75 bg-[#e3a024]/12 text-slate-50'
                          : 'border-slate-300/10 bg-white/[0.02] text-slate-300 hover:border-slate-300/25'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-medium">{w.label}</div>
                        <div className="text-[11px] text-slate-400">{w.desc}</div>
                      </div>
                      <span
                        className={`h-2 w-2 rotate-45 ${
                          active ? 'bg-[#e3a024]' : 'bg-slate-600/40'
                        }`}
                      />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right: World Arc Selector */}
          <div className="flex flex-col justify-between lg:col-span-7">
            <div>
              <label className="font-hud flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                <Compass className="h-3.5 w-3.5 text-slate-400" />
                Starting World Arc
              </label>
              <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
                {ARCS.map((arc) => {
                  const active = startingArc === arc.value
                  return (
                    <button
                      key={arc.value}
                      type="button"
                      onClick={() => setStartingArc(arc.value)}
                      className={`rounded border p-3.5 text-left transition ${
                        active
                          ? 'border-[#e3a024]/80 bg-[#e3a024]/12 text-slate-50'
                          : 'border-slate-300/12 bg-white/[0.02] text-slate-300 hover:border-slate-300/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-raj text-sm font-bold">{arc.value}</span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                            active
                              ? 'bg-[#e3a024]/25 text-amber-200'
                              : 'bg-white/8 text-slate-400'
                          }`}
                        >
                          {arc.badge}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-slate-400">{arc.subtitle}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-6 flex flex-col items-stretch justify-between gap-3 rounded border border-slate-300/12 bg-[#0b1018]/90 p-4 sm:flex-row sm:items-center">
              <div className="text-xs text-slate-300">
                <div>
                  Model: <span className="font-mono font-medium text-slate-100">{settings.model}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  {settings.demoMode
                    ? 'Demo Mode Active (โหมดจำลอง)'
                    : 'เชื่อมต่อ Gemini API พร้อมฐานข้อมูล SAO Fandom Wiki'}
                </div>
              </div>

              <button
                type="button"
                onClick={handleLinkStart}
                className="font-hud flex items-center justify-center gap-2 rounded bg-[#e3a024] px-6 py-2.5 text-sm font-bold tracking-widest text-slate-950 uppercase transition hover:bg-[#eeb440] active:scale-[0.98]"
              >
                <Play className="h-3.5 w-3.5 fill-slate-950" />
                LINK START!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
