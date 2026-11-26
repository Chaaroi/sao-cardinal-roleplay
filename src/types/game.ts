export type WorldArc =
  | 'Aincrad (Floor 1)'
  | 'Progressive'
  | 'ALfheim Online'
  | 'Gun Gale Online'
  | 'Underworld'
  | 'Gameverse Crossover'

export type StoryMode = 'canon' | 'sandbox' | 'romance'

export interface CompanionPerkDefinition {
  id: string
  title: string
  shortLabel: string
  description: string
  unlockAffection: number
  actionType: 'shop' | 'quick_action'
  shopTemplate?: ShopState
  quickPrompt?: string
}

export interface RomanceCharacterProfile {
  id: string
  name: string
  wikiTitle: string
  roleTitle: string
  realWorldSetting: string
  personality: string
  loves: string[]
  likes: string[]
  dislikes: string[]
  wikiExcerpt?: string
  thumbnailUrl?: string
  perk: CompanionPerkDefinition
}

export interface SavedRomanceBond {
  characterName: string
  wikiTitle?: string
  affection: number
  relationship_tier: string
  is_married: boolean
  mood: string
  perkUnlocked: boolean
  perkTitle: string
  perkDescription: string
  loves: string[]
  likes: string[]
  dislikes: string[]
  personality?: string
  sourceArc: string
  updatedAt: number
}

export type WeaponType =
  | 'One-Handed Sword'
  | 'Rapier'
  | 'Dagger'
  | 'Katana'
  | 'Two-Handed Sword'
  | 'Spear / Halberd'
  | 'Gun & Photon Sword'
  | 'Mace / Hammer'

export type GeminiModel = string

export const PRESET_GEMINI_MODELS: {
  id: string
  label: string
  generation: 'Gemini 4' | 'Gemini 3' | 'Gemini 2.5'
  desc: string
}[] = [
  {
    id: 'gemini-4-hydrogen',
    label: 'Gemini 4 Hydrogen',
    generation: 'Gemini 4',
    desc: 'รุ่น 4 สมดุล รวดเร็ว คุ้มค่า เหมาะกับเล่น Roleplay ต่อเนื่อง',
  },
  {
    id: 'gemini-4-neon',
    label: 'Gemini 4 Neon',
    generation: 'Gemini 4',
    desc: 'รุ่น 4 ฉลาดและตอบสนองไว คุมคาแรกเตอร์และ JSON แม่นยำ',
  },
  {
    id: 'gemini-4-carbon',
    label: 'Gemini 4 Carbon',
    generation: 'Gemini 4',
    desc: 'รุ่น 4 เรือธงสูงสุด เหมาะกับบอสไฟต์ ฉากสำคัญ และ Lore ลึก',
  },
  {
    id: 'gemini-4-argon',
    label: 'Gemini 4 Argon',
    generation: 'Gemini 4',
    desc: 'รุ่น 4 สาย Reasoning ประหยัดและคิดเป็นเหตุเป็นผล',
  },
  {
    id: 'gemini-3.8-flash',
    label: 'Gemini 3.8 Flash',
    generation: 'Gemini 3',
    desc: 'รุ่น 3.8 ความเร็วสูงสำหรับเดินเรื่องทั่วไป',
  },
  {
    id: 'gemini-3.6-flash',
    label: 'Gemini 3.6 Flash',
    generation: 'Gemini 3',
    desc: 'รุ่น 3.6 เสถียร รวดเร็ว',
  },
  {
    id: 'gemini-3.5-flash',
    label: 'Gemini 3.5 Flash',
    generation: 'Gemini 3',
    desc: 'รุ่น 3.5 ประหยัดและตอบไว',
  },
  {
    id: 'gemini-3.5-flash-lite',
    label: 'Gemini 3.5 Flash-Lite',
    generation: 'Gemini 3',
    desc: 'รุ่น Lite โควตาสูงสุด เหมาะเวลาโมเดลอื่นเต็มหรือคนใช้เยอะ',
  },
  {
    id: 'gemini-flash-latest',
    label: 'Gemini Flash (Latest)',
    generation: 'Gemini 3',
    desc: 'ชี้ไปรุ่น Flash ล่าสุดอัตโนมัติ (แนะนำแทน 2.5)',
  },
  {
    id: 'gemini-2.5-flash',
    label: 'Gemini 2.5 Flash (Legacy)',
    generation: 'Gemini 2.5',
    desc: 'รุ่นเก่า (คีย์ใหม่อาจถูกปิดใช้งานแล้ว — แนะนำใช้ 3.5 Lite / 3.8)',
  },
  {
    id: 'gemini-2.5-pro',
    label: 'Gemini 2.5 Pro',
    generation: 'Gemini 2.5',
    desc: 'รุ่น 2.5 ภาษาสละสลวยและละเอียด',
  },
]

export interface PlayerProfile {
  name: string
  weapon: WeaponType
  startingArc: WorldArc
  storyMode: StoryMode
  avatarTitle?: string
  romanceTarget?: RomanceCharacterProfile | null
  preGameBonds?: SavedRomanceBond[]
}

export interface CharacterState {
  name: string
  affection: number
  affection_delta: string
  relationship_tier: string
  mood: string
  is_married: boolean
  can_propose: boolean
  in_party?: boolean
  last_seen_location?: string
}

export interface PlayerState {
  level: number
  hp: number
  max_hp: number
  col: number
  status_effects: string[]
  inventory_changes: string[]
  spouse: string | null
}

export interface ShopItem {
  name: string
  description: string
  price: number
  stock: number
  category?: 'consumable' | 'equipment' | 'material' | 'special'
}

export interface ShopState {
  shop_name: string
  shopkeeper?: string | null
  currency?: string
  items: ShopItem[]
}

export type StatKey = 'STR' | 'AGI' | 'INT' | 'VIT' | 'MND' | 'LUK'

export type CharacterAttributes = Record<StatKey, number>

export interface CharacterStatState {
  attributes: CharacterAttributes
  statPoints: number
  spentPoints: number
}

export interface DiceOption {
  id: string
  label: string
  approach_type?: 'combat' | 'think' | 'escape' | 'guard' | 'social'
  description: string
  required_stats: StatKey[]
  dc: number
  on_success: string
  on_fail: string
}

export interface DiceChallenge {
  title: string
  description: string
  required_stats: StatKey[]
  dc: number
  on_success: string
  on_fail: string
  options?: DiceOption[]
  default_option_id?: string
  source_action?: string
}

export interface WorldState {
  world_arc: string
  location: string
  in_game_date: string
  canon_divergence: string
  player: PlayerState
  characters_in_scene: CharacterState[]
  system_alerts: string[]
  marriage_event_triggered: boolean
  marriage_partner?: string | null
  scene_image_prompt?: string | null
  shop?: ShopState | null
  dice_challenge?: DiceChallenge | null
}

export interface EventCG {
  imageUrl: string
  caption: string
  characterName?: string
  eventType: 'marriage' | 'date' | 'walk' | 'cozy' | 'scene'
  modelUsed?: string
}

export interface InventoryItem {
  name: string
  quantity: number
  category?: 'consumable' | 'equipment' | 'material' | 'special'
  description?: string
}

export interface WikiLoreEntry {
  title: string
  summary: string
  url: string
  thumbnailUrl?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'model' | 'system'
  text: string
  rawText?: string
  timestamp: number
  choices?: string[]
  stateSnapshot?: WorldState
  modelUsed?: string
  eventImage?: EventCG
  wikiReferences?: WikiLoreEntry[]
}

export interface SystemAlertItem {
  id: string
  title: string
  message: string
  variant: 'info' | 'affection' | 'warning' | 'marriage'
}

export interface GameSession {
  id: string
  profile: PlayerProfile
  originRoute?: 'Aincrad (Floor 1)' | 'Progressive' | null
  arcHistory?: WorldArc[]
  romanceTarget?: RomanceCharacterProfile | null
  preGameBonds?: SavedRomanceBond[]
  characterStats?: CharacterStatState
  equippedItems?: string[]
  worldState: WorldState
  knownCharacters: Record<string, CharacterState>
  inventory: InventoryItem[]
  sharedInventory: InventoryItem[]
  sharedHome: string | null
  partyMembers: string[]
  butterflyEffects: string[]
  messages: ChatMessage[]
  updatedAt: number
}

export interface AppSettings {
  apiKey: string
  model: GeminiModel
  demoMode: boolean
  fastMode: boolean
  autoEventImages: boolean
  imageModel: string
  ostEnabled: boolean
  ostVolume: number
}

export interface SaveSlotMeta {
  slotId: string
  label: string
  session: GameSession
  savedAt: number
}
