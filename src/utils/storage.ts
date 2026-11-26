import { createInitialStatState } from './statSystem'
import type {
  AppSettings,
  GameSession,
  InventoryItem,
  PlayerProfile,
  SaveSlotMeta,
  WorldArc,
  WorldState,
} from '../types/game'

const SETTINGS_KEY = 'sao_cardinal_settings_v1'
const AUTOSAVE_KEY = 'sao_cardinal_autosave_v1'
const SLOTS_KEY = 'sao_cardinal_saveslots_v1'

export const DEFAULT_SETTINGS: AppSettings = {
  apiKey: '',
  model: 'gemini-4-hydrogen',
  demoMode: false,
  fastMode: true,
  autoEventImages: true,
  imageModel: 'auto',
  ostEnabled: true,
  ostVolume: 45,
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<AppSettings>
    return {
      apiKey: parsed.apiKey ?? '',
      model: typeof parsed.model === 'string' && parsed.model.trim() ? parsed.model.trim() : 'gemini-4-hydrogen',
      demoMode: Boolean(parsed.demoMode),
      fastMode: parsed.fastMode !== undefined ? Boolean(parsed.fastMode) : true,
      autoEventImages: parsed.autoEventImages !== undefined ? Boolean(parsed.autoEventImages) : true,
      imageModel: typeof parsed.imageModel === 'string' && parsed.imageModel.trim() ? parsed.imageModel.trim() : 'auto',
      ostEnabled: parsed.ostEnabled !== undefined ? Boolean(parsed.ostEnabled) : true,
      ostVolume:
        typeof parsed.ostVolume === 'number' && parsed.ostVolume >= 0 && parsed.ostVolume <= 100
          ? Math.round(parsed.ostVolume)
          : 45,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function loadAutoSave(): GameSession | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as GameSession
  } catch {
    return null
  }
}

export function saveAutoSave(session: GameSession): void {
  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(session))
  } catch {
    // If localStorage quota is full due to many CG images, strip oldest images and retry
    const trimmedMessages = session.messages.map((m, idx) =>
      idx < session.messages.length - 4 ? { ...m, eventImage: undefined } : m
    )
    try {
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({ ...session, messages: trimmedMessages }))
    } catch {
      // Ignore if storage still restricted
    }
  }
}

export function clearAutoSave(): void {
  localStorage.removeItem(AUTOSAVE_KEY)
}

export function loadSaveSlots(): SaveSlotMeta[] {
  try {
    const raw = localStorage.getItem(SLOTS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveToSlot(slotId: string, label: string, session: GameSession): SaveSlotMeta[] {
  const slots = loadSaveSlots().filter((s) => s.slotId !== slotId)
  const next: SaveSlotMeta[] = [
    {
      slotId,
      label,
      session: { ...session, updatedAt: Date.now() },
      savedAt: Date.now(),
    },
    ...slots,
  ].sort((a, b) => a.slotId.localeCompare(b.slotId))
  localStorage.setItem(SLOTS_KEY, JSON.stringify(next))
  return next
}

export function deleteSaveSlot(slotId: string): SaveSlotMeta[] {
  const next = loadSaveSlots().filter((s) => s.slotId !== slotId)
  localStorage.setItem(SLOTS_KEY, JSON.stringify(next))
  return next
}

const ARC_DEFAULTS: Record<WorldArc, { arc: string; location: string; date: string }> = {
  'Aincrad (Floor 1)': {
    arc: 'Aincrad',
    location: 'Floor 1 - Town of Beginnings (Central Plaza)',
    date: '2022-11-06 13:05',
  },
  Progressive: {
    arc: 'Aincrad Progressive',
    location: 'Floor 1 - Tolbana Outskirts',
    date: '2022-12-01 10:30',
  },
  'ALfheim Online': {
    arc: 'ALfheim Online',
    location: 'Sylvein - Capital of the Sylphs',
    date: '2025-05-18 16:00',
  },
  'Gun Gale Online': {
    arc: 'Gun Gale Online',
    location: 'SBC Glocken - Governor Plaza',
    date: '2025-12-07 20:15',
  },
  Underworld: {
    arc: 'Underworld',
    location: 'Rulid Village - Northern Woods',
    date: 'Human Empire Year 380',
  },
  'Gameverse Crossover': {
    arc: 'Hollow Realization (Ainground)',
    location: 'Town of Beginnings - Teleport Gate Plaza',
    date: '2026-03-14 14:00',
  },
}

export function createInitialSession(profile: PlayerProfile): GameSession {
  const defaults = ARC_DEFAULTS[profile.startingArc]
  const isRomanceMode = profile.storyMode === 'romance'
  const romanceTarget = isRomanceMode ? profile.romanceTarget ?? null : null
  const preGameBonds = !isRomanceMode ? profile.preGameBonds ?? [] : []

  // Build initial knownCharacters & party from Romance Mode target or carried Pre-Game Bonds
  const initialKnownCharacters: GameSession['knownCharacters'] = {}
  const initialPartyMembers: string[] = []
  const initialButterflyEffects: string[] = []
  let initialSpouse: string | null = null

  if (isRomanceMode && romanceTarget) {
    initialKnownCharacters[romanceTarget.name] = {
      name: romanceTarget.name,
      affection: 150,
      affection_delta: '0',
      relationship_tier: 'Friend',
      mood: 'Curious',
      is_married: false,
      can_propose: false,
      last_seen_location: romanceTarget.realWorldSetting,
    }
  } else if (preGameBonds.length > 0) {
    for (const bond of preGameBonds) {
      initialKnownCharacters[bond.characterName] = {
        name: bond.characterName,
        affection: bond.affection,
        affection_delta: '0',
        relationship_tier: bond.relationship_tier,
        mood: bond.is_married ? 'Affectionate' : bond.affection >= 500 ? 'Warm & Close' : 'Friendly',
        is_married: bond.is_married,
        can_propose: bond.affection >= 900 && !bond.is_married,
        in_party: bond.affection >= 400 || bond.is_married,
        last_seen_location: `Real World (${bond.sourceArc})`,
      }
      if (bond.affection >= 400 || bond.is_married) {
        initialPartyMembers.push(bond.characterName)
      }
      if (bond.is_married && !initialSpouse) {
        initialSpouse = bond.characterName
      }
      initialButterflyEffects.push(
        `Pre-Game Bond: รู้จักและผูกพันกับ ${bond.characterName} (${bond.relationship_tier}, Affection ${bond.affection}) มาก่อนในโลกจริง ก่อนล็อกอินเข้าสู่ ${defaults.arc} ด้วยกัน`
      )
    }
  }

  const initialWorldState: WorldState = isRomanceMode && romanceTarget
    ? {
        world_arc: 'Real World (Pre-Dive Dating)',
        location: romanceTarget.realWorldSetting,
        in_game_date: '2022-10-15 16:00',
        canon_divergence: `Romance Route (${romanceTarget.name}) — ก่อนเข้าสู่ ${defaults.arc}`,
        player: {
          level: 1,
          hp: 250,
          max_hp: 250,
          col: 500,
          status_effects: ['Pre-Game Dating Mode'],
          inventory_changes: [],
          spouse: null,
        },
        characters_in_scene: [initialKnownCharacters[romanceTarget.name]],
        system_alerts: [
          `ROMANCE MODE: เริ่มทำความรู้จักและสานสัมพันธ์กับ ${romanceTarget.name} ในโลกจริง!`,
        ],
        marriage_event_triggered: false,
        marriage_partner: null,
      }
    : {
        world_arc: defaults.arc,
        location: defaults.location,
        in_game_date: defaults.date,
        canon_divergence:
          profile.storyMode === 'canon'
            ? 'Low (0% - ตามเส้นเรื่องหลัก)'
            : 'Sandbox AU (อิสระเต็มรูปแบบ)',
        player: {
          level: 1,
          hp: 250,
          max_hp: 250,
          col: 500,
          status_effects: preGameBonds.some((b) => b.perkUnlocked)
            ? ['Pre-Game Companion Bond Active']
            : [],
          inventory_changes: [],
          spouse: initialSpouse,
        },
        characters_in_scene: Object.values(initialKnownCharacters),
        system_alerts: [
          `LINK START! ยินดีต้อนรับ ${profile.name} สู่ ${defaults.arc}`,
          ...(preGameBonds.length > 0
            ? [
                `เชื่อมต่อความสัมพันธ์ก่อนเข้าเกมกับ ${preGameBonds.map((b) => b.characterName).join(', ')} สำเร็จ!`,
              ]
            : []),
        ],
        marriage_event_triggered: false,
        marriage_partner: initialSpouse,
      }

  const starterItems: InventoryItem[] = isRomanceMode
    ? [
        {
          name: 'Smartphone & Contact ID',
          quantity: 1,
          category: 'special',
          description: 'สมาร์ตโฟนสำหรับติดต่อ นัดเดต และพูดคุยกับตัวละครในโลกจริงก่อนเข้าเกม',
        },
        {
          name: 'Handmade Sweet Box',
          quantity: 1,
          category: 'consumable',
          description: 'กล่องขนมหวานสำหรับมอบเป็นของขวัญระหว่างออกเดต',
        },
        {
          name: 'Gift Voucher / Bouquet',
          quantity: 1,
          category: 'special',
          description: 'ของขวัญแทนใจสำหรับโอกาสพิเศษในโลกจริง',
        },
      ]
    : [
        { name: profile.weapon, quantity: 1, category: 'equipment' },
        { name: 'Healing Potion (Minor)', quantity: 3, category: 'consumable' },
        { name: 'Teleport Crystal', quantity: 1, category: 'consumable' },
        { name: 'Black Bread', quantity: 2, category: 'consumable' },
      ]

  const originRoute = isRomanceMode
    ? null
    : profile.startingArc === 'Aincrad (Floor 1)'
      ? 'Aincrad (Floor 1)'
      : profile.startingArc === 'Progressive'
        ? 'Progressive'
        : null

  return {
    id: `sao-${Date.now()}`,
    profile,
    originRoute,
    arcHistory: isRomanceMode ? [] : [profile.startingArc],
    romanceTarget,
    preGameBonds,
    characterStats: createInitialStatState(profile.weapon),
    equippedItems: isRomanceMode ? [] : [profile.weapon],
    worldState: initialWorldState,
    knownCharacters: initialKnownCharacters,
    inventory: starterItems,
    sharedInventory: [],
    sharedHome: null,
    partyMembers: initialPartyMembers,
    butterflyEffects: initialButterflyEffects,
    messages: [],
    updatedAt: Date.now(),
  }
}
