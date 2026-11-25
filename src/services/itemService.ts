import { GoogleGenAI, ThinkingLevel } from '@google/genai'
import type { InventoryItem } from '../types/game'
import { resolveWikiTopic } from './wikiLoreService'

const ITEM_DESC_CACHE_KEY = 'sao_item_descriptions_v1'

const BUILTIN_SAO_ITEMS: Record<string, string> = {
  'one-handed sword': 'ดาบมือเดียวมาตรฐานสำหรับนักรบแนวหน้า สมดุลทั้งความเร็วและพลังโจมตี ใช้ร่วมกับ Sword Skill ได้หลากหลาย',
  rapier: 'ดาบเรเปียร์ปลายแหลมสำหรับสายความเร็วสูง โดดเด่นด้านการแทงต่อเนื่องและความแม่นยำ (เช่น Linear, Quadruple Pain)',
  dagger: 'มีดสั้นน้ำหนักเบา เพิ่มความคล่องตัวและอัตราหลบหลีก เหมาะกับการลอบโจมตีหรือปามีดระยะสั้น',
  katana: 'ดาบคาตานะสายฟันเฉือนรุนแรง ต้องปลดล็อก Extra Skill หรือใช้ทักษะเฉพาะสายซามูไร',
  'two-handed sword': 'ดาบใหญ่สองมือ พลังทำลายสูงและทลายเกราะศัตรูได้ดี แต่จังหวะเหวี่ยงช้ากว่าดาบมือเดียว',
  'spear / halberd': 'หอก/ง้าวยาว โจมตีได้ระยะไกลและคุมพื้นที่ได้ดีเยี่ยม เหมาะกับการแทงสนับสนุนจากแถวหลัง',
  'gun & photon sword': 'อาวุธผสมระหว่างปืนไฟและดาบแสงโฟตอนสำหรับสายยิงระยะไกลและปัดกระสุนใน Gun Gale Online',
  'mace / hammer': 'กระบอง/ค้อนหนัก พลังกระแทกสูงและช่วยป้องกันการโจมตีของมอนสเตอร์สายเกราะแข็งได้ดี',
  'healing potion (minor)': 'น้ำยาฟื้นฟู HP ระดับเริ่มต้น กดดื่มเพื่อฟื้นพลังชีวิตประมาณ 100–150 หน่วยระหว่างสำรวจหรือต่อสู้',
  'healing potion': 'น้ำยาฟื้นฟู HP มาตรฐาน ช่วยฟื้นฟูพลังชีวิตได้อย่างรวดเร็วในสถานการณ์คับขัน',
  'teleport crystal': 'คริสตัลเคลื่อนย้ายฉุกเฉิน ใช้เอ่ยคำว่า "Teleport! [ชื่อเมือง]" เพื่อวาร์ปกลับเมืองปลอดภัยทันที (ใช้ไม่ได้ในห้องบอสที่มี Anti-Crystal Zone)',
  'corridor crystal': 'คริสตัลบันทึกพิกัดทางเดิน ใช้บันทึกจุดที่ยืนอยู่และวาร์ปกลับมาได้ในภายหลัง',
  'antidote crystal': 'คริสตัลแก้พิษและสถานะผิดปกติ ใช้ลบล้างพิษ อัมพาต หรือดีบัฟต่างๆ ทันที',
  'black bread': 'ขนมปังดำราคาประหยัดจากเมืองเริ่มต้น กินเพื่อบรรเทาความหิวและฟื้น HP เล็กน้อย (รสชาติจืด แต่ทาครีมหรือแยมเพิ่มได้)',
  'novice map': 'แผนที่พื้นฐานของภูมิภาคเริ่มต้น แสดงพิกัดเมือง ถนนสายหลัก และจุดอันตรายเบื้องต้น',
  'ragout rabbit sandwich': 'แซนด์วิชเนื้อกระต่ายแรงก์ S สุดหายาก ฟื้นฟู HP เต็มหลอดและเพิ่มบัฟอารมณ์ดี (ใช้เป็นของขวัญเพิ่มความสนิทได้ดีมาก)',
  'iron ingot': 'แท่งเหล็กดิบสำหรับช่างตีเหล็ก ใช้เป็นวัตถุดิบหลอมสร้างหรืออัปเกรดอาวุธและชุดเกราะ',
}

function loadItemCache(): Record<string, string> {
  try {
    const raw = localStorage.getItem(ITEM_DESC_CACHE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, string>
  } catch {
    return {}
  }
}

export function saveItemToCache(name: string, description: string): void {
  const key = name.trim().toLowerCase()
  const cache = loadItemCache()
  cache[key] = description
  try {
    localStorage.setItem(ITEM_DESC_CACHE_KEY, JSON.stringify(cache))
  } catch {
    // Ignore storage quota errors
  }
}

export function getCachedItemDescription(item: InventoryItem): string | null {
  if (item.description) return item.description
  const key = item.name.trim().toLowerCase()

  const cache = loadItemCache()
  if (cache[key]) return cache[key]

  if (BUILTIN_SAO_ITEMS[key]) return BUILTIN_SAO_ITEMS[key]

  // Partial keyword match for common variants (e.g., "Marriage Ring (Asuna)")
  if (key.includes('marriage ring')) {
    return 'แหวนแต่งงานระบบ Cardinal ยืนยันสถานะคู่สมรส ปลดล็อก Shared Inventory บ้านร่วมกัน และบัฟ Marriage Blessing'
  }
  if (key.includes('potion')) {
    return 'น้ำยาฟื้นฟูพลังชีวิตหรือสถานะ กดใช้ระหว่างการผจญภัยหรือการต่อสู้เพื่อเอาตัวรอด'
  }
  if (key.includes('crystal')) {
    return 'คริสตัลเวทมนตร์ระบบ SAO ใช้เรียกใช้งานฟังก์ชันฉุกเฉิน (วาร์ป ฟื้นฟู หรือแก้สถานะ) ได้ทันที'
  }
  return null
}

function getFallbackCategoryDescription(item: InventoryItem): string {
  switch (item.category) {
    case 'consumable':
      return `ไอเทมกดใช้ "${item.name}" — ใช้ฟื้นฟูพลังชีวิต บรรเทาความหิว หรือรับบัฟชั่วคราวระหว่างผจญภัย (หรือมอบเป็นของขวัญให้ NPC ได้)`
    case 'equipment':
      return `อุปกรณ์สวมใส่ "${item.name}" — ใช้ติดตั้งเพิ่มค่าสถานะการต่อสู้และปลดล็อกทักษะ Sword Skill ประจำสาย`
    case 'material':
      return `วัตถุดิบ "${item.name}" — ใช้ส่งมอบให้ช่างตีเหล็ก (เช่น Lisbeth) เพื่ออัปเกรดอาวุธ หรือขายแลก Col ในตลาด`
    default:
      return `ไอเทมพิเศษ "${item.name}" — ของสำคัญหรือของที่ระลึกในจักรวาล SAO ใช้ตรวจสอบ ใช้งานในเนื้อเรื่อง หรือมอบให้คู่หูได้`
  }
}

const inFlightItemLookups = new Map<string, Promise<string>>()

export async function resolveItemDescription(params: {
  item: InventoryItem
  apiKey: string
  model: string
  worldArc: string
  demoMode: boolean
}): Promise<string> {
  const { item, apiKey, model, worldArc, demoMode } = params
  const cached = getCachedItemDescription(item)
  if (cached) return cached

  const key = item.name.trim().toLowerCase()
  const existing = inFlightItemLookups.get(key)
  if (existing) return existing

  const promise = (async () => {
    if (demoMode || !apiKey.trim()) {
      const fallback = getFallbackCategoryDescription(item)
      saveItemToCache(item.name, fallback)
      return fallback
    }

    try {
      const wikiHit = await resolveWikiTopic(item.name)
      const wikiHint = wikiHit ? `\nข้อมูลอ้างอิงจาก SAO Fandom Wiki: ${wikiHit.summary}` : ''

      const ai = new GoogleGenAI({ apiKey: apiKey.trim() })
      const prompt = `คุณคือระบบ Cardinal System ของเกม Sword Art Online (ภาค ${worldArc})${wikiHint}
จงอธิบายสรรพคุณและวิธีใช้งานของไอเทมชื่อ "${item.name}" (หมวด: ${item.category ?? 'ทั่วไป'}) เป็นภาษาไทยสั้นๆ กระชับ เข้าใจง่าย ความยาว 1-2 ประโยค (ไม่ต้องใส่หัวข้อหรือ markdown)`

      const lower = model.toLowerCase()
      const useLowThinking = lower.startsWith('gemini-4') || lower.startsWith('gemini-3')
      const response = await ai.models.generateContent({
        model,
        contents: [{ text: prompt }],
        config: {
          temperature: 0.5,
          maxOutputTokens: 160,
          ...(useLowThinking ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } } : {}),
        },
      })

      const text = response.text?.trim()
      if (text) {
        saveItemToCache(item.name, text)
        return text
      }
    } catch {
      // Fallback cleanly if API call fails or rate-limited
    }

    const fallback = getFallbackCategoryDescription(item)
    saveItemToCache(item.name, fallback)
    return fallback
  })()

  inFlightItemLookups.set(key, promise)
  try {
    return await promise
  } finally {
    inFlightItemLookups.delete(key)
  }
}
