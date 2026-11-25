import { resolveWikiTopic } from './wikiLoreService'

const PORTRAIT_CACHE_KEY = 'sao_character_portraits_v1'

/**
 * Verified AniList character portrait URLs mapped to SAO names and common aliases.
 */
const CANON_PORTRAITS: Record<string, string> = {
  asuna: 'https://s4.anilist.co/file/anilistcdn/character/medium/b36828-j5ib0adAzGMx.png',
  'asuna yuuki': 'https://s4.anilist.co/file/anilistcdn/character/medium/b36828-j5ib0adAzGMx.png',
  อาสึนะ: 'https://s4.anilist.co/file/anilistcdn/character/medium/b36828-j5ib0adAzGMx.png',

  kirito: 'https://s4.anilist.co/file/anilistcdn/character/medium/b36765-BnLbXg0Tzzh9.png',
  kazuto: 'https://s4.anilist.co/file/anilistcdn/character/medium/b36765-BnLbXg0Tzzh9.png',
  'kazuto kirigaya': 'https://s4.anilist.co/file/anilistcdn/character/medium/b36765-BnLbXg0Tzzh9.png',
  คิริโตะ: 'https://s4.anilist.co/file/anilistcdn/character/medium/b36765-BnLbXg0Tzzh9.png',

  sinon: 'https://s4.anilist.co/file/anilistcdn/character/medium/b55147-1fCU8lONEuZQ.png',
  'shino asada': 'https://s4.anilist.co/file/anilistcdn/character/medium/b55147-1fCU8lONEuZQ.png',
  ชินอน: 'https://s4.anilist.co/file/anilistcdn/character/medium/b55147-1fCU8lONEuZQ.png',

  alice: 'https://s4.anilist.co/file/anilistcdn/character/medium/b75450-vDO1lQup1pe7.jpg',
  'alice zuberg': 'https://s4.anilist.co/file/anilistcdn/character/medium/b75450-vDO1lQup1pe7.jpg',
  'alice synthesis thirty': 'https://s4.anilist.co/file/anilistcdn/character/medium/b75450-vDO1lQup1pe7.jpg',
  อลิซ: 'https://s4.anilist.co/file/anilistcdn/character/medium/b75450-vDO1lQup1pe7.jpg',

  eugeo: 'https://s4.anilist.co/file/anilistcdn/character/medium/b70899-TwMq5mtH5ifc.jpg',
  ยูจิโอ: 'https://s4.anilist.co/file/anilistcdn/character/medium/b70899-TwMq5mtH5ifc.jpg',

  yuuki: 'https://s4.anilist.co/file/anilistcdn/character/medium/b64523-LPeAiw8Yx517.jpg',
  'yuuki konno': 'https://s4.anilist.co/file/anilistcdn/character/medium/b64523-LPeAiw8Yx517.jpg',
  ยูกิ: 'https://s4.anilist.co/file/anilistcdn/character/medium/b64523-LPeAiw8Yx517.jpg',

  leafa: 'https://s4.anilist.co/file/anilistcdn/character/medium/b36831-JfyFU7gPPVmr.png',
  suguha: 'https://s4.anilist.co/file/anilistcdn/character/medium/b36831-JfyFU7gPPVmr.png',
  'suguha kirigaya': 'https://s4.anilist.co/file/anilistcdn/character/medium/b36831-JfyFU7gPPVmr.png',
  ลีฟา: 'https://s4.anilist.co/file/anilistcdn/character/medium/b36831-JfyFU7gPPVmr.png',

  lisbeth: 'https://s4.anilist.co/file/anilistcdn/character/medium/b43906-15QwTm2ZFDse.png',
  'rika shinozaki': 'https://s4.anilist.co/file/anilistcdn/character/medium/b43906-15QwTm2ZFDse.png',
  ริสเบธ: 'https://s4.anilist.co/file/anilistcdn/character/medium/b43906-15QwTm2ZFDse.png',

  silica: 'https://s4.anilist.co/file/anilistcdn/character/medium/b37681-GDtOAN6NiJ9M.jpg',
  'keiko ayano': 'https://s4.anilist.co/file/anilistcdn/character/medium/b37681-GDtOAN6NiJ9M.jpg',
  ซิลิก้า: 'https://s4.anilist.co/file/anilistcdn/character/medium/b37681-GDtOAN6NiJ9M.jpg',

  klein: 'https://s4.anilist.co/file/anilistcdn/character/medium/b36830-41SWIDvhqOo4.png',
  'ryoutarou tsuboi': 'https://s4.anilist.co/file/anilistcdn/character/medium/b36830-41SWIDvhqOo4.png',
  ไคลน์: 'https://s4.anilist.co/file/anilistcdn/character/medium/b36830-41SWIDvhqOo4.png',

  agil: 'https://s4.anilist.co/file/anilistcdn/character/medium/b54099-fOi8orxVTHt1.png',
  'andrew gilbert mills': 'https://s4.anilist.co/file/anilistcdn/character/medium/b54099-fOi8orxVTHt1.png',
  เอจิล: 'https://s4.anilist.co/file/anilistcdn/character/medium/b54099-fOi8orxVTHt1.png',

  sachi: 'https://s4.anilist.co/file/anilistcdn/character/medium/b54777-MduA5ck1lJUy.png',
  ซาจิ: 'https://s4.anilist.co/file/anilistcdn/character/medium/b54777-MduA5ck1lJUy.png',

  yui: 'https://s4.anilist.co/file/anilistcdn/character/medium/b43892-Ig6ZMdUbQDO2.jpg',
  ยุย: 'https://s4.anilist.co/file/anilistcdn/character/medium/b43892-Ig6ZMdUbQDO2.jpg',

  mito: 'https://s4.anilist.co/file/anilistcdn/character/medium/b215297-5UQC5tRR6bLK.png',
  'misumi tozawa': 'https://s4.anilist.co/file/anilistcdn/character/medium/b215297-5UQC5tRR6bLK.png',

  kayaba: 'https://s4.anilist.co/file/anilistcdn/character/medium/b36829-X5zITNEQ7xij.png',
  'akihiko kayaba': 'https://s4.anilist.co/file/anilistcdn/character/medium/b36829-X5zITNEQ7xij.png',
  heathcliff: 'https://s4.anilist.co/file/anilistcdn/character/medium/b36829-X5zITNEQ7xij.png',

  diavel: 'https://s4.anilist.co/file/anilistcdn/character/medium/b65169-1pgUxA6JjpeA.png',
  kibaou: 'https://s4.anilist.co/file/anilistcdn/character/medium/b65171-4gM7UgGDU6H5.png',
  poh: 'https://s4.anilist.co/file/anilistcdn/character/medium/b70683-5ATgLAHphZtc.jpg',
  'vassago casals': 'https://s4.anilist.co/file/anilistcdn/character/medium/b70683-5ATgLAHphZtc.jpg',
}

function loadPortraitCache(): Record<string, string> {
  try {
    const raw = localStorage.getItem(PORTRAIT_CACHE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, string>
  } catch {
    return {}
  }
}

export function savePortraitToCache(name: string, url: string): void {
  const key = normalizeCharKey(name)
  const cache = loadPortraitCache()
  cache[key] = url
  try {
    localStorage.setItem(PORTRAIT_CACHE_KEY, JSON.stringify(cache))
  } catch {
    // Ignore storage limit errors
  }
}

function normalizeCharKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s*\(.*?\)\s*/g, '').trim()
}

const inFlightLookups = new Map<string, Promise<string | null>>()

/**
 * Synchronously resolves cached or built-in SAO character portrait URL if known.
 */
export function getCachedPortraitUrl(name: string): string | null {
  const key = normalizeCharKey(name)
  if (!key) return null

  const cache = loadPortraitCache()
  if (cache[key]) return cache[key]

  if (CANON_PORTRAITS[key]) return CANON_PORTRAITS[key]

  // Fuzzy prefix/substring match against canon keys (e.g., "Asuna (Aincrad)" or "Sinon - GGO")
  for (const [canonKey, url] of Object.entries(CANON_PORTRAITS)) {
    if (key.includes(canonKey) || canonKey.includes(key)) {
      return url
    }
  }
  return null
}

/**
 * Looks up an unknown SAO character portrait from AniList GraphQL and caches it.
 */
export async function resolveCharacterPortrait(name: string): Promise<string | null> {
  const syncHit = getCachedPortraitUrl(name)
  if (syncHit) return syncHit

  const key = normalizeCharKey(name)
  if (!key) return null

  const existingPromise = inFlightLookups.get(key)
  if (existingPromise) return existingPromise

  const lookupPromise = (async () => {
    try {
      const query = `query ($search: String) {
        Character(search: $search) {
          name { full }
          image { medium large }
          media(perPage: 4, type: ANIME) {
            nodes { title { romaji english } }
          }
        }
      }`
      const res = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { search: key } }),
      })
      if (!res.ok) return null
      const json = (await res.json()) as {
        data?: {
          Character?: {
            image?: { medium?: string; large?: string }
            media?: { nodes?: { title?: { romaji?: string; english?: string } }[] }
          }
        }
      }
      const char = json.data?.Character
      const mediaTitles = (char?.media?.nodes ?? [])
        .map((m) => `${m.title?.romaji ?? ''} ${m.title?.english ?? ''}`.toLowerCase())
        .join(' ')

      // Only accept AniList hit if it is actually from Sword Art Online / Accel World
      if (char?.image?.medium && (mediaTitles.includes('sword art') || mediaTitles.includes('sao'))) {
        const url = char.image.medium
        savePortraitToCache(name, url)
        return url
      }

      // Fallback to Sword Art Online Fandom Wiki thumbnail (great for Gameverse / Progressive / Argo)
      const wikiEntry = await resolveWikiTopic(name)
      if (wikiEntry?.thumbnailUrl) {
        savePortraitToCache(name, wikiEntry.thumbnailUrl)
        return wikiEntry.thumbnailUrl
      }
      return null
    } catch {
      return null
    } finally {
      inFlightLookups.delete(key)
    }
  })()

  inFlightLookups.set(key, lookupPromise)
  return lookupPromise
}
