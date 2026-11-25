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
  Zap,
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
  { value: 'Rapier', label: 'Rapier (ดาบเรเปียร์)', desc: 'แทงเร็วแม่นยำ สไตล์อัศวินภาคี' },
  { value: 'Dagger', label: 'Dagger (มีดสั้น)', desc: 'ความเร็วสูง ลอบโจมตี & ซัพพอร์ต' },
  { value: 'Katana', label: 'Katana (คาตานะ)', desc: 'ฟันเฉือนรุนแรง สไตล์ตะวันออก' },
  { value: 'Two-Handed Sword', label: 'Two-Handed Sword', desc: 'พลังโจมตีหนักหน่วง ทลายเกราะ' },
  { value: 'Spear / Halberd', label: 'Spear / Halberd', desc: 'ระยะโจมตีกว้าง คุมพื้นที่ได้ดี' },
  { value: 'Gun & Photon Sword', label: 'Gun & Photon Sword', desc: 'ปืน & ดาบแสง (เหมาะกับ GGO/Crossover)' },
  { value: 'Mace / Hammer', label: 'Mace / Hammer', desc: 'สายปะทะอึด ถึก ชนบอสแนวหน้า' },
]

const ARCS: { value: WorldArc; subtitle: string; badge: string }[] = [
  { value: 'Aincrad (Floor 1)', subtitle: 'ปราสาทลอยฟ้า 100 ชั้น — จุดเริ่มต้นสาย 2022 Canon (เลือกคนละสายกับ Progressive)', badge: '2022 Canon' },
  { value: 'Progressive', subtitle: 'ตะลุยทีละชั้นแบบ Floor-by-Floor คู่หูแนวหน้า (เลือกคนละสายกับ Aincrad)', badge: 'Floor-by-Floor' },
  { value: 'ALfheim Online', subtitle: 'โลกแห่งภูต เวทมนตร์ และปีกบินเสรี (ต่อยอดเซฟจาก Aincrad/Progressive ได้)', badge: 'Fairy World' },
  { value: 'Gun Gale Online', subtitle: 'สมรภูมิปืนไฟไซไฟ Bullet of Bullets', badge: 'Sci-Fi FPS' },
  { value: 'Underworld', subtitle: 'อาณาจักรจิตวิญญาณ Sacred Arts & Incarnation', badge: 'Alicization' },
  { value: 'Gameverse Crossover', subtitle: 'รวมทุกตัวละครข้ามจักรวาล (Philia, Strea, Rain ฯลฯ)', badge: 'All-Stars' },
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
    }, 850)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-6">
      {/* Decorative NerveGear / AmuSphere Orbital Rings */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden opacity-25">
        <div className="animate-spin-slow h-[680px] w-[680px] rounded-full border border-dashed border-cyan-400/40" />
        <div className="animate-spin-reverse absolute h-[520px] w-[520px] rounded-full border border-cyan-200/30" />
      </div>

      {/* Link Start Transition Flash */}
      {isLinking && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-xl">
          <div className="animate-spin-slow flex h-36 w-36 items-center justify-center rounded-full border-4 border-cyan-400 border-t-transparent shadow-[0_0_50px_rgba(56,189,248,0.8)]" />
          <div className="font-hud mt-6 text-3xl font-extrabold tracking-[0.35em] text-cyan-200 drop-shadow-[0_0_20px_rgba(56,189,248,0.9)]">
            LINK START!
          </div>
          <p className="mt-2 text-sm text-cyan-300/80">
            กำลังซิงค์ระบบ Cardinal และสร้างโลก {startingArc}...
          </p>
        </div>
      )}

      <div className="sao-panel relative z-10 w-full max-w-4xl rounded-xl p-6 sm:p-8">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-cyan-200/20 pb-5">
          <div>
            <div className="flex items-center gap-2 text-cyan-300">
              <Zap className="h-4 w-4" />
              <span className="font-hud text-xs font-semibold tracking-[0.25em] uppercase">
                Cardinal System v2.5 // Omniverse Engine
              </span>
            </div>
            <h1 className="font-hud mt-1 text-2xl font-extrabold tracking-wide text-white sm:text-3xl">
              SWORD ART ONLINE{' '}
              <span className="bg-gradient-to-r from-cyan-300 to-sky-100 bg-clip-text text-transparent">
                ROLEPLAY
              </span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {hasAutoSave && (
              <button
                onClick={onResumeAutoSave}
                className="flex items-center gap-2 rounded-lg border border-emerald-300/50 bg-emerald-500/20 px-3.5 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-500/30"
              >
                <FolderOpen className="h-4 w-4" />
                เล่นต่อจากเซฟล่าสุด
              </button>
            )}
            {hasAnySaves && (
              <button
                onClick={onOpenTransfer}
                className="flex items-center gap-2 rounded-lg border border-pink-300/50 bg-pink-500/20 px-3.5 py-2 text-xs font-semibold text-pink-100 transition hover:bg-pink-500/30"
                title="ย้ายเซฟจาก Aincrad/Progressive ไปเล่นต่อใน ALfheim Online โดยคงค่าความสัมพันธ์"
              >
                <ArrowRightLeft className="h-4 w-4" />
                ย้ายเซฟข้ามภาค (World Transfer)
              </button>
            )}
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2 rounded-lg border border-cyan-200/35 bg-white/10 px-3.5 py-2 text-xs font-semibold text-cyan-100 transition hover:bg-white/20"
            >
              <Settings className="h-4 w-4" />
              {settings.apiKey ? 'ตั้งค่า / เซฟเกม' : settings.demoMode ? 'โหมด Demo เปิดอยู่' : 'ใส่ API Key'}
            </button>
          </div>
        </div>

        {/* API Key Banner if missing and not demoMode */}
        {!settings.apiKey && !settings.demoMode && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-300/40 bg-amber-500/15 px-4 py-3 text-sm text-amber-100">
            <div className="flex items-center gap-2.5">
              <KeyRound className="h-4 w-4 shrink-0 text-amber-300" />
              <span>
                ยังไม่ได้ใส่ <strong>Gemini API Key</strong> — กดตั้งค่าเพื่อใส่ Key หรือเปิด{' '}
                <strong>Demo Mode</strong> เพื่อทดลองหน้าเว็บและระบบจีบ/แต่งงานได้ทันที
              </span>
            </div>
            <button
              onClick={onOpenSettings}
              className="rounded border border-amber-300/60 bg-amber-400/20 px-3 py-1 text-xs font-semibold hover:bg-amber-400/30"
            >
              ตั้งค่าเลย
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          {/* Left Column: Name + Mode + Weapon */}
          <div className="space-y-5 lg:col-span-5">
            <div>
              <label className="font-hud block text-xs font-semibold tracking-wider text-cyan-200 uppercase">
                Player Avatar Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={28}
                placeholder="ตั้งชื่อตัวละครของคุณ..."
                className="mt-2 w-full rounded-lg border border-cyan-200/30 bg-slate-950/65 px-4 py-2.5 text-sm text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/25"
              />
            </div>

            <div>
              <label className="font-hud block text-xs font-semibold tracking-wider text-cyan-200 uppercase">
                Story Mode (รูปแบบเนื้อเรื่อง)
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setStoryMode('canon')}
                  className={`rounded-lg border p-3 text-left transition ${
                    storyMode === 'canon'
                      ? 'border-cyan-300 bg-cyan-400/20 text-white shadow-[0_0_16px_rgba(56,189,248,0.25)]'
                      : 'border-white/15 bg-slate-900/50 text-slate-300 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Shield className="h-3.5 w-3.5 text-cyan-300" />
                    อิงเส้นเรื่องหลัก
                  </div>
                  <p className="mt-1 text-[11px] opacity-80">เริ่มตาม Canon แต่เปลี่ยนชะตาได้</p>
                </button>
                <button
                  type="button"
                  onClick={() => setStoryMode('sandbox')}
                  className={`rounded-lg border p-3 text-left transition ${
                    storyMode === 'sandbox'
                      ? 'border-cyan-300 bg-cyan-400/20 text-white shadow-[0_0_16px_rgba(56,189,248,0.25)]'
                      : 'border-white/15 bg-slate-900/50 text-slate-300 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                    อิสระเต็มรูปแบบ
                  </div>
                  <p className="mt-1 text-[11px] opacity-80">Sandbox / AU ข้ามภาคอิสระ</p>
                </button>
              </div>
            </div>

            <div>
              <label className="font-hud flex items-center gap-1.5 text-xs font-semibold tracking-wider text-cyan-200 uppercase">
                <Swords className="h-3.5 w-3.5" /> Starting Weapon
              </label>
              <div className="mt-2 grid max-h-56 grid-cols-1 gap-1.5 overflow-y-auto pr-1">
                {WEAPONS.map((w) => (
                  <button
                    key={w.value}
                    type="button"
                    onClick={() => setWeapon(w.value)}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left transition ${
                      weapon === w.value
                        ? 'border-cyan-300 bg-cyan-400/20 text-white'
                        : 'border-white/10 bg-slate-900/45 text-slate-300 hover:border-white/25'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold">{w.label}</div>
                      <div className="text-[11px] opacity-75">{w.desc}</div>
                    </div>
                    {weapon === w.value && (
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_8px_#67e8f9]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: World Arc Selector */}
          <div className="flex flex-col justify-between lg:col-span-7">
            <div>
              <label className="font-hud flex items-center gap-1.5 text-xs font-semibold tracking-wider text-cyan-200 uppercase">
                <Compass className="h-3.5 w-3.5" /> Starting World Arc (จุดเริ่มต้นโลก)
              </label>
              <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
                {ARCS.map((arc) => {
                  const active = startingArc === arc.value
                  return (
                    <button
                      key={arc.value}
                      type="button"
                      onClick={() => setStartingArc(arc.value)}
                      className={`rounded-lg border p-3.5 text-left transition ${
                        active
                          ? 'border-cyan-300 bg-gradient-to-br from-cyan-400/25 to-sky-500/10 text-white shadow-[0_0_18px_rgba(56,189,248,0.22)]'
                          : 'border-white/12 bg-slate-900/45 text-slate-300 hover:border-white/30'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-raj text-sm font-bold">{arc.value}</span>
                        <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-medium text-cyan-200">
                          {arc.badge}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed opacity-80">{arc.subtitle}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="mt-6 flex flex-col items-stretch justify-between gap-3 rounded-lg border border-cyan-200/20 bg-slate-950/50 p-4 sm:flex-row sm:items-center">
              <div className="text-xs text-slate-300">
                <div>
                  โมเดลเริ่มต้น: <span className="font-semibold text-cyan-200">{settings.model}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-slate-400">
                  {settings.demoMode
                    ? 'โหมดจำลอง (Demo Mode): เล่นทดสอบ UI ได้โดยไม่ใช้ API Key'
                    : 'เชื่อมต่อ Gemini API พร้อมระบบความทรงจำ World State ถาวร'}
                </div>
              </div>

              <button
                type="button"
                onClick={handleLinkStart}
                className="font-hud flex items-center justify-center gap-2 rounded-lg border border-cyan-200/70 bg-gradient-to-r from-cyan-500 to-sky-400 px-6 py-3 text-sm font-bold tracking-widest text-slate-950 shadow-[0_0_24px_rgba(56,189,248,0.5)] transition hover:brightness-110 active:scale-95"
              >
                <Play className="h-4 w-4 fill-slate-950" />
                LINK START!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
