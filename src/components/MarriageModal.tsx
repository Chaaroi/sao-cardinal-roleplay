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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06090e]/82 p-4 backdrop-blur-sm">
      <div className="sao-panel animate-alert-pop relative w-full max-w-md overflow-hidden rounded-lg border border-[#e3a024]/55 p-6 text-center">
        {/* Ring + Partner Portrait */}
        <div className="mx-auto flex items-center justify-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#e3a024]/65 bg-[#e3a024]/15">
            <Gem className="h-7 w-7 text-[#f0c05e]" />
          </div>
          <CharacterAvatar
            name={partnerName}
            size="lg"
            ringClassName="border-[#e3a024]/70"
          />
        </div>

        <div className="font-hud mt-4 text-[11px] font-bold tracking-[0.22em] text-[#f0c05e] uppercase">
          [SYSTEM ALERT : MARRIAGE ACCEPTED]
        </div>

        <h2 className="font-hud mt-2 text-2xl font-bold text-white">
          {playerName} <span className="text-[#e3a024]">&amp;</span> {partnerName}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          คำขอแต่งงานได้รับการตอบรับอย่างเป็นทางการโดยระบบ Cardinal!
          สถานะของคุณและ <strong className="text-white">{partnerName}</strong> ได้เปลี่ยนเป็น{' '}
          <span className="font-bold text-[#f0c05e]">Married</span> แล้ว
        </p>

        {/* Marriage Event CG */}
        {marriageCG ? (
          <div className="mt-4 overflow-hidden rounded-md border border-[#e3a024]/45 bg-[#0b1018]">
            <img
              src={marriageCG.imageUrl}
              alt={marriageCG.caption}
              className="max-h-48 w-full object-cover"
            />
          </div>
        ) : isGeneratingCG ? (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-md border border-[#e3a024]/30 bg-[#e3a024]/10 py-4 text-xs text-amber-100">
            <Loader2 className="h-4 w-4 animate-spin text-[#e3a024]" />
            <span>กำลังสร้างภาพ Event CG ฉากแต่งงาน...</span>
          </div>
        ) : null}

        {/* Unlocks Box */}
        <div className="mt-5 space-y-2 rounded-md border border-slate-300/15 bg-[#0b1018] p-4 text-left text-xs text-slate-300">
          <div className="flex items-center gap-2 font-semibold text-[#f0c05e]">
            <Sparkles className="h-3.5 w-3.5" />
            สิทธิพิเศษคู่สมรสที่ปลดล็อก:
          </div>
          <div className="flex items-center gap-2">
            <PackageOpen className="h-3.5 w-3.5 text-[#e3a024]" />
            <span>ปลดล็อก <strong className="text-white">Shared Inventory</strong> (ช่องเก็บของร่วมกัน)</span>
          </div>
          <div className="flex items-center gap-2">
            <Home className="h-3.5 w-3.5 text-emerald-300" />
            <span>
              ปลดล็อก <strong className="text-white">Shared Home</strong> ({sharedHome || 'กระท่อมชั้น 22'})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-3.5 w-3.5 text-rose-300" />
            <span>บัฟเสริมพลัง Marriage Blessing เมื่อต่อสู้เคียงข้างกัน</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="font-hud mt-5 w-full rounded border border-[#f5be58]/60 bg-[#e3a024] py-2.5 text-xs font-bold tracking-[0.14em] text-slate-950 uppercase transition hover:bg-[#f0b43c]"
        >
          OK — ดำเนินการต่อ
        </button>
      </div>
    </div>
  )
}
