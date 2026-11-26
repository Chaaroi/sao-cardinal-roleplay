import { findRomancePreset, resolveCompanionPerk } from '../data/romanceRoster'
import type { GameSession, SavedRomanceBond } from '../types/game'

const ROMANCE_BONDS_KEY = 'sao_cardinal_romance_bonds_v1'

export function loadSavedRomanceBonds(): SavedRomanceBond[] {
  try {
    const raw = localStorage.getItem(ROMANCE_BONDS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as SavedRomanceBond[]) : []
  } catch {
    return []
  }
}

function saveRomanceBonds(bonds: SavedRomanceBond[]): void {
  try {
    localStorage.setItem(ROMANCE_BONDS_KEY, JSON.stringify(bonds))
  } catch {
    // Ignore storage limits
  }
}

export function deleteSavedRomanceBond(characterName: string): SavedRomanceBond[] {
  const lower = characterName.trim().toLowerCase()
  const next = loadSavedRomanceBonds().filter(
    (b) => b.characterName.trim().toLowerCase() !== lower
  )
  saveRomanceBonds(next)
  return next
}

/**
 * Syncs Romance Mode relationships and any deep bonds (affection >= 250 or married)
 * from a GameSession into the cross-save Companion Bond registry.
 */
export function syncSessionBondsToStorage(session: GameSession): SavedRomanceBond[] {
  const existing = loadSavedRomanceBonds()
  const bondMap = new Map<string, SavedRomanceBond>()
  for (const b of existing) {
    bondMap.set(b.characterName.trim().toLowerCase(), b)
  }

  let changed = false
  const target = session.romanceTarget ?? session.profile.romanceTarget

  for (const char of Object.values(session.knownCharacters)) {
    const key = char.name.trim().toLowerCase()
    const isRomanceTarget =
      session.profile.storyMode === 'romance' &&
      target &&
      target.name.trim().toLowerCase() === key

    // Save if it's an active Romance Mode target OR a meaningful bond earned in any playthrough
    if (!isRomanceTarget && char.affection < 250 && !char.is_married) {
      continue
    }

    const resolvedPerk = resolveCompanionPerk(char, target)
    const preset = isRomanceTarget ? target : findRomancePreset(char.name)
    const prev = bondMap.get(key)

    // Keep highest progression if another save had an even deeper bond, unless Romance Mode actively updates
    const shouldOverwrite =
      !prev ||
      isRomanceTarget ||
      char.affection >= prev.affection ||
      (char.is_married && !prev.is_married)

    if (shouldOverwrite) {
      const nextBond: SavedRomanceBond = {
        characterName: char.name,
        wikiTitle: preset?.wikiTitle ?? prev?.wikiTitle,
        affection: Math.max(char.affection, prev?.affection ?? 0),
        relationship_tier: char.relationship_tier,
        is_married: char.is_married || Boolean(prev?.is_married),
        mood: char.mood,
        perkUnlocked:
          Boolean(resolvedPerk?.unlocked) || Boolean(prev?.perkUnlocked),
        perkTitle:
          resolvedPerk?.perk.title ??
          prev?.perkTitle ??
          `สายใยคู่หูพิเศษของ ${char.name}`,
        perkDescription:
          resolvedPerk?.perk.description ??
          prev?.perkDescription ??
          `ความสามารถช่วยเหลือเฉพาะตัวของ ${char.name} ตามเนื้อเรื่อง`,
        loves: preset?.loves ?? prev?.loves ?? [],
        likes: preset?.likes ?? prev?.likes ?? [],
        dislikes: preset?.dislikes ?? prev?.dislikes ?? [],
        personality: preset?.personality ?? prev?.personality,
        sourceArc:
          session.profile.storyMode === 'romance'
            ? 'Pre-Game Romance Mode'
            : session.worldState.world_arc,
        updatedAt: Date.now(),
      }
      bondMap.set(key, nextBond)
      changed = true
    }
  }

  const result = Array.from(bondMap.values()).sort((a, b) => {
    if (a.perkUnlocked !== b.perkUnlocked) return a.perkUnlocked ? -1 : 1
    return b.affection - a.affection
  })

  if (changed) {
    saveRomanceBonds(result)
  }
  return result
}
