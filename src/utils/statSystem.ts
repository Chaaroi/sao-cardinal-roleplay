import type { CharacterAttributes, CharacterStatState, StatKey, WeaponType } from '../types/game'

export const STAT_POINTS_PER_LEVEL = 5
export const BASE_STAT_VALUE = 5
export const STARTER_STAT_POINTS = 3
export const HP_PER_VIT = 20

export const STAT_META: {
  key: StatKey
  label: string
  effectDesc: string
  colorClass: string
}[] = [
  { key: 'STR', label: 'พลังโจมตี', effectDesc: '+3 Phys ATK / +0.2% Stagger', colorClass: 'text-rose-300' },
  { key: 'AGI', label: 'ความเร็ว/หลบ', effectDesc: '+0.3% SPD / +0.25% EVA', colorClass: 'text-emerald-300' },
  { key: 'INT', label: 'พลังสกิล/เวท', effectDesc: '+3 Elem/Skill ATK', colorClass: 'text-sky-300' },
  { key: 'VIT', label: 'เลือด/ป้องกัน', effectDesc: '+20 Max HP / +1.5 DEF', colorClass: 'text-amber-300' },
  { key: 'MND', label: 'สมาธิ/ฟื้นฟู', effectDesc: '+0.3% Heal & Guard', colorClass: 'text-violet-300' },
  { key: 'LUK', label: 'โชค/คริติคอล', effectDesc: '+0.3% CRIT / +0.5% Drop', colorClass: 'text-pink-300' },
]

export function createInitialStatState(weapon?: WeaponType): CharacterStatState {
  const attrs: CharacterAttributes = {
    STR: BASE_STAT_VALUE,
    AGI: BASE_STAT_VALUE,
    INT: BASE_STAT_VALUE,
    VIT: BASE_STAT_VALUE,
    MND: BASE_STAT_VALUE,
    LUK: BASE_STAT_VALUE,
  }

  // Subtle weapon-flavor starting bonus (+1)
  if (weapon === 'Two-Handed Sword' || weapon === 'Mace / Hammer') attrs.STR += 1
  else if (weapon === 'Rapier' || weapon === 'Dagger') attrs.AGI += 1
  else if (weapon === 'Gun & Photon Sword') attrs.LUK += 1
  else if (weapon === 'Katana') attrs.STR += 1

  return {
    attributes: attrs,
    statPoints: STARTER_STAT_POINTS,
    spentPoints: 0,
  }
}

export function ensureCharacterStats(
  stats: CharacterStatState | undefined,
  level: number,
  weapon?: WeaponType
): CharacterStatState {
  if (stats) return stats
  const base = createInitialStatState(weapon)
  const levelBonus = Math.max(0, level - 1) * STAT_POINTS_PER_LEVEL
  return {
    ...base,
    statPoints: base.statPoints + levelBonus,
  }
}

export function computeDerivedStats(stats: CharacterStatState, level: number) {
  const { STR, AGI, INT, VIT, MND, LUK } = stats.attributes
  const physAtk = Math.round(18 + level * 4 + STR * 3 + AGI * 0.8)
  const skillAtk = Math.round(15 + level * 3 + INT * 3 + MND * 1.2)
  const def = Math.round(8 + level * 2 + VIT * 1.5 + STR * 0.5)
  const critPct = Math.min(75, +(5 + LUK * 0.35 + AGI * 0.15).toFixed(1))
  const evaPct = Math.min(60, +(3 + AGI * 0.25 + LUK * 0.1).toFixed(1))
  const vitBonusHp = Math.max(0, (VIT - BASE_STAT_VALUE) * HP_PER_VIT)

  return {
    physAtk,
    skillAtk,
    def,
    critPct,
    evaPct,
    vitBonusHp,
  }
}

export function inferCombatArchetype(stats: CharacterStatState): string {
  const entries = Object.entries(stats.attributes) as [StatKey, number][]
  entries.sort((a, b) => b[1] - a[1])
  const [top1, top2] = entries
  if (top1[1] <= BASE_STAT_VALUE + 1) return 'Novice Adventurer'
  const pair = new Set([top1[0], top2[0]])
  if (pair.has('STR') && pair.has('AGI')) return 'Frontline Striker'
  if (pair.has('STR') && pair.has('VIT')) return 'Iron Vanguard'
  if (pair.has('AGI') && pair.has('LUK')) return 'Phantom Assassin'
  if (pair.has('INT') && pair.has('MND')) return 'Sacred Caster'
  if (pair.has('VIT') && pair.has('MND')) return 'Immortal Guardian'
  if (top1[0] === 'STR') return 'Berserk Swordsman'
  if (top1[0] === 'AGI') return 'Flash Duelist'
  if (top1[0] === 'INT') return 'Mystic Blade'
  if (top1[0] === 'VIT') return 'Shield Knight'
  if (top1[0] === 'MND') return 'Tactical Support'
  return 'Fortune Hunter'
}
