import { useState } from 'react'
import {
  ArrowRightLeft,
  Cpu,
  Download,
  Eye,
  EyeOff,
  FolderOpen,
  KeyRound,
  Loader2,
  RefreshCw,
  Save,
  Trash2,
  X,
} from 'lucide-react'
import { listAvailableGeminiModels } from '../services/geminiService'
import { PRESET_GEMINI_MODELS } from '../types/game'
import type { AppSettings, GameSession, GeminiModel, SaveSlotMeta } from '../types/game'

interface SettingsModalProps {
  settings: AppSettings
  currentSession: GameSession | null
  saveSlots: SaveSlotMeta[]
  onSaveSettings: (next: AppSettings) => void
  onSaveToSlot: (slotId: string, label: string) => void
  onLoadFromSlot: (slot: SaveSlotMeta) => void
  onDeleteSlot: (slotId: string) => void
  onOpenTransfer?: () => void
  onClose: () => void
}

const SLOT_IDS = ['slot-1', 'slot-2', 'slot-3']

export function SettingsModal({
  settings,
  currentSession,
  saveSlots,
  onSaveSettings,
  onSaveToSlot,
  onLoadFromSlot,
  onDeleteSlot,
  onOpenTransfer,
  onClose,
}: SettingsModalProps) {
  const [apiKey, setApiKey] = useState(settings.apiKey)
  const [model, setModel] = useState<GeminiModel>(settings.model)
  const [demoMode, setDemoMode] = useState(settings.demoMode)
  const [fastMode, setFastMode] = useState(settings.fastMode)
  const [autoEventImages, setAutoEventImages] = useState(settings.autoEventImages)
  const [imageModel, setImageModel] = useState(settings.imageModel)
  const [ostEnabled, setOstEnabled] = useState(settings.ostEnabled)
  const [ostVolume, setOstVolume] = useState(settings.ostVolume)
  const [showKey, setShowKey] = useState(false)
  const [fetchedModels, setFetchedModels] = useState<string[]>([])
  const [fetchingModels, setFetchingModels] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const handleFetchModels = async () => {
    setFetchingModels(true)
    setFetchError(null)
    try {
      const list = await listAvailableGeminiModels(apiKey)
      setFetchedModels(list)
      if (list.length === 0) {
        setFetchError('ไม่พบโมเดลที่รองรับ generateContent สำหรับคีย์นี้')
      }
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'ดึงรายชื่อโมเดลไม่สำเร็จ')
    } finally {
      setFetchingModels(false)
    }
  }

  const handleApplySettings = () => {
    onSaveSettings({
      apiKey: apiKey.trim(),
      model: model.trim() || 'gemini-4-hydrogen',
      demoMode,
      fastMode,
      autoEventImages,
      imageModel: imageModel.trim() || 'auto',
      ostEnabled,
      ostVolume,
    })
    onClose()
  }

  const handleExportSession = () => {
    if (!currentSession) return
    const blob = new Blob([JSON.stringify(currentSession, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sao-save-${currentSession.profile.name}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#06090e]/82 p-4 backdrop-blur-sm">
      <div className="sao-panel max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg p-6">
        <div className="flex items-center justify-between border-b border-slate-300/15 pb-3.5">
          <h2 className="font-hud text-base font-bold tracking-[0.14em] text-white uppercase">
            Cardinal Settings &amp; Save Data
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Gemini API Configuration */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="font-hud flex items-center gap-1.5 text-xs font-semibold tracking-[0.12em] text-slate-300 uppercase">
              <KeyRound className="h-3.5 w-3.5 text-[#e3a024]" />
              Gemini API Key (เก็บเฉพาะในเบราว์เซอร์ของคุณ)
            </label>
            <div className="mt-2 flex gap-2">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="flex-1 rounded border border-slate-300/20 bg-[#0b1018] px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-[#e3a024] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="rounded border border-slate-300/20 bg-white/[0.04] px-3 text-slate-300 transition hover:bg-white/[0.1]"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="font-hud flex items-center gap-1.5 text-xs font-semibold tracking-[0.12em] text-slate-300 uppercase">
              <Cpu className="h-3.5 w-3.5 text-[#e3a024]" />
              เลือกโมเดล Gemini (รองรับรุ่น 4, 3.8, 2.5 และ Custom ID)
            </label>
            <div className="mt-2 grid max-h-56 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {PRESET_GEMINI_MODELS.map((preset) => {
                const selected = model === preset.id
                const isG4 = preset.generation === 'Gemini 4'
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setModel(preset.id)}
                    className={`rounded-md border p-2.5 text-left transition ${
                      selected
                        ? 'border-[#e3a024] bg-[#e3a024]/15 text-white'
                        : 'border-slate-300/15 bg-[#0b1018] text-slate-300 hover:border-slate-300/35'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-xs font-bold">{preset.label}</span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                          isG4
                            ? 'bg-[#e3a024]/20 text-[#f0c05e]'
                            : 'bg-white/[0.08] text-slate-300'
                        }`}
                      >
                        {preset.generation}
                      </span>
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] text-slate-400">
                      {preset.id}
                    </div>
                    <div className="mt-0.5 text-[11px] opacity-80">{preset.desc}</div>
                  </button>
                )
              })}
            </div>

            {/* Custom Model ID Input + Fetch from API Key */}
            <div className="mt-2.5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="block text-[11px] text-slate-400">
                  หรือพิมพ์ Model ID เองโดยตรง (เช่น <code>gemini-4-hydrogen</code>, <code>gemini-2.5-flash</code>):
                </label>
                <button
                  type="button"
                  disabled={fetchingModels || !apiKey.trim()}
                  onClick={() => void handleFetchModels()}
                  className="flex items-center gap-1 rounded border border-[#e3a024]/45 bg-[#e3a024]/12 px-2.5 py-1 text-[11px] font-semibold text-[#f0c05e] transition hover:bg-[#e3a024]/22 disabled:opacity-45"
                >
                  {fetchingModels ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3 w-3" />
                  )}
                  ดึงโมเดลที่คีย์นี้ใช้ได้
                </button>
              </div>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="gemini-4-hydrogen"
                className="w-full rounded border border-slate-300/20 bg-[#0b1018] px-3 py-1.5 font-mono text-xs text-slate-100 placeholder-slate-500 focus:border-[#e3a024] focus:outline-none"
              />
              {fetchError && (
                <div className="rounded border border-rose-400/35 bg-rose-500/12 px-2.5 py-1.5 text-[11px] text-rose-200">
                  {fetchError}
                </div>
              )}
              {fetchedModels.length > 0 && (
                <div className="rounded-md border border-emerald-400/30 bg-emerald-500/10 p-2.5">
                  <div className="mb-1.5 text-[11px] font-semibold text-emerald-200">
                    โมเดลที่ API Key ของคุณใช้งานได้จริง ({fetchedModels.length}) — คลิกเพื่อเลือก:
                  </div>
                  <div className="flex max-h-28 flex-wrap gap-1.5 overflow-y-auto">
                    {fetchedModels.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setModel(id)}
                        className={`rounded border px-2 py-0.5 font-mono text-[10px] transition ${
                          model === id
                            ? 'border-[#e3a024] bg-[#e3a024]/20 text-white'
                            : 'border-slate-300/15 bg-[#0b1018] text-slate-200 hover:border-[#e3a024]/50'
                        }`}
                      >
                        {id}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <label className="flex cursor-pointer items-center justify-between rounded-md border border-slate-300/15 bg-[#0b1018] px-4 py-3">
            <div>
              <div className="text-xs font-bold text-emerald-300">
                โหมดตอบไว (Fast Response — ลดเวลาคิดของ AI)
              </div>
              <div className="text-[11px] text-slate-400">
                ลด Thinking Level/Budget ลงเพื่อให้เริ่มพิมพ์ข้อความตอบในไม่กี่วินาที (แนะนำเปิดไว้)
              </div>
            </div>
            <input
              type="checkbox"
              checked={fastMode}
              onChange={(e) => setFastMode(e.target.checked)}
              className="h-4 w-4 accent-[#e3a024]"
            />
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-md border border-slate-300/15 bg-[#0b1018] px-4 py-3">
            <div>
              <div className="text-xs font-bold text-slate-100">
                สุ่มส่งภาพ Event CG อัตโนมัติ (แต่งงาน / เดินเล่น / อยู่ด้วยกัน)
              </div>
              <div className="text-[11px] text-slate-400">
                เจนภาพตัวละครแนวนิยายภาพในฉากขอแต่งงาน (100%) และสุ่มส่งในฉากออกเดต/เดินเล่น/พักผ่อน
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoEventImages}
              onChange={(e) => setAutoEventImages(e.target.checked)}
              className="h-4 w-4 accent-[#e3a024]"
            />
          </label>

          {autoEventImages && (
            <div className="rounded-md border border-slate-300/15 bg-[#0b1018] px-4 py-2.5">
              <label className="block text-[11px] font-semibold text-slate-300">
                โมเดลสร้างภาพ Event CG (แนะนำใช้ auto เพื่อให้ระบบเลือกโมเดลที่คีย์รองรับ)
              </label>
              <select
                value={imageModel}
                onChange={(e) => setImageModel(e.target.value)}
                className="mt-1.5 w-full rounded border border-slate-300/20 bg-[#121923] px-2.5 py-1.5 font-mono text-xs text-slate-100 focus:border-[#e3a024] focus:outline-none"
              >
                <option value="auto">auto (Gemini → SD 3.5 Turbo ~4วิ → FLUX.1 → AI Horde)</option>
                <option value="hf-sd35-turbo">hf-sd35-turbo (ฟรี! SD 3.5 Large Turbo ~4–5 วินาที)</option>
                <option value="hf-flux-merged">hf-flux-merged (ฟรี! FLUX.1 Merged ~7 วินาที)</option>
                <option value="aihorde-anime">aihorde-anime (AI Horde เลือกโมเดลคิวว่างอัตโนมัติ)</option>
                <option value="gemini-2.5-flash-image">gemini-2.5-flash-image (ต้องเปิด Billing บน Gemini)</option>
                <option value="gemini-3-pro-image">gemini-3-pro-image (ต้องเปิด Billing บน Gemini)</option>
                <option value="imagen-4.0-generate-001">imagen-4.0-generate-001 (ต้องเปิด Billing บน Gemini)</option>
              </select>
            </div>
          )}

          <label className="flex cursor-pointer items-center justify-between rounded-md border border-slate-300/15 bg-[#0b1018] px-4 py-3">
            <div>
              <div className="text-xs font-bold text-[#f0c05e]">
                เปิดเพลงประกอบ SAO OST อัตโนมัติตามสถานการณ์
              </div>
              <div className="text-[11px] text-slate-400">
                เปลี่ยนเพลงอัตโนมัติตามฉากเมือง, ต่อสู้, ร้านค้า, ออกเดต หรือฉากวิกฤต (ปรับระดับเสียงและเปิด-ปิดจากแถบด้านบนได้ตลอดเวลา)
              </div>
            </div>
            <input
              type="checkbox"
              checked={ostEnabled}
              onChange={(e) => setOstEnabled(e.target.checked)}
              className="h-4 w-4 accent-[#e3a024]"
            />
          </label>

          {ostEnabled && (
            <div className="rounded-md border border-slate-300/15 bg-[#0b1018] px-4 py-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-300">
                <span>ระดับเสียง SAO OST</span>
                <span className="font-hud font-bold text-[#f0c05e]">{ostVolume}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={ostVolume}
                onChange={(e) => setOstVolume(Number(e.target.value))}
                className="mt-1.5 h-1.5 w-full cursor-pointer accent-[#e3a024]"
              />
            </div>
          )}

          <label className="flex cursor-pointer items-center justify-between rounded-md border border-slate-300/15 bg-[#0b1018] px-4 py-3">
            <div>
              <div className="text-xs font-bold text-[#f0c05e]">
                เปิดโหมดทดลอง (Offline Demo Mode)
              </div>
              <div className="text-[11px] text-slate-400">
                จำลองคำตอบ Cardinal &amp; JSON State เพื่อทดสอบ UI และระบบแต่งงานได้โดยไม่ใช้ API Key
              </div>
            </div>
            <input
              type="checkbox"
              checked={demoMode}
              onChange={(e) => setDemoMode(e.target.checked)}
              className="h-4 w-4 accent-[#e3a024]"
            />
          </label>
        </div>

        {/* Save Slots */}
        <div className="mt-6 border-t border-slate-300/15 pt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-hud text-xs font-bold tracking-[0.12em] text-slate-300 uppercase">
              Save Slots (บันทึกความจำ LocalStorage)
            </h3>
            <div className="flex items-center gap-1.5">
              {onOpenTransfer && (currentSession || saveSlots.length > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    onOpenTransfer()
                  }}
                  className="flex items-center gap-1 rounded border border-[#e3a024]/45 bg-[#e3a024]/15 px-2.5 py-1 text-[11px] font-semibold text-[#f0c05e] transition hover:bg-[#e3a024]/25"
                >
                  <ArrowRightLeft className="h-3 w-3" />
                  ย้ายเซฟข้ามภาค
                </button>
              )}
              {currentSession && (
                <button
                  type="button"
                  onClick={handleExportSession}
                  className="flex items-center gap-1 rounded border border-slate-300/20 bg-white/[0.05] px-2.5 py-1 text-[11px] text-slate-200 transition hover:bg-white/[0.1]"
                >
                  <Download className="h-3 w-3" />
                  Export JSON
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 space-y-2">
            {SLOT_IDS.map((slotId, index) => {
              const existing = saveSlots.find((s) => s.slotId === slotId)
              return (
                <div
                  key={slotId}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-slate-300/15 bg-[#0b1018] px-3.5 py-2.5 text-xs"
                >
                  <div>
                    <div className="font-semibold text-white">
                      Slot {index + 1}:{' '}
                      {existing ? existing.label : <span className="text-slate-500">ว่าง (Empty)</span>}
                    </div>
                    {existing && (
                      <div className="text-[11px] text-slate-400">
                        Lv.{existing.session.worldState.player.level} •{' '}
                        {existing.session.worldState.location} •{' '}
                        {new Date(existing.savedAt).toLocaleString('th-TH')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {currentSession && (
                      <button
                        type="button"
                        onClick={() =>
                          onSaveToSlot(
                            slotId,
                            `${currentSession.profile.name} (${currentSession.worldState.world_arc})`
                          )
                        }
                        className="flex items-center gap-1 rounded border border-[#e3a024]/40 bg-[#e3a024]/15 px-2.5 py-1 text-[11px] text-[#f0c05e] transition hover:bg-[#e3a024]/25"
                      >
                        <Save className="h-3 w-3" />
                        บันทึกทับ
                      </button>
                    )}
                    {existing && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            onLoadFromSlot(existing)
                            onClose()
                          }}
                          className="flex items-center gap-1 rounded border border-emerald-400/35 bg-emerald-500/12 px-2.5 py-1 text-[11px] text-emerald-200 transition hover:bg-emerald-500/22"
                        >
                          <FolderOpen className="h-3 w-3" />
                          โหลด
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteSlot(slotId)}
                          className="rounded border border-rose-400/30 bg-rose-500/12 p-1 text-rose-200 transition hover:bg-rose-500/25"
                          aria-label="ลบเซฟ"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2 border-t border-slate-300/12 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-slate-300/20 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-white/[0.08]"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleApplySettings}
            className="font-hud rounded border border-[#f5be58]/60 bg-[#e3a024] px-5 py-2 text-xs font-bold tracking-[0.14em] text-slate-950 uppercase transition hover:bg-[#f0b43c]"
          >
            บันทึกการตั้งค่า
          </button>
        </div>
      </div>
    </div>
  )
}
