import type { GameSession, WikiLoreEntry } from '../types/game'

const WIKI_API = 'https://swordartonline.fandom.com/api.php'
const WIKI_CACHE_KEY = 'sao_fandom_wiki_cache_v3'

function toSafeThumbnailUrl(rawUrl?: string): string | undefined {
  if (!rawUrl) return undefined
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.endsWith('.vercel.app')) &&
    rawUrl.startsWith('https://static.wikia.nocookie.net')
  ) {
    return rawUrl.replace('https://static.wikia.nocookie.net', '/wikia-img')
  }
  return rawUrl
}

const THAI_TO_WIKI_QUERY: Record<string, string> = {
  อาสึนะ: 'Yuuki Asuna',
  คิริโตะ: 'Kirigaya Kazuto',
  ชินอน: 'Asada Shino',
  อลิซ: 'Alice Zuberg',
  ยูจิโอ: 'Eugeo',
  ยูกิ: 'Konno Yuuki',
  ลีฟา: 'Kirigaya Suguha',
  ริสเบธ: 'Shinozaki Rika',
  ซิลิก้า: 'Ayano Keiko',
  ไคลน์: 'Tsuboi Ryoutarou',
  เอจิล: 'Andrew Gilbert Mills',
  ซาจิ: 'Sachi',
  ยุย: 'Yui',
  อาร์โก: 'Argo',
  ฟีเลีย: 'Philia',
  สเตรีย: 'Strea',
  เรน: 'Rain',
  พรีเมียร์: 'Premiere',
  คุเรฮะ: 'Kureha',
  เมดิน่า: 'Medina Orthinanos',
  คายาบะ: 'Kayaba Akihiko',
  ฮีธคลิฟฟ์: 'Kayaba Akihiko',
  มิโตะ: 'Tozawa Misumi',
  เมืองเริ่มต้น: 'Town of Beginnings',
  ทอลบานา: 'Tolbana',
  หมู่บ้านรูลิด: 'Rulid Village',
  'ชั้น 1': '1st Floor (Aincrad)',
  'ชั้น 22': '22nd Floor (Aincrad)',
}

const INFOBOX_KEYS = new Set([
  'in-game name',
  'epithet',
  'weapon',
  'race',
  'guild',
  'affiliation',
  'type',
  'user',
  'floor',
  'location',
  'game',
  'age',
  'gender',
])

function loadWikiCache(): Record<string, WikiLoreEntry & { cachedAt: number }> {
  try {
    const raw = localStorage.getItem(WIKI_CACHE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as Record<string, WikiLoreEntry & { cachedAt: number }>
  } catch {
    return {}
  }
}

function saveWikiCache(cache: Record<string, WikiLoreEntry & { cachedAt: number }>): void {
  try {
    // Cap at 80 entries so localStorage stays compact
    const entries = Object.entries(cache)
    if (entries.length > 80) {
      entries.sort((a, b) => b[1].cachedAt - a[1].cachedAt)
      cache = Object.fromEntries(entries.slice(0, 80))
    }
    localStorage.setItem(WIKI_CACHE_KEY, JSON.stringify(cache))
  } catch {
    // Ignore storage limits
  }
}

/**
 * Strips MediaWiki markup and extracts clean Infobox facts + prose summary.
 */
export function cleanWikitextToSummary(wikitext: string): string {
  if (!wikitext) return ''

  // Extract key Infobox lines
  const infoFacts: string[] = []
  const lines = wikitext.split('\n')
  for (const line of lines) {
    const m = line.match(/^\|\s*([^=]+?)\s*=\s*(.+)$/)
    if (m) {
      const key = m[1].trim().toLowerCase()
      if (INFOBOX_KEYS.has(key)) {
        const cleanedVal = stripWikiMarkup(m[2]).trim()
        if (cleanedVal && !cleanedVal.startsWith('File:') && cleanedVal.length <= 100) {
          infoFacts.push(`${m[1].trim()}: ${cleanedVal}`)
        }
      }
    }
  }

  // Strip templates/infoboxes from top to get prose lead
  let prose = wikitext
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, '')
    .replace(/<ref[^>]*\/>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<tabber>[\s\S]*?<\/tabber>/gi, '')
    .replace(/\{\{Nihongo\|([^|}]+)(?:\|[^}]*)?\}\}/gi, '$1')

  // Iteratively strip remaining {{...}} blocks (non-nested inner first)
  for (let i = 0; i < 4; i++) {
    prose = prose.replace(/\{\{[^{}]*\}\}/g, '')
  }

  prose = stripWikiMarkup(prose)
    .replace(/\s+/g, ' ')
    .trim()

  const combined = [
    infoFacts.length > 0 ? `[${infoFacts.slice(0, 6).join(' | ')}]` : '',
    prose.slice(0, 440),
  ]
    .filter(Boolean)
    .join(' ')

  return combined.slice(0, 620).trim()
}

function stripWikiMarkup(text: string): string {
  return text
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, '')
    .replace(/<ref[^>]*\/>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[\[(?:File|Image):[^\]]+\]\]/gi, '')
    .replace(/\[\[[^|\]]+\|([^\]]+)\]\]/g, '$1')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/'''?/g, '')
    .replace(/\{\{Cite\}\}/gi, '')
    .replace(/\{\{[^{}]*\}\}/g, '')
    .replace(/\}\}|\{\{/g, '')
    .replace(/\*+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildWikiPageUrl(title: string): string {
  return `https://swordartonline.fandom.com/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`
}

async function fetchWithTimeout(url: string, timeoutMs = 2800): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Searches Sword Art Online Fandom Wiki and returns matching article summaries.
 */
export async function searchSaoWiki(query: string, limit = 5): Promise<WikiLoreEntry[]> {
  const trimmed = query.trim()
  if (!trimmed) return []

  const searchUrl = `${WIKI_API}?action=query&list=search&srsearch=${encodeURIComponent(
    trimmed
  )}&srlimit=${limit}&format=json&origin=*`

  const res = await fetchWithTimeout(searchUrl, 4500)
  if (!res.ok) return []

  const json = (await res.json()) as {
    query?: { search?: { title: string; snippet?: string }[] }
  }
  const titles = (json.query?.search ?? [])
    .map((s) => s.title)
    .filter((t) => !t.includes('/Image Gallery') && !t.includes('/Gallery'))

  if (titles.length === 0) return []
  return fetchWikiPagesByTitles(titles.slice(0, limit))
}

/**
 * Fetches exact Fandom Wiki pages (with caching) by title.
 */
export async function fetchWikiPagesByTitles(titles: string[]): Promise<WikiLoreEntry[]> {
  if (titles.length === 0) return []

  const cache = loadWikiCache()
  const results: WikiLoreEntry[] = []
  const missing: string[] = []

  for (const t of titles) {
    const key = t.trim().toLowerCase()
    const cached = cache[key]
    if (cached) {
      results.push({
        title: cached.title,
        summary: cached.summary,
        url: cached.url,
        thumbnailUrl: cached.thumbnailUrl,
      })
    } else {
      missing.push(t.trim())
    }
  }

  if (missing.length === 0) return results

  const joined = missing.slice(0, 4).join('|')
  const pageUrl = `${WIKI_API}?action=query&titles=${encodeURIComponent(
    joined
  )}&prop=revisions|pageimages&rvprop=content&rvslots=main&rvsection=0&pithumbsize=240&redirects=1&format=json&origin=*`

  const res = await fetchWithTimeout(pageUrl, 3200)
  if (!res.ok) return results

  const data = (await res.json()) as {
    query?: {
      pages?: Record<
        string,
        {
          missing?: boolean
          title?: string
          thumbnail?: { source?: string }
          revisions?: { slots?: { main?: { '*'?: string } } }[]
        }
      >
    }
  }

  const pages = Object.values(data.query?.pages ?? {})
  let cacheDirty = false

  for (const page of pages) {
    if (page.missing || !page.title) continue
    const rawWikitext = page.revisions?.[0]?.slots?.main?.['*'] ?? ''
    const summary = cleanWikitextToSummary(rawWikitext)
    if (!summary) continue

    const entry: WikiLoreEntry = {
      title: page.title,
      summary,
      url: buildWikiPageUrl(page.title),
      thumbnailUrl: toSafeThumbnailUrl(page.thumbnail?.source),
    }
    results.push(entry)
    cache[page.title.toLowerCase()] = { ...entry, cachedAt: Date.now() }
    cacheDirty = true
  }

  if (cacheDirty) {
    saveWikiCache(cache)
  }

  return results
}

/**
 * Resolves a single search query (via cache -> direct title -> Fandom search).
 */
export async function resolveWikiTopic(topic: string): Promise<WikiLoreEntry | null> {
  const clean = topic.trim()
  if (!clean) return null

  const cache = loadWikiCache()
  const key = clean.toLowerCase()
  if (cache[key]) return cache[key]

  const direct = await fetchWikiPagesByTitles([clean])
  if (direct.length > 0) {
    cache[key] = { ...direct[0], cachedAt: Date.now() }
    saveWikiCache(cache)
    return direct[0]
  }

  const searched = await searchSaoWiki(clean, 1)
  if (searched.length > 0) {
    cache[key] = { ...searched[0], cachedAt: Date.now() }
    saveWikiCache(cache)
    return searched[0]
  }

  return null
}

/**
 * Extracts up to 3 relevant Wiki topics from the current turn (characters, location, user text).
 */
export function extractWikiTopicsFromTurn(userText: string, session: GameSession): string[] {
  const topics = new Set<string>()
  const combined = `${userText} ${session.worldState.location} ${session.worldState.world_arc}`

  // 1. Characters currently in scene
  for (const ch of session.worldState.characters_in_scene.slice(0, 2)) {
    topics.add(ch.name)
  }

  // 2. Thai alias mapping
  for (const [thaiKey, wikiTitle] of Object.entries(THAI_TO_WIKI_QUERY)) {
    if (combined.includes(thaiKey)) {
      topics.add(wikiTitle)
    }
  }

  // 3. Floor detection (e.g. "Floor 1", "Floor 22")
  const floorMatch = combined.match(/Floor\s+(\d{1,3})/i)
  if (floorMatch) {
    const num = parseInt(floorMatch[1], 10)
    const suffix = num === 1 ? 'st' : num === 2 ? 'nd' : num === 3 ? 'rd' : 'th'
    topics.add(`${num}${suffix} Floor (Aincrad)`)
  }

  // 4. Known location terms
  if (/town of beginnings/i.test(combined)) topics.add('Town of Beginnings')
  else if (/tolbana/i.test(combined)) topics.add('Tolbana')
  else if (/rulid/i.test(combined)) topics.add('Rulid Village')
  else if (/glocken/i.test(combined)) topics.add('SBC Glocken')
  else if (/sylvein/i.test(combined)) topics.add('Sylvein')

  // 5. Capitalized English entities from user's prompt (e.g. "Elucidator", "Laughing Coffin")
  const engMatches = userText.match(/\b[A-Z][a-zA-Z]{2,}(?:\s+[A-Z][a-zA-Z]{2,})?\b/g) ?? []
  for (const term of engMatches) {
    if (!['SYSTEM', 'ACTION', 'Marriage', 'Proposal', 'Demo'].includes(term)) {
      topics.add(term)
    }
  }

  if (topics.size === 0 && session.worldState.world_arc) {
    topics.add(session.worldState.world_arc)
  }

  return Array.from(topics).slice(0, 3)
}

/**
 * Fetches live Fandom Wiki lore excerpts for the current turn within a strict time budget.
 */
export async function fetchRelevantWikiLore(
  userText: string,
  session: GameSession
): Promise<WikiLoreEntry[]> {
  const topics = extractWikiTopicsFromTurn(userText, session)
  if (topics.length === 0) return []

  try {
    const settled = await Promise.allSettled(topics.map((t) => resolveWikiTopic(t)))
    const deduped = new Map<string, WikiLoreEntry>()
    for (const r of settled) {
      if (r.status === 'fulfilled' && r.value) {
        deduped.set(r.value.title, r.value)
      }
    }
    return Array.from(deduped.values())
  } catch {
    return []
  }
}

export function formatWikiLoreForPrompt(entries: WikiLoreEntry[]): string {
  if (entries.length === 0) return ''
  const lines = entries.map((e) => `- **${e.title}**: ${e.summary}`)
  return `[SAO FANDOM WIKI REFERENCE - https://swordartonline.fandom.com]\n${lines.join('\n')}`
}
