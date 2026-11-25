import { useState } from 'react'
import { Coins, Minus, Package, Plus, ShoppingBag, ShoppingCart, X } from 'lucide-react'
import type { InventoryItem, ShopItem, ShopState } from '../types/game'
import { CharacterAvatar } from './CharacterAvatar'

interface ShopModalProps {
  shop: ShopState
  playerCol: number
  onBuyItem: (item: ShopItem, quantity: number) => void
  onClose: () => void
}

const CATEGORY_BADGES: Record<NonNullable<InventoryItem['category']>, { label: string; style: string }> = {
  equipment: { label: 'อาวุธ / อุปกรณ์', style: 'border-sky-300/40 bg-sky-500/20 text-sky-200' },
  consumable: { label: 'ไอเทมกดใช้', style: 'border-emerald-300/40 bg-emerald-500/20 text-emerald-200' },
  material: { label: 'วัตถุดิบ', style: 'border-amber-300/40 bg-amber-500/20 text-amber-200' },
  special: { label: 'พิเศษ', style: 'border-pink-300/40 bg-pink-500/20 text-pink-200' },
}

export function ShopModal({ shop, playerCol, onBuyItem, onClose }: ShopModalProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const currency = shop.currency || 'Col'

  const getQty = (item: ShopItem) => {
    const raw = quantities[item.name] ?? 1
    if (item.stock <= 0) return 0
    return Math.max(1, Math.min(item.stock, raw))
  }

  const updateQty = (item: ShopItem, delta: number) => {
    setQuantities((prev) => {
      const curr = prev[item.name] ?? 1
      const next = Math.max(1, Math.min(item.stock, curr + delta))
      return { ...prev, [item.name]: next }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="sao-panel max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl flex flex-col">
        {/* Shop Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-200/25 bg-slate-950/60 px-6 py-4">
          <div className="flex items-center gap-3">
            {shop.shopkeeper ? (
              <CharacterAvatar
                name={shop.shopkeeper}
                size="md"
                ringClassName="border-amber-300/80 shadow-[0_0_12px_rgba(251,191,36,0.45)]"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-cyan-300/60 bg-cyan-500/20 text-cyan-200">
                <ShoppingBag className="h-5 w-5" />
              </div>
            )}
            <div>
              <div className="font-hud text-[10px] font-bold tracking-widest text-amber-300 uppercase">
                Merchant Shop Interface
              </div>
              <h2 className="font-hud text-lg font-bold text-white">{shop.shop_name}</h2>
              {shop.shopkeeper && (
                <div className="text-[11px] text-slate-300">
                  เจ้าของร้าน: <span className="font-semibold text-cyan-200">{shop.shopkeeper}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-amber-300/50 bg-amber-500/15 px-3.5 py-1.5 text-xs font-bold text-amber-200">
              <Coins className="h-4 w-4 text-amber-300" />
              <span>
                {playerCol.toLocaleString()} {currency}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white"
              aria-label="ปิดร้านค้า"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Item List */}
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {shop.items.map((item) => {
            const qty = getQty(item)
            const totalCost = item.price * qty
            const outOfStock = item.stock <= 0
            const notEnoughCol = !outOfStock && playerCol < totalCost
            const badge = CATEGORY_BADGES[item.category ?? 'special']

            return (
              <div
                key={item.name}
                className={`rounded-xl border p-4 transition ${
                  outOfStock
                    ? 'border-white/10 bg-slate-950/45 opacity-55'
                    : 'border-cyan-200/25 bg-slate-900/65 hover:border-cyan-300/50'
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-raj text-base font-bold text-white">{item.name}</span>
                      <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${badge.style}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-300">{item.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px]">
                      <span className="flex items-center gap-1 font-semibold text-cyan-200">
                        <Package className="h-3.5 w-3.5" />
                        คงเหลือ: {outOfStock ? 'สินค้าหมด' : `${item.stock} ชิ้น`}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-amber-300">
                        <Coins className="h-3.5 w-3.5" />
                        ราคา: {item.price.toLocaleString()} {currency} / ชิ้น
                      </span>
                    </div>
                  </div>

                  {/* Quantity & Buy Controls */}
                  <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                    <div className="flex items-center rounded-lg border border-white/15 bg-slate-950/75">
                      <button
                        type="button"
                        disabled={outOfStock || qty <= 1}
                        onClick={() => updateQty(item, -1)}
                        className="px-2 py-1.5 text-slate-300 hover:text-white disabled:opacity-35"
                        aria-label="ลดจำนวน"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="font-hud min-w-[2rem] text-center text-xs font-bold text-white">
                        {qty}
                      </span>
                      <button
                        type="button"
                        disabled={outOfStock || qty >= item.stock}
                        onClick={() => updateQty(item, 1)}
                        className="px-2 py-1.5 text-slate-300 hover:text-white disabled:opacity-35"
                        aria-label="เพิ่มจำนวน"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button
                      type="button"
                      disabled={outOfStock || notEnoughCol}
                      onClick={() => {
                        onBuyItem(item, qty)
                        setQuantities((prev) => ({ ...prev, [item.name]: 1 }))
                      }}
                      className={`font-hud flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-[11px] font-bold transition ${
                        outOfStock
                          ? 'cursor-not-allowed border-white/10 bg-slate-800 text-slate-400'
                          : notEnoughCol
                            ? 'cursor-not-allowed border-rose-400/40 bg-rose-500/15 text-rose-200'
                            : 'border-amber-300/70 bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-[0_0_16px_rgba(251,191,36,0.35)] hover:brightness-110'
                      }`}
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      {outOfStock
                        ? 'สินค้าหมด'
                        : notEnoughCol
                          ? `Col ไม่พอ (${totalCost.toLocaleString()})`
                          : `ซื้อ (${totalCost.toLocaleString()} ${currency})`}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 bg-slate-950/60 px-6 py-3">
          <span className="text-[11px] text-slate-400">
            ไอเทมที่ซื้อจะเข้ากระเป๋าพร้อมคำอธิบายและหัก {currency} อัตโนมัติ
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-cyan-200/35 bg-white/10 px-4 py-1.5 text-xs font-semibold text-cyan-100 hover:bg-white/20"
          >
            ปิดหน้าร้านค้า
          </button>
        </div>
      </div>
    </div>
  )
}
