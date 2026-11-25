import type { CharacterStatState, DiceChallenge, DiceOption, StatKey, WorldState } from '../types/game'
import { BASE_STAT_VALUE } from './statSystem'

export interface StatModifierBreakdown {
  stat: StatKey
  value: number
  bonus: number
}

export interface EquipmentBonusItem {
  name: string
  bonus: number
  reason: string
}

export function computeStatDiceModifiers(
  stats: CharacterStatState,
  requiredStats: StatKey[]
): { items: StatModifierBreakdown[]; total: number } {
  const uniqueStats = Array.from(new Set(requiredStats))
  const items = uniqueStats.map((stat) => {
    const val = stats.attributes[stat] ?? BASE_STAT_VALUE
    const bonus = Math.floor((val - BASE_STAT_VALUE) / 2)
    return { stat, value: val, bonus }
  })
  const total = items.reduce((acc, it) => acc + it.bonus, 0)
  return { items, total }
}

/**
 * Computes situational dice bonuses from currently equipped items.
 */
export function computeEquipmentDiceBonuses(
  equippedItems: string[],
  requiredStats: StatKey[],
  contextText: string
): { items: EquipmentBonusItem[]; total: number } {
  if (!equippedItems || equippedItems.length === 0) {
    return { items: [], total: 0 }
  }

  const lowerContext = contextText.toLowerCase()
  const statSet = new Set(requiredStats)
  const bonuses: EquipmentBonusItem[] = []

  for (const name of equippedItems) {
    const lower = name.toLowerCase()
    let bonus = 1
    let reason = 'อุปกรณ์สวมใส่พื้นฐาน'

    // Plus-upgraded weapons (+1, +2, +3...)
    const plusMatch = lower.match(/\+(\d+)/)
    const upgradeBonus = plusMatch ? Math.min(4, parseInt(plusMatch[1], 10)) : 0

    if (
      lower.includes('elucidator') ||
      lower.includes('dark repulser') ||
      lower.includes('lambent light') ||
      lower.includes('blue rose')
    ) {
      bonus = statSet.has('STR') || statSet.has('AGI') ? 3 + upgradeBonus : 1
      reason = 'อาวุธระดับตำนาน (+STR/AGI)'
    } else if (
      lower.includes('sword') ||
      lower.includes('blade') ||
      lower.includes('rapier') ||
      lower.includes('katana') ||
      lower.includes('dagger') ||
      lower.includes('spear') ||
      lower.includes('halberd') ||
      lower.includes('mace') ||
      lower.includes('hammer') ||
      lower.includes('gun')
    ) {
      if (statSet.has('STR') || statSet.has('AGI') || statSet.has('LUK')) {
        bonus = 1 + upgradeBonus
        reason = upgradeBonus > 0 ? `อาวุธตีบวก +${upgradeBonus}` : 'อาวุธประจำตัวช่วยสู้/ป้องกัน'
      } else {
        bonus = 0
      }
    } else if (lower.includes('fairy wings') || lower.includes('wing')) {
      if (statSet.has('AGI') || statSet.has('LUK') || /หนี|บิน|หลบ|escape|fly/.test(lowerContext)) {
        bonus = 2
        reason = 'ปีกภูตช่วยเพิ่มความคล่องตัว/หลบหนี'
      } else {
        bonus = 1
        reason = 'อุปกรณ์ ALO'
      }
    } else if (lower.includes('sacred arts') || lower.includes('staff') || lower.includes('wand')) {
      if (statSet.has('INT') || statSet.has('MND')) {
        bonus = 2
        reason = 'อุปกรณ์เสริมพลัง Sacred Arts / INT & MND'
      }
    } else if (lower.includes('ring')) {
      if (statSet.has('LUK') || statSet.has('MND')) {
        bonus = 2
        reason = 'แหวนคู่สมรสเสริมสมาธิและโชค'
      }
    } else if (lower.includes('coat') || lower.includes('armor') || lower.includes('shield')) {
      if (statSet.has('VIT') || statSet.has('MND')) {
        bonus = 2
        reason = 'ชุดเกราะเพิ่มความทนทาน'
      }
    }

    if (bonus > 0) {
      bonuses.push({ name, bonus, reason })
    }
  }

  const total = bonuses.reduce((acc, b) => acc + b.bonus, 0)
  return { items: bonuses, total }
}

/**
 * Exact 1d20 success probability (%) given DC and total Stat+Equipment bonus
 * (accounting for natural 20 always succeeding and natural 1 always failing).
 */
export function calculateD20SuccessChance(dc: number, totalBonus: number): number {
  const minFaceToWin = Math.max(2, Math.min(20, dc - totalBonus))
  const winningFaces = 21 - minFaceToWin
  return Math.round((winningFaces / 20) * 100)
}

export function getChallengeOptions(challenge: DiceChallenge): DiceOption[] {
  if (challenge.options && challenge.options.length > 0) {
    return challenge.options
  }
  return [
    {
      id: 'primary',
      label: challenge.title,
      description: challenge.description,
      required_stats: challenge.required_stats,
      dc: challenge.dc,
      on_success: challenge.on_success,
      on_fail: challenge.on_fail,
    },
  ]
}

/**
 * Infers an encounter Dice Challenge with multiple tactical options
 * (Fight, Think/Analyze, Escape, Guard/Persuade) and pre-selects the matching approach.
 */
export function buildDiceChallengeFromAction(
  userText: string,
  worldState: WorldState
): DiceChallenge {
  const lower = userText.toLowerCase()

  const combatOption: DiceOption = {
    id: 'combat',
    label: '⚔️ เข้าสู้ / ปะทะตรงๆ',
    approach_type: 'combat',
    description: `ใช้ทักษะอาวุธและพละกำลังเข้าจู่โจมเป้าหมายใน ${worldState.location}`,
    required_stats: ['STR', 'AGI'],
    dc: 12,
    on_success: 'โจมตีเข้าจุดสำคัญ สร้างความเสียหายสูง เอาชนะหรือชิงความได้เปรียบได้ทันที',
    on_fail: 'โจมตีพลาดเป้าหรือถูกสวนกลับ ทำให้เสีย HP เล็กน้อยและเสียจังหวะ',
  }

  const thinkOption: DiceOption = {
    id: 'think',
    label: '🧠 ใช้ความคิด / วิเคราะห์จุดอ่อน',
    approach_type: 'think',
    description: 'ชะลอจังหวะเพื่อสังเกตแพทเทิร์นศัตรู กลไก หรือสภาพแวดล้อมรอบตัว',
    required_stats: ['MND', 'INT'],
    dc: 13,
    on_success: 'อ่านทางและมองเห็นจุดอ่อนได้สำเร็จ ชนะทางโดยแทบไม่เปลืองแรงหรือพบโอกาสพิเศษ',
    on_fail: 'ใช้เวลาคิดนานเกินไปจนศัตรู/สถานการณ์ชิงจังหวะโจมตีเข้ามาก่อน',
  }

  const escapeOption: DiceOption = {
    id: 'escape',
    label: '🏃 หลบหนี / ถอยตั้งหลัก',
    approach_type: 'escape',
    description: 'อาศัยความเร็วและจังหวะโชคสลัดตัวออกจากพื้นที่อันตราย',
    required_stats: ['LUK', 'AGI'],
    dc: 11,
    on_success: 'หลบหนีออกมาได้อย่างปลอดภัยโดยไม่เสีย HP และกลับไปตั้งหลักได้',
    on_fail: 'ถูกดักทางไว้ได้ทัน ทำให้โดนเฉียดเสีย HP และยังหนีไม่พ้น',
  }

  const guardOption: DiceOption = {
    id: 'guard',
    label: '🛡️ ตั้งการ์ด / ป้องกันต้านทาน',
    approach_type: 'guard',
    description: 'ยกอาวุธหรือใช้ร่างกายรับแรงปะทะเพื่อรอจังหวะสวนกลับ',
    required_stats: ['VIT', 'MND'],
    dc: 12,
    on_success: 'ตั้งรับแรงกระแทกได้สมบูรณ์ ลดความเสียหายได้เกือบหมดและเปิดช่องสวนกลับ',
    on_fail: 'การ์ดแตกหรือรับแรงกระแทกเต็มๆ ทำให้เสีย HP และเสียหลัก',
  }

  const socialOption: DiceOption = {
    id: 'social',
    label: '💬 เจรจา / โน้มน้าวใจ',
    approach_type: 'social',
    description: 'ใช้คำพูดและจังหวะที่เหมาะสมในการเกลี้ยกล่อมหรือดึงความสนใจ',
    required_stats: ['MND', 'LUK'],
    dc: 12,
    on_success: 'อีกฝ่ายคล้อยตามหรือชะงักไป เพิ่มความสัมพันธ์หรือคลี่คลายสถานการณ์ได้',
    on_fail: 'คำพูดไม่ได้ผลหรืออีกฝ่ายไม่ยอมรับ ทำให้สถานการณ์ตึงเครียดขึ้น',
  }

  let defaultId = 'combat'
  let options: DiceOption[] = [combatOption, thinkOption, escapeOption]

  if (/หนี|ถอย|หลบหนี|วิ่งหนี|สลัดหลุด|flee|escape|retreat/.test(lower)) {
    defaultId = 'escape'
    options = [escapeOption, thinkOption, combatOption]
  } else if (/คิด|วิเคราะห์|สังเกต|ปริศนา|กับดัก|วางแผน|อ่าน|ตรวจสอบ|สืบ|analyze|think|plan|trap|investigate/.test(lower)) {
    defaultId = 'think'
    options = [thinkOption, escapeOption, combatOption]
  } else if (/จีบ|ขอ|เกลี้ยกล่อม|ชวน|สารภาพ|เจรจา|persuade|charm|convince|negotiate/.test(lower)) {
    defaultId = 'social'
    options = [socialOption, thinkOption, escapeOption]
  } else if (/ป้องกัน|รับ|ทน|บล็อก|อดทน|defend|block|guard|endure/.test(lower)) {
    defaultId = 'guard'
    options = [guardOption, combatOption, escapeOption]
  }

  const chosen = options.find((o) => o.id === defaultId) ?? options[0]

  return {
    title: 'เลือกแนวทางการรับมือ & ทอยลูกเต๋า (1d20)',
    description: `สถานการณ์ใน ${worldState.location} — เลือกวิธีรับมือที่เหมาะกับค่า Stat และอุปกรณ์ของคุณ`,
    required_stats: chosen.required_stats,
    dc: chosen.dc,
    on_success: chosen.on_success,
    on_fail: chosen.on_fail,
    options,
    default_option_id: defaultId,
    source_action: userText,
  }
}
