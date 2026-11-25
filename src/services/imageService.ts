import { GoogleGenAI } from '@google/genai'
import type { CharacterState, EventCG, WorldState } from '../types/game'

export interface GenerateCGOptions {
  apiKey: string
  imageModelSetting: string
  worldState: WorldState
  userText: string
  narrative: string
  eventType: EventCG['eventType']
  demoMode?: boolean
  force?: boolean
}

const DEFAULT_IMAGE_MODELS = [
  'gemini-2.5-flash-image',
  'gemini-3-pro-image',
  'gemini-2.0-flash-exp-image-generation',
]

// Remember within the browser session if Gemini image models returned Free Tier limit: 0
let geminiImageQuotaBlocked = false

/**
 * Decides whether a turn should randomly or deterministically trigger a Character Event CG.
 */
export function evaluateEventCGTrigger(
  userText: string,
  narrative: string,
  worldState: WorldState
): { shouldTrigger: boolean; eventType: EventCG['eventType'] } {
  if (worldState.marriage_event_triggered) {
    return { shouldTrigger: true, eventType: 'marriage' }
  }

  const combined = `${userText} ${narrative}`.toLowerCase()
  const hasCharacter =
    worldState.characters_in_scene.length > 0 || Boolean(worldState.player.spouse)

  if (!hasCharacter) {
    return { shouldTrigger: false, eventType: 'scene' }
  }

  if (combined.includes('แต่งงาน') || combined.includes('propose') || combined.includes('marriage')) {
    return { shouldTrigger: true, eventType: 'marriage' }
  }

  const isDate =
    combined.includes('เดต') ||
    combined.includes('date') ||
    combined.includes('ของขวัญ') ||
    combined.includes('สารภาพ')
  const isWalk =
    combined.includes('เดินเล่น') ||
    combined.includes('เดินชม') ||
    combined.includes('walk') ||
    combined.includes('stroll')
  const isCozy =
    combined.includes('อยู่ด้วยกัน') ||
    combined.includes('พักผ่อน') ||
    combined.includes('กระท่อม') ||
    combined.includes('cabin') ||
    combined.includes('ทำอาหาร') ||
    combined.includes('สองต่อสอง')

  if (worldState.scene_image_prompt) {
    const eventType: EventCG['eventType'] = isDate
      ? 'date'
      : isWalk
        ? 'walk'
        : isCozy
          ? 'cozy'
          : 'scene'
    return { shouldTrigger: true, eventType }
  }

  if (isDate) {
    return { shouldTrigger: Math.random() < 0.55, eventType: 'date' }
  }
  if (isWalk) {
    return { shouldTrigger: Math.random() < 0.45, eventType: 'walk' }
  }
  if (isCozy) {
    return { shouldTrigger: Math.random() < 0.45, eventType: 'cozy' }
  }

  return { shouldTrigger: Math.random() < 0.16, eventType: 'scene' }
}

function getFocusCharacter(worldState: WorldState): CharacterState | null {
  if (worldState.characters_in_scene.length > 0) {
    return worldState.characters_in_scene[0]
  }
  if (worldState.player.spouse) {
    return {
      name: worldState.player.spouse,
      affection: 950,
      affection_delta: '0',
      relationship_tier: 'Married',
      mood: 'Affectionate',
      is_married: true,
      can_propose: false,
    }
  }
  return null
}

function buildCGPrompt(
  worldState: WorldState,
  eventType: EventCG['eventType'],
  focusChar: CharacterState | null
): string {
  const charName = focusChar?.name ?? 'Sword Art Online heroine'
  const mood = focusChar?.mood ?? 'Warm smile'
  const location = worldState.location
  const arc = worldState.world_arc

  if (worldState.scene_image_prompt) {
    return `2D Japanese anime key visual illustration, Sword Art Online A-1 Pictures anime art style, cel shading, expressive anime eyes, vibrant lighting, detailed fantasy background, not photorealistic: ${worldState.scene_image_prompt}. Setting: ${arc}, ${location}`
  }

  const momentDesc =
    eventType === 'marriage'
      ? `romantic virtual marriage proposal scene with glowing golden ring light, ${charName} blushing joyfully with tears of happiness, warm sunset glow`
      : eventType === 'date'
        ? `romantic date scene, ${charName} smiling warmly looking at viewer, soft golden hour lighting`
        : eventType === 'walk'
          ? `peaceful stroll side by side, ${charName} turning back with gentle smile in ${location}, breeze blowing through hair`
          : eventType === 'cozy'
            ? `relaxing moment spending time together indoors or lakeside cabin, ${charName} with ${mood} expression`
            : `memorable character spotlight scene featuring ${charName} with ${mood} expression in ${location}`

  return `2D Japanese anime key visual illustration, Sword Art Online A-1 Pictures anime art style, crisp anime lineart, cel shading, expressive eyes, not photorealistic: ${charName} from ${arc}, ${momentDesc}, location ${location}`
}

async function discoverImageModels(apiKey: string): Promise<string[]> {
  const ai = new GoogleGenAI({ apiKey: apiKey.trim() })
  const found: string[] = []
  try {
    const pager = await ai.models.list({ config: { pageSize: 100 } })
    for await (const m of pager) {
      const id = (m.name ?? '').replace(/^models\//, '')
      if (!id) continue
      const lower = id.toLowerCase()
      if (lower.includes('image') || lower.startsWith('imagen-')) {
        found.push(id)
      }
    }
  } catch {
    // Fallback to defaults if list fails
  }
  return Array.from(new Set([...found, ...DEFAULT_IMAGE_MODELS]))
}

/**
 * Compresses an image data URL or CORS-accessible URL via canvas to keep localStorage lightweight (~45-70KB).
 */
async function compressImageToDataUrl(sourceUrl: string, maxWidth = 768): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const scale = Math.min(1, maxWidth / img.width)
        const w = Math.round(img.width * scale)
        const h = Math.round(img.height * scale)
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(sourceUrl)
          return
        }
        ctx.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.8))
      } catch {
        resolve(sourceUrl)
      }
    }
    img.onerror = () => resolve(sourceUrl)
    img.src = sourceUrl
  })
}

/**
 * Parses Gradio SSE stream response from /gradio_api/call/{endpoint}/{eventId}
 */
function extractGradioResultUrl(sseText: string): string | null {
  const lines = sseText.split('\n')
  let isComplete = false
  for (const line of lines) {
    if (line.startsWith('event:')) {
      isComplete = line.slice(6).trim() === 'complete'
    } else if (isComplete && line.startsWith('data:')) {
      try {
        const payload = JSON.parse(line.slice(5).trim()) as Array<{ url?: string } | unknown>
        const first = payload?.[0]
        if (first && typeof first === 'object' && 'url' in first && typeof first.url === 'string') {
          return first.url
        }
      } catch {
        // Ignore parse failure
      }
    }
  }
  return null
}

/**
 * Fast free generation via Stability SD 3.5 Large Turbo HF Space (~4-5 seconds, no key).
 */
async function generateViaSD35Turbo(prompt: string): Promise<{ imageUrl: string; modelUsed: string }> {
  const base = 'https://stabilityai-stable-diffusion-3-5-large-turbo.hf.space'
  const submitRes = await fetch(`${base}/gradio_api/call/infer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: [
        prompt,
        'photorealistic, 3d render, nsfw, nude, blurry, deformed, extra limbs, text, watermark',
        0,
        true,
        896,
        512,
        0,
        4,
      ],
    }),
  })
  if (!submitRes.ok) {
    throw new Error(`SD 3.5 Turbo submit failed (${submitRes.status})`)
  }
  const sub = (await submitRes.json()) as { event_id?: string }
  if (!sub.event_id) {
    throw new Error('SD 3.5 Turbo did not return event_id')
  }

  const sseRes = await fetch(`${base}/gradio_api/call/infer/${sub.event_id}`)
  if (!sseRes.ok) {
    throw new Error(`SD 3.5 Turbo stream failed (${sseRes.status})`)
  }
  const sseText = await sseRes.text()
  const rawUrl = extractGradioResultUrl(sseText)
  if (!rawUrl) {
    throw new Error('SD 3.5 Turbo Busy / Quota reached')
  }
  const compressed = await compressImageToDataUrl(rawUrl)
  return { imageUrl: compressed, modelUsed: 'sd-3.5-large-turbo (free)' }
}

/**
 * Fast free generation via FLUX.1 Merged HF Space (~7 seconds, no key).
 */
async function generateViaFluxMerged(prompt: string): Promise<{ imageUrl: string; modelUsed: string }> {
  const base = 'https://multimodalart-flux-1-merged.hf.space'
  const submitRes = await fetch(`${base}/gradio_api/call/infer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: [prompt, 0, true, 896, 512, 3.5, 8],
    }),
  })
  if (!submitRes.ok) {
    throw new Error(`FLUX.1 Merged submit failed (${submitRes.status})`)
  }
  const sub = (await submitRes.json()) as { event_id?: string }
  if (!sub.event_id) {
    throw new Error('FLUX.1 Merged did not return event_id')
  }

  const sseRes = await fetch(`${base}/gradio_api/call/infer/${sub.event_id}`)
  if (!sseRes.ok) {
    throw new Error(`FLUX.1 Merged stream failed (${sseRes.status})`)
  }
  const sseText = await sseRes.text()
  const rawUrl = extractGradioResultUrl(sseText)
  if (!rawUrl) {
    throw new Error('FLUX.1 Merged Busy / Quota reached')
  }
  const compressed = await compressImageToDataUrl(rawUrl)
  return { imageUrl: compressed, modelUsed: 'flux-1-merged (free)' }
}

/**
 * Queries AI Horde for currently online models with lowest queue/ETA, preferring anime models.
 */
async function pickFastAIHordeModels(): Promise<string[]> {
  const fallback = ['Animagine XL', 'Nova Flat XL', 'Counterfeit', 'Anything v5', '526Mix-Animated']
  try {
    const r = await fetch('https://aihorde.net/api/v2/status/models?type=image')
    if (!r.ok) return fallback
    const all = (await r.json()) as { name: string; count: number; eta: number; queued: number }[]
    const clean = all.filter(
      (m) =>
        m.count > 0 &&
        !/inpaint|nsfw|hentai|porn|furry|yiff|pixel|icon|mtg/i.test(m.name)
    )
    const animePriority = (name: string) =>
      /anime|animagine|flat|anything|meina|counterfeit|526mix|cetus|acertain|pastel/i.test(name)
        ? 0
        : 1
    clean.sort((a, b) => {
      if (a.eta !== b.eta) return a.eta - b.eta
      if (animePriority(a.name) !== animePriority(b.name)) {
        return animePriority(a.name) - animePriority(b.name)
      }
      return a.queued - b.queued
    })
    const picked = clean.slice(0, 10).map((m) => m.name)
    return picked.length > 0 ? picked : fallback
  } catch {
    return fallback
  }
}

/**
 * Crowdsourced fallback image generation via AI Horde (dynamic low-queue models).
 */
async function generateViaAIHorde(prompt: string): Promise<{ imageUrl: string; modelUsed: string }> {
  const models = await pickFastAIHordeModels()
  const submitRes = await fetch('https://aihorde.net/api/v2/generate/async', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: '0000000000',
      'Client-Agent': 'SAO-Cardinal-RP:1.0:browser',
    },
    body: JSON.stringify({
      prompt: `${prompt} ### nsfw, nude, explicit, lowres, bad anatomy, extra limbs, text, watermark, signature`,
      params: {
        width: 576,
        height: 320,
        steps: 18,
        cfg_scale: 7,
        sampler_name: 'k_euler_a',
        n: 1,
      },
      nsfw: false,
      censor_nsfw: true,
      models,
    }),
  })

  if (!submitRes.ok) {
    throw new Error(`AI Horde submit failed (${submitRes.status})`)
  }

  const submitted = (await submitRes.json()) as { id?: string }
  if (!submitted.id) {
    throw new Error('AI Horde did not return a job ID')
  }

  for (let i = 0; i < 14; i++) {
    await new Promise((r) => setTimeout(r, 2500))
    const checkRes = await fetch(`https://aihorde.net/api/v2/generate/check/${submitted.id}`)
    if (!checkRes.ok) continue
    const check = (await checkRes.json()) as { done?: boolean; faulted?: boolean }
    if (check.faulted) {
      throw new Error('AI Horde worker faulted')
    }
    if (check.done) {
      const statusRes = await fetch(`https://aihorde.net/api/v2/generate/status/${submitted.id}`)
      const status = (await statusRes.json()) as {
        generations?: { img?: string; model?: string }[]
      }
      const gen = status.generations?.[0]
      if (gen?.img) {
        const compressed = await compressImageToDataUrl(gen.img)
        return {
          imageUrl: compressed,
          modelUsed: `aihorde:${gen.model || 'anime'}`,
        }
      }
      break
    }
  }

  throw new Error('AI Horde คิวเต็มชั่วคราว ลองเปลี่ยนเป็น SD 3.5 Turbo หรือ FLUX.1 ใน Settings')
}

async function generateViaFreeFastPipeline(prompt: string): Promise<{ imageUrl: string; modelUsed: string }> {
  try {
    return await generateViaSD35Turbo(prompt)
  } catch {
    try {
      return await generateViaFluxMerged(prompt)
    } catch {
      return await generateViaAIHorde(prompt)
    }
  }
}

function renderDemoCGCard(
  charName: string,
  location: string,
  mood: string,
  eventType: EventCG['eventType']
): string {
  const canvas = document.createElement('canvas')
  canvas.width = 768
  canvas.height = 432
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''

  const grad = ctx.createLinearGradient(0, 0, 768, 432)
  if (eventType === 'marriage') {
    grad.addColorStop(0, '#1e1b4b')
    grad.addColorStop(0.5, '#78350f')
    grad.addColorStop(1, '#0f172a')
  } else if (eventType === 'date' || eventType === 'cozy') {
    grad.addColorStop(0, '#31102f')
    grad.addColorStop(0.55, '#0c4a6e')
    grad.addColorStop(1, '#08101c')
  } else {
    grad.addColorStop(0, '#082f49')
    grad.addColorStop(0.6, '#0f172a')
    grad.addColorStop(1, '#020617')
  }
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, 768, 432)

  ctx.strokeStyle = eventType === 'marriage' ? 'rgba(251, 191, 36, 0.35)' : 'rgba(56, 189, 248, 0.3)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(384, 210, 145, 0, Math.PI * 2)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(384, 210, 110, 0, Math.PI * 2)
  ctx.stroke()

  ctx.fillStyle = eventType === 'marriage' ? 'rgba(251, 191, 36, 0.16)' : 'rgba(56, 189, 248, 0.14)'
  ctx.beginPath()
  ctx.arc(384, 200, 78, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#e0f2fe'
  ctx.font = 'bold 14px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(
    eventType === 'marriage'
      ? 'SAO EVENT CG // MARRIAGE PROPOSAL'
      : `SAO EVENT CG // ${eventType.toUpperCase()}`,
    384,
    72
  )

  ctx.fillStyle = eventType === 'marriage' ? '#fde68a' : '#7dd3fc'
  ctx.font = 'bold 40px sans-serif'
  ctx.fillText(charName, 384, 205)

  ctx.fillStyle = '#cbd5e1'
  ctx.font = '18px sans-serif'
  ctx.fillText(`Mood: ${mood}`, 384, 248)

  ctx.fillStyle = 'rgba(15, 23, 42, 0.78)'
  ctx.fillRect(48, 336, 672, 58)
  ctx.strokeStyle = 'rgba(186, 230, 253, 0.45)'
  ctx.strokeRect(48, 336, 672, 58)

  ctx.fillStyle = '#e0f2fe'
  ctx.font = '15px sans-serif'
  ctx.fillText(`Demo Mode CG Preview — ${location}`, 384, 370)

  return canvas.toDataURL('image/jpeg', 0.85)
}

export async function generateEventCGImage(options: GenerateCGOptions): Promise<EventCG> {
  const { apiKey, imageModelSetting, worldState, eventType, demoMode = false } = options
  const focusChar = getFocusCharacter(worldState)
  const charName = focusChar?.name ?? 'SAO Partner'
  const mood = focusChar?.mood ?? 'Happy'

  const captionMap: Record<EventCG['eventType'], string> = {
    marriage: `ช่วงเวลาขอแต่งงานกับ ${charName}`,
    date: `ช่วงเวลาออกเดตกับ ${charName}`,
    walk: `เดินเล่นเคียงข้าง ${charName}`,
    cozy: `ช่วงเวลาพิเศษกับ ${charName}`,
    scene: `ภาพเหตุการณ์ของ ${charName}`,
  }

  if (demoMode) {
    const demoUrl = renderDemoCGCard(charName, worldState.location, mood, eventType)
    return {
      imageUrl: demoUrl,
      caption: captionMap[eventType],
      characterName: charName,
      eventType,
      modelUsed: 'demo-cg-preview',
    }
  }

  const prompt = buildCGPrompt(worldState, eventType, focusChar)

  if (imageModelSetting === 'hf-sd35-turbo') {
    const res = await generateViaSD35Turbo(prompt)
    return { ...res, caption: captionMap[eventType], characterName: charName, eventType }
  }

  if (imageModelSetting === 'hf-flux-merged') {
    const res = await generateViaFluxMerged(prompt)
    return { ...res, caption: captionMap[eventType], characterName: charName, eventType }
  }

  if (imageModelSetting === 'aihorde-anime') {
    const res = await generateViaAIHorde(prompt)
    return { ...res, caption: captionMap[eventType], characterName: charName, eventType }
  }

  if (imageModelSetting === 'auto' && geminiImageQuotaBlocked) {
    const res = await generateViaFreeFastPipeline(prompt)
    return { ...res, caption: captionMap[eventType], characterName: charName, eventType }
  }

  // Try Gemini Image API first if API Key is provided
  if (apiKey.trim()) {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() })
    const candidates =
      imageModelSetting && imageModelSetting !== 'auto'
        ? [imageModelSetting, ...(await discoverImageModels(apiKey)).filter((m) => m !== imageModelSetting)]
        : await discoverImageModels(apiKey)

    let sawFreeTierZero = false

    for (const modelId of candidates.slice(0, 3)) {
      try {
        if (modelId.toLowerCase().startsWith('imagen-')) {
          const res = await ai.models.generateImages({
            model: modelId,
            prompt,
            config: { numberOfImages: 1, aspectRatio: '16:9' },
          })
          const bytes = res.generatedImages?.[0]?.image?.imageBytes
          if (bytes) {
            const compressed = await compressImageToDataUrl(`data:image/png;base64,${bytes}`)
            return {
              imageUrl: compressed,
              caption: captionMap[eventType],
              characterName: charName,
              eventType,
              modelUsed: modelId,
            }
          }
        } else {
          const res = await ai.models.generateContent({
            model: modelId,
            contents: [{ text: prompt }],
            config: {
              responseModalities: ['TEXT', 'IMAGE'],
              imageConfig: { aspectRatio: '16:9' },
            },
          })

          const parts = res.candidates?.[0]?.content?.parts ?? []
          for (const part of parts) {
            if (part.inlineData?.data) {
              const mime = part.inlineData.mimeType || 'image/png'
              const compressed = await compressImageToDataUrl(`data:${mime};base64,${part.inlineData.data}`)
              return {
                imageUrl: compressed,
                caption: captionMap[eventType],
                characterName: charName,
                eventType,
                modelUsed: modelId,
              }
            }
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        if (msg.includes('429') || msg.includes('limit: 0') || msg.includes('RESOURCE_EXHAUSTED')) {
          sawFreeTierZero = true
          break
        }
      }
    }

    if (sawFreeTierZero) {
      geminiImageQuotaBlocked = true
    }
  }

  // Fallback seamlessly to fast free pipeline (SD 3.5 Turbo -> FLUX.1 Merged -> AI Horde)
  const freeRes = await generateViaFreeFastPipeline(prompt)
  return {
    ...freeRes,
    caption: captionMap[eventType],
    characterName: charName,
    eventType,
  }
}
