import type { GameSession, InventoryItem, WeaponType, WorldArc } from '../types/game'
import { ensureCharacterStats } from './statSystem'

export const ALL_WORLD_ARCS: WorldArc[] = [
  'Aincrad (Floor 1)',
  'Progressive',
  'ALfheim Online',
  'Gun Gale Online',
  'Underworld',
  'Gameverse Crossover',
]

const TARGET_ARC_DEFAULTS: Record<
  WorldArc,
  { arc: string; location: string; date: string; starterItems: InventoryItem[] }
> = {
  'Aincrad (Floor 1)': {
    arc: 'Aincrad',
    location: 'Floor 1 - Town of Beginnings (Central Plaza)',
    date: '2022-11-06 13:05',
    starterItems: [{ name: 'Novice Map', quantity: 1, category: 'special' }],
  },
  Progressive: {
    arc: 'Aincrad Progressive',
    location: 'Floor 1 - Tolbana Outskirts',
    date: '2022-12-01 10:30',
    starterItems: [{ name: 'Progressive Floor Guide', quantity: 1, category: 'special' }],
  },
  'ALfheim Online': {
    arc: 'ALfheim Online',
    location: 'Sylvein - Capital of the Sylphs',
    date: '2025-05-18 16:00',
    starterItems: [
      {
        name: 'Fairy Wings (Flight Controller)',
        quantity: 1,
        category: 'equipment',
        description: 'ปีกภูตระบบ ALfheim Online ใช้บินเสรีบนท้องฟ้าและต่อสู้กลางอากาศ (เปิดใช้งานระบบ Magic ได้)',
      },
      {
        name: 'ALO Healing Crystal',
        quantity: 3,
        category: 'consumable',
        description: 'คริสตัลฟื้นฟูพลังชีวิตประจำโลก ALfheim Online',
      },
    ],
  },
  'Gun Gale Online': {
    arc: 'Gun Gale Online',
    location: 'SBC Glocken - Governor Plaza',
    date: '2025-12-07 20:15',
    starterItems: [
      {
        name: 'Satellite Scan Terminal',
        quantity: 1,
        category: 'special',
        description: 'อุปกรณ์สแกนพิกัดผู้เล่นและพื้นที่ในสมรภูมิ Gun Gale Online',
      },
      {
        name: 'First-Aid Kit (GGO)',
        quantity: 3,
        category: 'consumable',
        description: 'ชุดปฐมพยาบาลฉุกเฉินฟื้นฟู HP ใน Gun Gale Online',
      },
    ],
  },
  Underworld: {
    arc: 'Underworld',
    location: 'Rulid Village - Northern Woods',
    date: 'Human Empire Year 380',
    starterItems: [
      {
        name: 'Sacred Arts Primer',
        quantity: 1,
        category: 'special',
        description: 'ตำราเวทศักดิ์สิทธิ์ (Sacred Arts) ประจำอาณาจักรมนุษย์ใน Underworld (System Call)',
      },
      {
        name: 'Honey Pie',
        quantity: 2,
        category: 'consumable',
        description: 'พายน้ำผึ้งจากหมู่บ้านรูลิด ช่วยฟื้นฟู Life และความเหนื่อยล้า',
      },
    ],
  },
  'Gameverse Crossover': {
    arc: 'Hollow Realization (Ainground)',
    location: 'Town of Beginnings - Teleport Gate Plaza',
    date: '2026-03-14 14:00',
    starterItems: [
      {
        name: 'Ainground Link Badge',
        quantity: 1,
        category: 'special',
        description: 'ตราสัญลักษณ์เชื่อมต่อจักรวาล Gameverse เปิดทางพบตัวละครข้ามภาคทุกสาย',
      },
    ],
  },
}

/**
 * Determines which starting Aincrad route a save belongs to (if any),
 * preserving the strict lock between Aincrad (2022 Canon) and Progressive (Floor-by-Floor).
 */
export function getOriginRoute(session: GameSession): 'Aincrad (Floor 1)' | 'Progressive' | null {
  if (session.profile.storyMode === 'romance') return null
  if (session.originRoute) return session.originRoute
  if (session.profile.startingArc === 'Aincrad (Floor 1)') return 'Aincrad (Floor 1)'
  if (session.profile.startingArc === 'Progressive') return 'Progressive'
  const lowerArc = session.worldState.world_arc.toLowerCase()
  if (lowerArc.includes('progressive')) return 'Progressive'
  if (lowerArc.includes('aincrad')) return 'Aincrad (Floor 1)'
  return null
}

export interface ArcEligibilityResult {
  allowed: boolean
  recommended?: boolean
  reason?: string
}

/**
 * Enforces save-transfer rules:
 * - Pre-Game Romance Mode saves can dive into ANY starting VR World Arc together!
 * - Aincrad (2022 Canon) <-> Progressive (Floor-by-Floor) are mutually exclusive starting routes.
 * - Cannot transfer to the exact current arc.
 * - Aincrad / Progressive saves smoothly transfer forward to ALfheim Online (and later arcs).
 */
export function getArcTransferEligibility(
  session: GameSession,
  targetArc: WorldArc
): ArcEligibilityResult {
  if (session.profile.storyMode === 'romance') {
    return {
      allowed: true,
      recommended: targetArc === session.profile.startingArc,
    }
  }

  const currentArc = session.profile.startingArc
  const originRoute = getOriginRoute(session)

  if (currentArc === targetArc) {
    return { allowed: false, reason: 'เซฟนี้กำลังเล่นอยู่ในภาคนี้อยู่แล้ว' }
  }

  if (targetArc === 'Aincrad (Floor 1)' && originRoute === 'Progressive') {
    return {
      allowed: false,
      reason: 'ไม่สามารถย้ายเซฟจาก Progressive ไปเล่น Aincrad ได้ (ต้องเลือกจุดเริ่มต้นอย่างใดอย่างหนึ่ง)',
    }
  }

  if (targetArc === 'Progressive' && originRoute === 'Aincrad (Floor 1)') {
    return {
      allowed: false,
      reason: 'ไม่สามารถย้ายเซฟจาก Aincrad ไปเล่น Progressive ได้ (ต้องเลือกจุดเริ่มต้นอย่างใดอย่างหนึ่ง)',
    }
  }

  // Also prevent jumping back into Aincrad/Progressive once already in ALO/GGO/Underworld if from another route
  if (
    (targetArc === 'Aincrad (Floor 1)' || targetArc === 'Progressive') &&
    currentArc !== 'Aincrad (Floor 1)' &&
    currentArc !== 'Progressive'
  ) {
    return {
      allowed: false,
      reason: 'Aincrad และ Progressive เป็นจุดเริ่มต้นของเกม ไม่สามารถย้อนกลับจากภาคหลังได้',
    }
  }

  const isRecommendedNext =
    (currentArc === 'Aincrad (Floor 1)' || currentArc === 'Progressive') &&
    targetArc === 'ALfheim Online'

  return {
    allowed: true,
    recommended: isRecommendedNext,
  }
}

/**
 * Creates a new GameSession in the target World Arc while preserving:
 * - All character relationships, affection scores, tiers, moods, and marriage status
 * - Spouse & shared home memories
 * - Butterfly Effects & player identity / level / special items
 */
export function createTransferredSession(
  source: GameSession,
  targetArc: WorldArc,
  newWeapon?: WeaponType
): GameSession {
  const defaults = TARGET_ARC_DEFAULTS[targetArc]
  const weaponToUse = newWeapon ?? source.profile.weapon
  const fromRomance = source.profile.storyMode === 'romance'
  const originRoute =
    fromRomance
      ? targetArc === 'Aincrad (Floor 1)' || targetArc === 'Progressive'
        ? targetArc
        : null
      : getOriginRoute(source)
  const prevHistory = source.arcHistory ?? (fromRomance ? [] : [source.profile.startingArc])
  const nextHistory = prevHistory.includes(targetArc) ? prevHistory : [...prevHistory, targetArc]

  // Preserve special/ring/key keepsakes from previous arc, plus new arc starter kit
  const carriedSpecialItems = source.inventory.filter(
    (item) =>
      item.category === 'special' ||
      item.name.toLowerCase().includes('ring') ||
      item.name.toLowerCase().includes('elucidator') ||
      item.name.toLowerCase().includes('lambent')
  )

  const newEquipment: InventoryItem = {
    name: weaponToUse,
    quantity: 1,
    category: 'equipment',
  }

  const mergedInvMap = new Map<string, InventoryItem>()
  for (const it of [newEquipment, ...defaults.starterItems, ...carriedSpecialItems]) {
    mergedInvMap.set(it.name.toLowerCase(), { ...it })
  }

  // Deep-clone knownCharacters and mark them ready to be encountered in the new world
  const carriedCharacters: GameSession['knownCharacters'] = {}
  const nextPartySet = new Set(source.partyMembers)
  for (const [k, char] of Object.entries(source.knownCharacters)) {
    const inParty = Boolean(char.in_party) || (fromRomance && (char.affection >= 400 || char.is_married))
    if (inParty) nextPartySet.add(char.name)
    carriedCharacters[k] = {
      ...char,
      in_party: inParty,
      affection_delta: '0',
      last_seen_location: `${source.worldState.world_arc} (Carried Over)`,
    }
  }

  const carriedButterfly = [
    ...source.butterflyEffects,
    fromRomance
      ? `Pre-Game Romance Dive: รู้จักและสานสัมพันธ์จากโลกจริงก่อนล็อกอินเข้าสู่ ${targetArc} ด้วยกัน`
      : `World Transfer: ย้ายตัวละครจาก ${source.worldState.world_arc} เข้าสู่ ${targetArc}`,
  ]

  const spouse = source.worldState.player.spouse

  const carriedStats = ensureCharacterStats(
    source.characterStats,
    source.worldState.player.level,
    source.profile.weapon
  )

  return {
    id: `sao-${Date.now()}`,
    profile: {
      ...source.profile,
      storyMode: fromRomance ? 'canon' : source.profile.storyMode,
      romanceTarget: null,
      preGameBonds: source.preGameBonds,
      weapon: weaponToUse,
      startingArc: targetArc,
    },
    originRoute,
    arcHistory: nextHistory,
    romanceTarget: null,
    preGameBonds: source.preGameBonds,
    characterStats: carriedStats,
    equippedItems: [weaponToUse],
    worldState: {
      world_arc: defaults.arc,
      location: defaults.location,
      in_game_date: defaults.date,
      canon_divergence: fromRomance ? 'Low (Pre-Game Romance Bond Active)' : source.worldState.canon_divergence,
      player: {
        level: source.worldState.player.level,
        hp: source.worldState.player.max_hp,
        max_hp: source.worldState.player.max_hp,
        col: source.worldState.player.col,
        status_effects: spouse
          ? ['The Seed Account Transfer', 'Marriage Bond']
          : fromRomance
            ? ['Pre-Game Companion Bond']
            : ['The Seed Account Transfer'],
        inventory_changes: [],
        spouse,
      },
      characters_in_scene: fromRomance ? Object.values(carriedCharacters) : [],
      system_alerts: [
        fromRomance
          ? `LINK START TOGETHER! เข้าสู่ ${targetArc} พร้อมความสัมพันธ์จากโหมดจีบตัวละครสำเร็จ!`
          : `WORLD TRANSFER COMPLETE: ย้ายเซฟเข้าสู่ ${targetArc} สำเร็จ!`,
        `โอนย้ายความสัมพันธ์ตัวละคร ${Object.keys(carriedCharacters).length} คนเรียบร้อย`,
      ],
      marriage_event_triggered: false,
      marriage_partner: spouse,
      scene_image_prompt: null,
    },
    knownCharacters: carriedCharacters,
    inventory: Array.from(mergedInvMap.values()),
    sharedInventory: [...source.sharedInventory],
    sharedHome: source.sharedHome,
    partyMembers: Array.from(nextPartySet),
    butterflyEffects: carriedButterfly,
    messages: [],
    updatedAt: Date.now(),
  }
}
