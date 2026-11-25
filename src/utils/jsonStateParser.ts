import type {
  CharacterState,
  DiceChallenge,
  DiceOption,
  InventoryItem,
  ShopItem,
  ShopState,
  StatKey,
  WorldState,
} from '../types/game'

export interface ParsedAIResponse {
  narrative: string
  choices: string[]
  worldState: WorldState | null
  parseWarning?: string
}

/**
 * Normalizes minor JSON formatting flaws sometimes emitted by LLMs (e.g., trailing commas).
 */
function sanitizeJsonString(raw: string): string {
  return raw
    .trim()
    .replace(/,\s*([}\]])/g, '$1')
}

/**
 * Extracts suggested numbered or bulleted action choices at the end of the narrative.
 */
export function extractChoicesFromNarrative(narrative: string): string[] {
  const lines = narrative.split('\n')
  const choices: string[] = []

  // Scan from bottom up around the final choices section
  for (let i = Math.max(0, lines.length - 14); i < lines.length; i++) {
    const line = lines[i].trim()
    const match = line.match(/^(?:\d+[.)]|[-*•])\s+(?:\*\*)?(.+?)(?:\*\*)?$/)
    if (match && match[1]) {
      const cleaned = match[1].replace(/\*\*/g, '').trim()
      if (
        cleaned.length >= 4 &&
        cleaned.length <= 160 &&
        !cleaned.startsWith('หมายเหตุ') &&
        !cleaned.toLowerCase().includes('json_state')
      ) {
        choices.push(cleaned)
      }
    }
  }

  return choices.slice(0, 4)
}

function normalizeCharacter(raw: Partial<CharacterState>): CharacterState {
  const affection = typeof raw.affection === 'number' ? Math.max(-100, Math.min(1000, raw.affection)) : 0
  const isMarried = Boolean(raw.is_married)
  return {
    name: String(raw.name ?? 'Unknown NPC'),
    affection,
    affection_delta: String(raw.affection_delta ?? '0'),
    relationship_tier: String(raw.relationship_tier ?? inferTierFromAffection(affection, isMarried)),
    mood: String(raw.mood ?? 'Neutral'),
    is_married: isMarried,
    can_propose: typeof raw.can_propose === 'boolean' ? raw.can_propose : affection >= 900 && !isMarried,
    in_party: raw.in_party,
  }
}

export function inferTierFromAffection(affection: number, isMarried = false): string {
  if (isMarried) return 'Married'
  if (affection < 0) return 'Hostile / Rival'
  if (affection < 100) return 'Stranger / Acquaintance'
  if (affection < 250) return 'Friend'
  if (affection < 500) return 'Close Friend'
  if (affection < 700) return 'Romantic Interest'
  if (affection < 900) return 'Lover'
  return 'Ready for Marriage'
}

/**
 * Strips any complete or partial ```json_state / ```json block from streaming text
 * so the user only sees clean Light Novel prose while tokens arrive.
 */
export function stripStreamingJsonBlock(partial: string): string {
  const idx = partial.search(/```(?:json_state|json)/i)
  if (idx !== -1) {
    return partial.slice(0, idx).trimEnd()
  }
  return partial
}

function normalizeShop(raw: unknown): ShopState | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Partial<ShopState>
  if (!Array.isArray(r.items) || r.items.length === 0) return null

  const items: ShopItem[] = (r.items as Partial<ShopItem>[])
    .filter((it): it is Partial<ShopItem> => Boolean(it && typeof it === 'object' && it.name))
    .map((it) => {
      const cat = it.category
      const validCat: InventoryItem['category'] =
        cat === 'consumable' || cat === 'equipment' || cat === 'material' || cat === 'special'
          ? cat
          : inferItemCategory(String(it.name))
      return {
        name: String(it.name),
        description: String(it.description ?? 'ไอเทมวางจำหน่ายในร้านค้า'),
        price: typeof it.price === 'number' && it.price >= 0 ? Math.round(it.price) : 100,
        stock: typeof it.stock === 'number' && it.stock >= 0 ? Math.round(it.stock) : 5,
        category: validCat,
      }
    })

  if (items.length === 0) return null

  return {
    shop_name: String(r.shop_name ?? 'SAO Merchant Shop'),
    shopkeeper: r.shopkeeper ? String(r.shopkeeper) : null,
    currency: String(r.currency ?? 'Col'),
    items,
  }
}

const VALID_STAT_KEYS = new Set<StatKey>(['STR', 'AGI', 'INT', 'VIT', 'MND', 'LUK'])

function normalizeDiceOption(raw: unknown, idx: number): DiceOption | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Partial<DiceOption>
  if (!r.label || !r.on_success || !r.on_fail) return null
  const reqStats = Array.isArray(r.required_stats)
    ? r.required_stats
        .map((s) => String(s).toUpperCase() as StatKey)
        .filter((s) => VALID_STAT_KEYS.has(s))
    : []

  return {
    id: String(r.id ?? `opt-${idx}`),
    label: String(r.label),
    approach_type: r.approach_type,
    description: String(r.description ?? ''),
    required_stats: reqStats.length > 0 ? reqStats : ['STR', 'AGI'],
    dc: typeof r.dc === 'number' && r.dc >= 5 && r.dc <= 30 ? Math.round(r.dc) : 12,
    on_success: String(r.on_success),
    on_fail: String(r.on_fail),
  }
}

function normalizeDiceChallenge(raw: unknown): DiceChallenge | null {
  if (!raw || typeof raw !== 'object') return null
  const r = raw as Partial<DiceChallenge>

  const parsedOptions = Array.isArray(r.options)
    ? r.options.map((opt, idx) => normalizeDiceOption(opt, idx)).filter((o): o is DiceOption => Boolean(o))
    : []

  const fallbackFirst = parsedOptions[0]
  const title = r.title ?? fallbackFirst?.label
  const onSuccess = r.on_success ?? fallbackFirst?.on_success
  const onFail = r.on_fail ?? fallbackFirst?.on_fail
  if (!title || !onSuccess || !onFail) return null

  const reqStats = Array.isArray(r.required_stats)
    ? r.required_stats
        .map((s) => String(s).toUpperCase() as StatKey)
        .filter((s) => VALID_STAT_KEYS.has(s))
    : fallbackFirst?.required_stats ?? []

  return {
    title: String(title),
    description: String(r.description ?? 'เลือกแนวทางและทอยลูกเต๋าเพื่อตัดสินผลลัพธ์'),
    required_stats: reqStats.length > 0 ? reqStats : ['STR', 'AGI'],
    dc:
      typeof r.dc === 'number' && r.dc >= 5 && r.dc <= 30
        ? Math.round(r.dc)
        : fallbackFirst?.dc ?? 12,
    on_success: String(onSuccess),
    on_fail: String(onFail),
    options: parsedOptions.length > 0 ? parsedOptions : undefined,
    default_option_id: r.default_option_id ? String(r.default_option_id) : fallbackFirst?.id,
    source_action: r.source_action ? String(r.source_action) : undefined,
  }
}

export function parseCardinalResponse(rawResponse: string, fallbackState: WorldState): ParsedAIResponse {
  // Primary match: ```json_state ... ```
  const primaryRegex = /```json_state\s*([\s\S]*?)```/i
  // Fallback match: ```json ... ``` at the end of response
  const fallbackRegex = /```json\s*([\s\S]*?)```/i

  let match = rawResponse.match(primaryRegex)
  let matchedBlock = match?.[0] ?? ''
  let jsonCandidate = match?.[1] ?? ''

  if (!match) {
    const allJsonMatches = [...rawResponse.matchAll(new RegExp(fallbackRegex.source, 'gi'))]
    if (allJsonMatches.length > 0) {
      const last = allJsonMatches[allJsonMatches.length - 1]
      matchedBlock = last[0]
      jsonCandidate = last[1]
    }
  }

  // Strip the JSON block from the visible story narrative
  let narrative = rawResponse
  if (matchedBlock) {
    narrative = rawResponse.replace(matchedBlock, '').trim()
  } else {
    // Also check if there is an unclosed ```json_state block
    const unclosedIdx = rawResponse.search(/```json_state/i)
    if (unclosedIdx !== -1) {
      jsonCandidate = rawResponse.slice(unclosedIdx).replace(/```json_state/i, '').replace(/```$/, '').trim()
      narrative = rawResponse.slice(0, unclosedIdx).trim()
    }
  }

  let parsedState: WorldState | null = null
  let parseWarning: string | undefined

  if (jsonCandidate) {
    try {
      const parsed = JSON.parse(sanitizeJsonString(jsonCandidate)) as Partial<WorldState>
      const rawPlayer = parsed.player ?? fallbackState.player
      const maxHp = typeof rawPlayer.max_hp === 'number' && rawPlayer.max_hp > 0 ? rawPlayer.max_hp : fallbackState.player.max_hp
      const hp = typeof rawPlayer.hp === 'number' ? Math.max(0, Math.min(maxHp, rawPlayer.hp)) : fallbackState.player.hp

      const characters = Array.isArray(parsed.characters_in_scene)
        ? parsed.characters_in_scene.map((c) => normalizeCharacter(c))
        : []

      const marriedChar = characters.find((c) => c.is_married)
      const spouseName = rawPlayer.spouse ?? (marriedChar ? marriedChar.name : fallbackState.player.spouse)

      parsedState = {
        world_arc: String(parsed.world_arc ?? fallbackState.world_arc),
        location: String(parsed.location ?? fallbackState.location),
        in_game_date: String(parsed.in_game_date ?? fallbackState.in_game_date),
        canon_divergence: String(parsed.canon_divergence ?? fallbackState.canon_divergence),
        player: {
          level: typeof rawPlayer.level === 'number' ? rawPlayer.level : fallbackState.player.level,
          hp,
          max_hp: maxHp,
          col: typeof rawPlayer.col === 'number' ? Math.max(0, rawPlayer.col) : fallbackState.player.col,
          status_effects: Array.isArray(rawPlayer.status_effects) ? rawPlayer.status_effects.map(String) : [],
          inventory_changes: Array.isArray(rawPlayer.inventory_changes) ? rawPlayer.inventory_changes.map(String) : [],
          spouse: spouseName ?? null,
        },
        characters_in_scene: characters,
        system_alerts: Array.isArray(parsed.system_alerts) ? parsed.system_alerts.map(String) : [],
        marriage_event_triggered: Boolean(parsed.marriage_event_triggered),
        marriage_partner: parsed.marriage_partner ?? (marriedChar ? marriedChar.name : spouseName ?? null),
        scene_image_prompt:
          typeof parsed.scene_image_prompt === 'string' && parsed.scene_image_prompt.trim()
            ? parsed.scene_image_prompt.trim()
            : null,
        shop: normalizeShop(parsed.shop),
        dice_challenge: normalizeDiceChallenge(parsed.dice_challenge),
      }
    } catch (err) {
      parseWarning = err instanceof Error ? err.message : 'JSON parse error'
    }
  } else {
    parseWarning = 'ไม่พบ json_state จากคำตอบของ AI (ใช้ค่าสถานะล่าสุดแทน)'
  }

  const choices = extractChoicesFromNarrative(narrative)
  return {
    narrative,
    choices,
    worldState: parsedState,
    parseWarning,
  }
}

/**
 * Applies "+1 Bread" or "-2 Potion" deltas to persistent inventory array.
 */
export function applyInventoryChanges(
  current: InventoryItem[],
  changes: string[]
): InventoryItem[] {
  if (!changes || changes.length === 0) return current
  const map = new Map<string, InventoryItem>()
  for (const item of current) {
    map.set(item.name.toLowerCase(), { ...item })
  }

  for (const entry of changes) {
    const trimmed = entry.trim()
    if (!trimmed) continue
    const match = trimmed.match(/^([+-])\s*(\d+)?\s*(.+)$/)
    if (match) {
      const sign = match[1]
      const qty = match[2] ? parseInt(match[2], 10) : 1
      const itemName = match[3].trim()
      const key = itemName.toLowerCase()
      const existing = map.get(key)
      if (sign === '+') {
        if (existing) {
          existing.quantity += qty
        } else {
          map.set(key, { name: itemName, quantity: qty, category: inferItemCategory(itemName) })
        }
      } else if (existing) {
        existing.quantity -= qty
        if (existing.quantity <= 0) {
          map.delete(key)
        }
      }
    } else {
      const key = trimmed.toLowerCase()
      const existing = map.get(key)
      if (existing) {
        existing.quantity += 1
      } else {
        map.set(key, { name: trimmed, quantity: 1, category: inferItemCategory(trimmed) })
      }
    }
  }

  return Array.from(map.values())
}

function inferItemCategory(name: string): InventoryItem['category'] {
  const lower = name.toLowerCase()
  if (lower.includes('potion') || lower.includes('bread') || lower.includes('crystal') || lower.includes('ragout') || lower.includes('sandwich')) {
    return 'consumable'
  }
  if (lower.includes('sword') || lower.includes('rapier') || lower.includes('coat') || lower.includes('ring') || lower.includes('blade') || lower.includes('dagger') || lower.includes('gun')) {
    return 'equipment'
  }
  if (lower.includes('ingot') || lower.includes('ore') || lower.includes('leather') || lower.includes('fang')) {
    return 'material'
  }
  return 'special'
}

export function mergeKnownCharacters(
  existing: Record<string, CharacterState>,
  sceneChars: CharacterState[],
  currentLocation: string
): Record<string, CharacterState> {
  const next = { ...existing }
  for (const char of sceneChars) {
    const prev = next[char.name]
    next[char.name] = {
      ...prev,
      ...char,
      in_party: char.in_party ?? prev?.in_party ?? false,
      last_seen_location: currentLocation,
    }
  }
  return next
}
