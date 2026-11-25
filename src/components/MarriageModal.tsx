import { Check, Gem, Home, Loader2, PackageOpen, Sparkles } from 'lucide-react'
import type { EventCG } from '../types/game'
import { CharacterAvatar } from './CharacterAvatar'

interface MarriageModalProps {
  partnerName: string
  playerName: string
  sharedHome: string | null
  marriageCG?: EventCG | null
  isGeneratingCG?: boolean
  onClose: () => void
}

export function MarriageModal({
  partnerName,
  playerName,
  sharedHome,
  marriageCG,
  isGeneratingCG = false,
  onClose,
}: MarriageModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="animate-alert-pop relative w-full max-w-md overflow-hidden rounded-2xl border-2 border-amber-300/80 bg-gradient-to-b from-slate-900/95 via-slate-950/95 to-amber-950/50 p-6 text-center shadow-[0_0_60px_rgba(251,191,36,0.45)]">
        {/* Glow Ring + Partner Portrait */}
        <div className="mx-auto flex items-center justify-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-amber-300 bg-gradient-to-br from-amber-300/30 to-yellow-500/20 shadow-[0_0_26px_rgba(251,191,36,0.55)]">
            <Gem className="h-8 w-8 text-amber-200" />
          </div>
          <CharacterAvatar
            name={partnerName}
            size="lg"
            ringClassName="border-amber-300 shadow-[0_0_26px_rgba(251,191,36,0.55)]"
          />
        </div>

        <div className="font-hud mt-4 text-xs font-bold tracking-[0.25em] text-amber-300 uppercase">
          [SYSTEM ALERT: MARRIAGE ACCEPTED]
        </div>

        <h2 className="font-hud mt-2 text-2xl font-extrabold text-white">
          {playerName} <span className="text-amber-300">&amp;</span> {partnerName}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-amber-100/90">
          คำขอแต่งงานได้รับการตอบรับอย่างเป็นทางการโดยระบบ Cardinal!
          สถานะของคุณและ <strong>{partnerName}</strong> ได้เปลี่ยนเป็น{' '}
          <span className="font-bold text-amber-300">Married</span> แล้ว
        </p>

        {/* Marriage Event CG */}
        {marriageCG ? (
          <div className="mt-4 overflow-hidden rounded-xl border border-amber-300/60 bg-slate-950/80 shadow-[0_0_24px_rgba(251,191,36,0.35)]">
            <img
              src={marriageCG.imageUrl}
              alt={marriageCG.caption}
              className="max-h-48 w-full object-cover"
            />
          </div>
        ) : isGeneratingCG ? (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-amber-300/35 bg-amber-500/10 py-4 text-xs text-amber-100">
            <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
            <span>กำลังสร้างภาพ Event CG ฉากแต่งงาน...</span>
          </div>
        ) : null}

        {/* Unlocks Box */}
        <div className="mt-5 space-y-2 rounded-xl border border-amber-300/30 bg-slate-950/60 p-4 text-left text-xs text-slate-200">
          <div className="flex items-center gap-2 text-amber-200 font-semibold">
            <Sparkles className="h-4 w-4" />
            สิทธิพิเศษคู่สมรสที่ปลดล็อก:
          </div>
          <div className="flex items-center gap-2">
            <PackageOpen className="h-4 w-4 text-cyan-300" />
            <span>ปลดล็อก <strong>Shared Inventory</strong> (ช่องเก็บของร่วมกัน)</span>
          </div>
          <div className="flex items-center gap-2">
            <Home className="h-4 w-4 text-emerald-300" />
            <span>
              ปลดล็อก <strong>Shared Home</strong> ({sharedHome || 'กระท่อมชั้น 22'})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-pink-300" />
            <span>บัฟเสริมพลัง Marriage Blessing เมื่อต่อสู้เคียงข้างกัน</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="font-hud mt-6 w-full rounded-lg border border-amber-200 bg-gradient-to-r from-amber-400 to-yellow-300 py-2.5 text-xs font-extrabold tracking-widest text-slate-950 uppercase shadow-[0_0_20px_rgba(251,191,36,0.5)] transition hover:brightness-110"
        >
          OK — ดำเนินการต่อ
        </button>
      </div>
    </div>
  )
}
