import { GoogleGenAI, ThinkingLevel } from '@google/genai'
import {
  buildOpeningPrompt,
  buildWorldStateSummary,
  CARDINAL_SYSTEM_PROMPT,
} from '../prompts/cardinalPrompt'
import type { ChatMessage, GameSession, GeminiModel, WikiLoreEntry } from '../types/game'
import { buildDiceChallengeFromAction } from '../utils/diceSystem'
import { stripStreamingJsonBlock } from '../utils/jsonStateParser'
import { fetchRelevantWikiLore, formatWikiLoreForPrompt } from './wikiLoreService'

export interface SendTurnOptions {
  apiKey: string
  model: GeminiModel
  session: GameSession
  userMessage: string
  isOpening?: boolean
  demoMode?: boolean
  fastMode?: boolean
  signal?: AbortSignal
  onStreamText?: (visibleNarrative: string) => void
  onModelAutoSwitched?: (newModel: string) => void
  onWikiReferencesLoaded?: (entries: WikiLoreEntry[]) => void
}

const NON_TEXT_MODEL_RE = /(image|tts|audio|live|robotics|computer-use|embedding|aqa|veo|imagen|lyria)/i

function rankGeminiModel(id: string): number {
  const lower = id.toLowerCase()
  if (lower.includes('gemini-4-hydrogen')) return 100
  if (lower.includes('gemini-4-neon')) return 95
  if (lower.includes('gemini-4-argon')) return 90
  if (lower.includes('gemini-4-carbon')) return 85
  if (lower.startsWith('gemini-4')) return 80
  if (lower.includes('gemini-3.8-flash')) return 75
  if (lower.includes('gemini-3.6-flash')) return 70
  if (lower.includes('gemini-3.5-flash') && !lower.includes('lite')) return 65
  if (lower.includes('gemini-3') && lower.includes('flash')) return 60
  if (lower.includes('gemini-3')) return 55
  if (lower.includes('gemini-2.5-flash') && !lower.includes('lite')) return 50
  if (lower.includes('gemini-2.5')) return 45
  if (lower.includes('flash')) return 30
  return 10
}

/**
 * Lists conversational Gemini models available to the provided API key.
 */
export async function listAvailableGeminiModels(apiKey: string): Promise<string[]> {
  if (!apiKey.trim()) {
    throw new Error('กรุณากรอก Gemini API Key ก่อนตรวจสอบรายชื่อโมเดล')
  }
  const ai = new GoogleGenAI({ apiKey: apiKey.trim() })
  const pager = await ai.models.list({ config: { pageSize: 100 } })
  const ids: string[] = []
  for await (const m of pager) {
    const rawName = m.name ?? ''
    const id = rawName.replace(/^models\//, '')
    const actions = m.supportedActions ?? []
    if (
      id &&
      id.includes('gemini') &&
      !NON_TEXT_MODEL_RE.test(id) &&
      (actions.length === 0 || actions.includes('generateContent'))
    ) {
      ids.push(id)
    }
  }
  return Array.from(new Set(ids)).sort((a, b) => rankGeminiModel(b) - rankGeminiModel(a))
}

function formatGeminiError(err: unknown, model: string): Error {
  const raw = err instanceof Error ? err.message : String(err)
  const lower = raw.toLowerCase()

  if (lower.includes('api_key_invalid') || lower.includes('api key not valid') || lower.includes('401')) {
    return new Error(`API Key ไม่ถูกต้องหรือถูกเพิกถอน — กรุณาตรวจสอบคีย์ในหน้า Settings (${raw})`)
  }
  if (lower.includes('404') || lower.includes('not_found') || lower.includes('is not found')) {
    return new Error(
      `โมเดล "${model}" ไม่พร้อมใช้งานบน API Key นี้ (404) — กด "Save / Settings" แล้วกด "ดึงโมเดลที่คีย์นี้ใช้ได้" เพื่อเลือกโมเดลที่รองรับ (${raw})`
    )
  }
  if (lower.includes('429') || lower.includes('quota') || lower.includes('resource_exhausted')) {
    return new Error(
      `โควตา API ของโมเดล "${model}" เต็มชั่วคราว (429) — รอสักครู่ หรือสลับโมเดล/เปิด Demo Mode (${raw})`
    )
  }
  if (lower.includes('403') || lower.includes('permission_denied')) {
    return new Error(`API Key ไม่มีสิทธิ์เข้าถึงโมเดล "${model}" (403) — ลองสลับโมเดลใน Settings (${raw})`)
  }
  if (lower.includes('503') || lower.includes('unavailable') || lower.includes('high demand') || lower.includes('overloaded')) {
    return new Error(
      `เซิร์ฟเวอร์ของโมเดล "${model}" มีคนใช้งานพร้อมกันจำนวนมากชั่วคราว (503 High Demand) — ระบบได้ลองสลับโมเดลสำรองแล้วแต่ติดขัดชั่วคราว กรุณารอสักครู่แล้วกด Retry หรือสลับโมเดลอื่นบนแถบด้านบน`
    )
  }
  return err instanceof Error ? err : new Error(raw)
}

function buildFastThinkingConfig(model: string, fastMode: boolean) {
  if (!fastMode) return undefined
  const lower = model.toLowerCase()
  if (lower.startsWith('gemini-4') || lower.startsWith('gemini-3')) {
    return { thinkingLevel: ThinkingLevel.LOW }
  }
  if (lower.includes('2.5-flash')) {
    return { thinkingBudget: 0 }
  }
  if (lower.includes('2.5-pro')) {
    return { thinkingBudget: 256 }
  }
  return { thinkingLevel: ThinkingLevel.LOW }
}

/**
 * Calls Gemini API using streaming (@google/genai generateContentStream) with
 * fast thinking config, slim sliding window history, and World State Summary injection.
 */
export async function sendCardinalTurn(options: SendTurnOptions): Promise<string> {
  const {
    apiKey,
    model,
    session,
    userMessage,
    isOpening = false,
    demoMode = false,
    fastMode = true,
    signal,
    onStreamText,
    onModelAutoSwitched,
    onWikiReferencesLoaded,
  } = options

  // Fetch relevant live facts from swordartonline.fandom.com (cached in localStorage, 2.8s budget)
  const wikiEntries = await fetchRelevantWikiLore(userMessage, session)
  if (onWikiReferencesLoaded && wikiEntries.length > 0) {
    onWikiReferencesLoaded(wikiEntries)
  }

  if (demoMode) {
    return generateDemoCardinalResponse(session, userMessage, isOpening)
  }

  if (!apiKey.trim()) {
    throw new Error('กรุณากรอก Gemini API Key ในหน้า Settings ก่อนเริ่มเชื่อมต่อ Cardinal System (หรือเปิดโหมดทดลอง Demo)')
  }

  const ai = new GoogleGenAI({ apiKey: apiKey.trim() })

  // Keep last 10 turns; strip verbose json_state from older turns since World State Summary tracks everything
  const recentMessages = session.messages
    .filter((m) => m.role === 'user' || m.role === 'model')
    .slice(-10)

  const contents = recentMessages.map((msg: ChatMessage, idx: number) => {
    const isLatestTurn = idx >= recentMessages.length - 2
    return {
      role: msg.role === 'user' ? ('user' as const) : ('model' as const),
      parts: [{ text: isLatestTurn ? msg.rawText || msg.text : msg.text }],
    }
  })

  const worldSummary = buildWorldStateSummary(session)
  const wikiContext = formatWikiLoreForPrompt(wikiEntries)
  const isTransferredOpening = isOpening && (session.arcHistory?.length ?? 0) > 1
  const promptPayload = isOpening
    ? [
        buildOpeningPrompt(session.profile, isTransferredOpening ? session : undefined),
        wikiContext,
      ]
        .filter(Boolean)
        .join('\n\n')
    : [worldSummary, wikiContext, `[การกระทำของผู้เล่น]\n${userMessage}`]
        .filter(Boolean)
        .join('\n\n')

  contents.push({
    role: 'user' as const,
    parts: [{ text: promptPayload }],
  })

  const runStream = async (targetModel: string, useThinkingConfig: boolean): Promise<string> => {
    const thinkingConfig = useThinkingConfig ? buildFastThinkingConfig(targetModel, fastMode) : undefined
    const stream = await ai.models.generateContentStream({
      model: targetModel,
      contents,
      config: {
        systemInstruction: CARDINAL_SYSTEM_PROMPT,
        temperature: 0.85,
        topP: 0.95,
        abortSignal: signal,
        ...(thinkingConfig ? { thinkingConfig } : {}),
      },
    })

    let accumulated = ''
    for await (const chunk of stream) {
      if (signal?.aborted) {
        throw new Error('ยกเลิกการประมวลผลแล้ว')
      }
      const chunkText = chunk.text ?? ''
      if (chunkText) {
        accumulated += chunkText
        if (onStreamText) {
          onStreamText(stripStreamingJsonBlock(accumulated))
        }
      }
    }
    return accumulated
  }

  const tryWithThinkingFallback = async (targetModel: string): Promise<string> => {
    try {
      const text = await runStream(targetModel, true)
      if (!text) {
        throw new Error('Cardinal System ไม่ได้รับข้อความตอบกลับจาก Gemini API')
      }
      return text
    } catch (err) {
      const rawMsg = err instanceof Error ? err.message.toLowerCase() : ''
      if (
        fastMode &&
        !signal?.aborted &&
        (rawMsg.includes('thinking') || rawMsg.includes('invalid_argument') || rawMsg.includes('budget'))
      ) {
        const retryText = await runStream(targetModel, false)
        if (!retryText) {
          throw new Error('Cardinal System ไม่ได้รับข้อความตอบกลับจาก Gemini API')
        }
        return retryText
      }
      throw err
    }
  }

  try {
    return await tryWithThinkingFallback(model)
  } catch (err) {
    if (signal?.aborted) {
      throw new Error('ยกเลิกการเชื่อมต่อเทิร์นนี้แล้ว (คุณสามารถกดส่งใหม่หรือเปลี่ยนเป็นโหมด Flash/Fast ได้)')
    }

    const rawMsg = err instanceof Error ? err.message.toLowerCase() : ''
    const isHighDemand =
      rawMsg.includes('503') ||
      rawMsg.includes('unavailable') ||
      rawMsg.includes('high demand') ||
      rawMsg.includes('overloaded')

    // Brief retry on temporary 503 spike before switching models
    if (isHighDemand && !signal?.aborted) {
      await new Promise((r) => setTimeout(r, 900))
      if (!signal?.aborted) {
        try {
          if (onStreamText) onStreamText('')
          return await tryWithThinkingFallback(model)
        } catch {
          // Proceed to fallback candidate models
        }
      }
    }

    const isModelUnavailable =
      isHighDemand ||
      rawMsg.includes('404') ||
      rawMsg.includes('not_found') ||
      rawMsg.includes('is not found') ||
      rawMsg.includes('403') ||
      rawMsg.includes('permission_denied')

    // Auto-discover available models for this API key and retry with the top working models
    if (isModelUnavailable) {
      try {
        const available = await listAvailableGeminiModels(apiKey)
        const candidates = available.filter((id) => id !== model).slice(0, 3)
        for (const candidate of candidates) {
          if (signal?.aborted) break
          try {
            if (onStreamText) onStreamText('')
            const result = await tryWithThinkingFallback(candidate)
            if (onModelAutoSwitched) {
              onModelAutoSwitched(candidate)
            }
            return result
          } catch {
            // Try next available model on this key
          }
        }
      } catch {
        // Ignore discovery failure and throw formatted original error
      }
    }

    throw formatGeminiError(err, model)
  }
}

/**
 * Built-in Offline Demo Simulator so users can explore the SAO HUD, Affection,
 * Party, and Marriage Modal mechanics even before entering a Gemini API Key.
 */
async function generateDemoCardinalResponse(
  session: GameSession,
  userMessage: string,
  isOpening: boolean
): Promise<string> {
  await new Promise((r) => setTimeout(r, 750))

  const p = session.worldState.player
  const name = session.profile.name
  const weapon = session.profile.weapon
  const asunaPrev = session.knownCharacters['Asuna']
  const currentAffection = asunaPrev?.affection ?? 120
  const lowerMsg = userMessage.toLowerCase()

  if (isOpening) {
    const isTransferred = (session.arcHistory?.length ?? 0) > 1
    if (isTransferred) {
      const carriedChars = Object.values(session.knownCharacters).slice(0, 4)
      const leadChar = carriedChars.find((c) => c.is_married) ?? carriedChars[0]
      const carriedListJson = JSON.stringify(
        carriedChars.map((c) => ({
          name: c.name,
          affection: c.affection,
          affection_delta: '0',
          relationship_tier: c.relationship_tier,
          mood: c.is_married ? 'Affectionate' : 'Glad to reunite',
          is_married: c.is_married,
          can_propose: c.can_propose,
        }))
      )

      return `แสงสีฟ้าอมเขียวของระบบ **The Seed** สลายตัวลงรอบร่างของคุณกลางลานเมืองแห่งใหม่ (**${session.worldState.location}**) การโอนย้ายบัญชีจาก **${session.arcHistory?.slice(0, -1).join(' → ')}** เข้าสู่ **${session.profile.startingArc}** เสร็จสมบูรณ์!

ตัวละคร **${name} (Lv.${p.level})** กางปีกหรือสำรวจอุปกรณ์ประจำภาคใหม่อย่าง **${weapon}**${
        p.spouse
          ? ` ทันใดนั้น **${p.spouse}** คู่สมรสของคุณก็ร่อนลงมายืนข้างกายพร้อมรอยยิ้มอบอุ่น "ในที่สุดก็ล็อกอินตามมาถึง ${session.profile.startingArc} จนได้นะ ${name}!"`
          : leadChar
            ? ` ไม่ไกลนัก **${leadChar.name}** ที่รู้จักกันมาตั้งแต่ภาคก่อนก็โบกมือทักทายคุณด้วยความดีใจ!`
            : ''
      }

1. ทักทายคนรู้จักจากภาคก่อนและทดสอบความสามารถของ ${weapon} ใน ${session.profile.startingArc}
2. เปิดเมนูตรวจสอบไอเทมและปีก/อุปกรณ์ที่โอนย้ายมาจากภาคก่อน
3. ออกสำรวจพื้นที่รอบ ${session.worldState.location}

\`\`\`json_state
{
  "world_arc": "${session.worldState.world_arc}",
  "location": "${session.worldState.location}",
  "in_game_date": "${session.worldState.in_game_date}",
  "canon_divergence": "${session.worldState.canon_divergence}",
  "player": {
    "level": ${p.level},
    "hp": ${p.max_hp},
    "max_hp": ${p.max_hp},
    "col": ${p.col},
    "status_effects": ${JSON.stringify(p.status_effects)},
    "inventory_changes": [],
    "spouse": ${p.spouse ? `"${p.spouse}"` : 'null'}
  },
  "characters_in_scene": ${carriedListJson},
  "system_alerts": [
    "โอนย้ายบัญชีสู่ ${session.profile.startingArc} สำเร็จ! ข้อมูลความสัมพันธ์ทั้งหมดถูกเชื่อมต่อแล้ว"
  ],
  "marriage_event_triggered": false,
  "scene_image_prompt": null
}
\`\`\``
    }

    return `เสียงกระดิ่งก้องกังวานไปทั่วจัตุรัสกลางเมืองเริ่มต้น (**${session.worldState.location}**) แสงสีฟ้าครามจากระบบ Cardinal ค่อยๆ สลายตัวลงรอบร่างของคุณ พร้อมหน้าต่างโฮโลแกรมที่ยืนยันการเชื่อมต่อ **${session.profile.startingArc}** เสร็จสมบูรณ์

มือของคุณสัมผัสได้ถึงน้ำหนักอันคุ้นเคยของ **${weapon}** ที่สะพายอยู่ข้างกาย ท่ามกลางผู้เล่นนับพันที่กำลังสับสนและเริ่มออกสำรวจเมือง หญิงสาวผมสีน้ำตาลประกายส้มในชุดคลุมฮู้ดสีแดงยืนมองแผนที่เมืองอยู่ใกล้เสาหิน เธอหันมาสบตากับคุณครู่หนึ่งก่อนจะเอ่ยขึ้นด้วยน้ำเสียงระมัดระวังแต่สุภาพ

"เอ่อ... ขอโทษนะคะ คุณก็เพิ่งล็อกอินเข้ามาเหมือนกันใช่ไหม? ถ้าจะออกไปล่ามอนสเตอร์นอกประตูทิศตะวันตก ระวังฝูง Frenzy Boar ด้วยนะคะ"

**คุณจะทำอย่างไรต่อไป?** (พิมพ์คำสั่งเองอย่างอิสระ หรือเลือกทางเลือกด้านล่าง)
1. แนะนำตัวและชวน Asuna ตั้งปาร์ตี้ออกไปเก็บเลเวลด้วยกัน
2. แบ่งปันข้อมูลเบต้าและมอบ Black Bread ให้เธอเป็นมิตรภาพแรก
3. เดินไปสำรวจตรอกลับและหาร้านตีดาบของ Lisbeth
4. มุ่งหน้าออกจากประตูเมืองไปทดสอบสกิล ${weapon} ทันที

\`\`\`json_state
{
  "world_arc": "${session.worldState.world_arc}",
  "location": "${session.worldState.location}",
  "in_game_date": "${session.worldState.in_game_date}",
  "canon_divergence": "${session.worldState.canon_divergence}",
  "player": {
    "level": 1,
    "hp": 250,
    "max_hp": 250,
    "col": 500,
    "status_effects": [],
    "inventory_changes": ["+1 Novice Map"],
    "spouse": null
  },
  "characters_in_scene": [
    {
      "name": "Asuna",
      "affection": 120,
      "affection_delta": "+20",
      "relationship_tier": "Friend",
      "mood": "Curious",
      "is_married": false,
      "can_propose": false
    }
  ],
  "system_alerts": [
    "Cardinal Demo Mode Active — เชื่อมต่อจำลองสำเร็จ",
    "พบตัวละครใหม่: Asuna (Friend)"
  ],
  "marriage_event_triggered": false,
  "scene_image_prompt": null
}
\`\`\``
  }

  // Handle Marriage Proposal in Demo Mode
  if (lowerMsg.includes('แต่งงาน') || lowerMsg.includes('propose') || lowerMsg.includes('แหวน')) {
    const newAff = Math.max(950, currentAffection + 50)
    return `[SYSTEM ALERT: Marriage Proposal Sent to Asuna]

ท่ามกลางแสงอาทิตย์ยามเย็นที่สาดส่องลงมายังระเบียงหินอ่อนของชั้นที่ 22 คุณคุกเข่าลงและส่งหน้าต่างคำขอแต่งงานสีทองอร่ามไปตรงหน้า **Asuna** 

ดวงตาสีน้ำตาลอ่อนของเธอเบิกกว้างขึ้นเล็กน้อย พวงแก้มขึ้นสีแดงระเรื่ออย่างเห็นได้ชัด เธอสูดหายใจลึก แล้วยื่นปลายนิ้วเรียวกดปุ่ม **[ACCEPT]** บนหน้าต่างโปร่งแสงด้วยรอยยิ้มที่เปี่ยมไปด้วยความสุข

"ต่อจากนี้ไป... ไม่ว่าโลกนี้จะโหดร้ายแค่ไหน เราจะอยู่เคียงข้างกันตลอดไปนะ **${name}**"

แสงสีทองโอบล้อมร่างของทั้งคู่ เสียงระบบประกาศก้องขึ้นพร้อมปลดล็อกสิทธิ์ **Shared Inventory** และ **กระท่อมไม้ริมทะเลสาบชั้น 22**!

1. พา Asuna เดินชมบ้านหลังใหม่ที่ชั้น 22 และจัดของเข้า Shared Inventory
2. ชวน Asuna ทำอาหารเย็นฉลองการแต่งงานด้วยกัน
3. จับมือคู่สมรสออกเดินทางไปเคลียร์ดันเจี้ยนพร้อมบัฟคู่รัก

\`\`\`json_state
{
  "world_arc": "${session.worldState.world_arc}",
  "location": "Floor 22 - Lakeside Forest Cabin",
  "in_game_date": "2023-06-14 17:45",
  "canon_divergence": "High (68% - เปลี่ยนเส้นทางความรักหลัก)",
  "player": {
    "level": ${p.level + 2},
    "hp": ${p.max_hp + 50},
    "max_hp": ${p.max_hp + 50},
    "col": ${p.col + 1000},
    "status_effects": ["Marriage Blessing (+15% All Stats)"],
    "inventory_changes": ["+1 Marriage Ring (Asuna)"],
    "spouse": "Asuna"
  },
  "characters_in_scene": [
    {
      "name": "Asuna",
      "affection": ${newAff},
      "affection_delta": "+50",
      "relationship_tier": "Married",
      "mood": "Blissful",
      "is_married": true,
      "can_propose": false
    }
  ],
  "system_alerts": [
    "Marriage Accepted! คุณและ Asuna เป็นคู่สมรสกันแล้ว",
    "ปลดล็อก Shared Inventory & Floor 22 Cabin!"
  ],
  "marriage_event_triggered": true,
  "marriage_partner": "Asuna",
  "scene_image_prompt": "Asuna in Aincrad Floor 22 lakeside cabin sunset, smiling tearfully and holding out her hand with a glowing golden marriage ring"
}
\`\`\``
  }

  // Handle Dice Roll Result resolution in Demo Mode
  if (lowerMsg.includes('[dice roll result:')) {
    const isSuccess = lowerMsg.includes('outcome: success') || lowerMsg.includes('outcome: critical success')
    const isCrit = lowerMsg.includes('critical success')
    if (isSuccess) {
      return `ลูกเต๋าแห่งชะตากรรมหยุดลงที่ผลลัพธ์ **สำเร็จ${isCrit ? ' (CRITICAL!)' : ''}!**

ด้วยค่าสถานะและอุปกรณ์สวมใส่ที่คุณเตรียมมาอย่างดี คุณปฏิบัติการได้อย่างสมบูรณ์แบบ! ท่วงท่าของ **${weapon}** เฉียบคมราวกับแสงดาว${isCrit ? ' ฟาดเข้าจุดตายอย่างรุนแรงในพริบตา' : ''} พิชิตสถานการณ์ตรงหน้าลงได้โดยไม่เสีย HP เพิ่ม

1. เก็บไอเทมและออกสำรวจพื้นที่ถัดไป
2. กลับเข้าเมืองไปพักผ่อนหรือแวะร้านค้า
3. ชวน Asuna ออกเดตฉลองชัยชนะ

\`\`\`json_state
{
  "world_arc": "${session.worldState.world_arc}",
  "location": "${session.worldState.location}",
  "in_game_date": "${session.worldState.in_game_date}",
  "canon_divergence": "${session.worldState.canon_divergence}",
  "player": {
    "level": ${p.level + 1},
    "hp": ${p.hp},
    "max_hp": ${p.max_hp},
    "col": ${p.col + (isCrit ? 450 : 250)},
    "status_effects": [],
    "inventory_changes": ["+1 Iron Ingot"],
    "spouse": ${p.spouse ? `"${p.spouse}"` : 'null'}
  },
  "characters_in_scene": [],
  "system_alerts": [
    "Dice Check Passed! ได้รับรางวัลและการเติบโต (+1 Level, +${isCrit ? 450 : 250} Col)"
  ],
  "marriage_event_triggered": false,
  "scene_image_prompt": null,
  "shop": null,
  "dice_challenge": null
}
\`\`\``
    }

    const lostHp = Math.max(20, Math.round(p.max_hp * 0.2))
    const nextHp = Math.max(15, p.hp - lostHp)
    return `ผลลูกเต๋าระบุว่า **ล้มเหลว!**

จังหวะก้าวพลาดเพียงเสี้ยววินาทีทำให้คุณเสียหลักถูกแรงปะทะเฉียดเข้าอย่างจัง (-${lostHp} HP) แต่คุณยังประคองสติตั้งหลักขึ้นมาได้ทันเวลา!

1. รีบใช้ Healing Potion ฟื้นฟู HP
2. ลองทอยเต๋าเพื่อหลบหนีออกจากพื้นที่อันตราย (ใช้ LUK + AGI)
3. ตั้งสมาธิวิเคราะห์หาจุดอ่อนศัตรูใหม่ (ใช้ MND + INT)

\`\`\`json_state
{
  "world_arc": "${session.worldState.world_arc}",
  "location": "${session.worldState.location}",
  "in_game_date": "${session.worldState.in_game_date}",
  "canon_divergence": "${session.worldState.canon_divergence}",
  "player": {
    "level": ${p.level},
    "hp": ${nextHp},
    "max_hp": ${p.max_hp},
    "col": ${p.col},
    "status_effects": ["Staggered"],
    "inventory_changes": [],
    "spouse": ${p.spouse ? `"${p.spouse}"` : 'null'}
  },
  "characters_in_scene": [],
  "system_alerts": [
    "Dice Check Failed! เสีย HP -${lostHp}"
  ],
  "marriage_event_triggered": false,
  "scene_image_prompt": null,
  "shop": null,
  "dice_challenge": null
}
\`\`\``
  }

  // Trigger a Dice Challenge in Demo Mode for combat, monster hunting, escape, or tactical thinking
  if (
    /มอนสเตอร์|ตี|ล่า|ดันเจี้ยน|ทดสอบสกิล|โจมตี|ต่อสู้|สู้|บอส|หนี|ถอย|วิเคราะห์|คิด|กับดัก|ทอยเต๋า|monster|hunt|attack|fight|escape|flee|think|analyze/.test(
      lowerMsg
    )
  ) {
    const challenge = buildDiceChallengeFromAction(userMessage, session.worldState)
    return `คุณก้าวออกจากเขตปลอดภัยบริเวณ **${session.worldState.location}** ทันใดนั้นเสียงพุ่มไม้สั่นไหวอย่างรุนแรง! **Frenzy Boar & Kobold Scout** พุ่งออกมาขวางทางเบื้องหน้า!

ระบบ Cardinal เปิดหน้าต่าง **เลือกแนวทางรับมือ & ทอยลูกเต๋า (1d20)** ให้คุณเลือกว่าจะ **เข้าสู้**, **ใช้ความคิดวิเคราะห์**, หรือ **หลบหนี** โดยคำนวณโอกาสสำเร็จ (%) จากค่า Stat และอุปกรณ์สวมใส่ของคุณให้เห็นแบบเรียลไทม์!

\`\`\`json_state
{
  "world_arc": "${session.worldState.world_arc}",
  "location": "Floor 1 - Western Plains",
  "in_game_date": "${session.worldState.in_game_date}",
  "canon_divergence": "${session.worldState.canon_divergence}",
  "player": {
    "level": ${p.level},
    "hp": ${p.hp},
    "max_hp": ${p.max_hp},
    "col": ${p.col},
    "status_effects": [],
    "inventory_changes": [],
    "spouse": ${p.spouse ? `"${p.spouse}"` : 'null'}
  },
  "characters_in_scene": [],
  "system_alerts": [
    "พบมอนสเตอร์! เลือกแนวทางและทอยลูกเต๋าเพื่อตัดสินผลลัพธ์"
  ],
  "marriage_event_triggered": false,
  "scene_image_prompt": null,
  "shop": null,
  "dice_challenge": ${JSON.stringify(challenge)}
}
\`\`\``
  }

  // Handle Shop Visit in Demo Mode
  if (
    lowerMsg.includes('ร้าน') ||
    lowerMsg.includes('ซื้อ') ||
    lowerMsg.includes('shop') ||
    lowerMsg.includes('lisbeth') ||
    lowerMsg.includes('agil') ||
    lowerMsg.includes('ตลาด')
  ) {
    const lisbethPrev = session.knownCharacters['Lisbeth']
    const lisbethAff = Math.min(1000, (lisbethPrev?.affection ?? 80) + 20)
    return `เสียงกระดิ่งหน้าร้านดังขึ้นเบาๆ เมื่อคุณผลักประตูไม้เข้าไปในร้าน **Lisbeth's Smithy & Supply** กลิ่นเหล็กหลอมอุ่นๆ ผสมกลิ่นสมุนไพรฟื้นฟูลอยมาแตะจมูก

หญิงสาวผมสีชมพูในชุดผ้ากันเปื้อนช่างตีเหล็กเงยหน้าขึ้นจากเคาน์เตอร์ ก่อนจะยิ้มร่าเริงให้คุณ

"ยินดีต้อนรับจ้า **${name}**! วันนี้มีของดีเพิ่งทำเสร็จใหม่ๆ เพียบเลยนะ ลองเลือกดูจากหน้าต่างร้านค้าได้เลย ถ้าสนใจชิ้นไหนก็กดซื้อได้ทันที!"

1. เลือกซื้อไอเทมจากหน้าร้านค้าของ Lisbeth
2. พูดคุยหยอกล้อกับ Lisbeth เพื่อเพิ่มความสนิทสนม
3. ออกจากร้านค้ามุ่งหน้าสู่ลานหน้าเมือง

\`\`\`json_state
{
  "world_arc": "${session.worldState.world_arc}",
  "location": "Lindarth - Lisbeth's Smithy & Supply",
  "in_game_date": "${session.worldState.in_game_date}",
  "canon_divergence": "${session.worldState.canon_divergence}",
  "player": {
    "level": ${p.level},
    "hp": ${p.hp},
    "max_hp": ${p.max_hp},
    "col": ${p.col},
    "status_effects": [],
    "inventory_changes": [],
    "spouse": ${p.spouse ? `"${p.spouse}"` : 'null'}
  },
  "characters_in_scene": [
    {
      "name": "Lisbeth",
      "affection": ${lisbethAff},
      "affection_delta": "+20",
      "relationship_tier": "${lisbethAff >= 250 ? 'Close Friend' : lisbethAff >= 100 ? 'Friend' : 'Stranger / Acquaintance'}",
      "mood": "Cheerful",
      "is_married": ${Boolean(p.spouse === 'Lisbeth')},
      "can_propose": ${lisbethAff >= 900 && p.spouse !== 'Lisbeth'}
    }
  ],
  "system_alerts": [
    "เข้าสู่ร้านค้า: Lisbeth's Smithy & Supply — เลือกซื้อไอเทมได้แล้ว!"
  ],
  "marriage_event_triggered": false,
  "scene_image_prompt": null,
  "shop": {
    "shop_name": "Lisbeth's Smithy & Supply",
    "shopkeeper": "Lisbeth",
    "currency": "Col",
    "items": [
      {
        "name": "Anneal Blade +2",
        "description": "ดาบมือเดียวตีเสริมแกร่งระดับ +2 เพิ่มพลังโจมตีและความคมทนทานสำหรับนักรบแนวหน้า",
        "price": 350,
        "stock": 2,
        "category": "equipment"
      },
      {
        "name": "High-Grade Healing Potion",
        "description": "น้ำยาฟื้นฟู HP ระดับสูง ฟื้นพลังชีวิต 350 หน่วยทันทีเมื่อกดดื่มระหว่างต่อสู้",
        "price": 120,
        "stock": 8,
        "category": "consumable"
      },
      {
        "name": "Antidote Crystal",
        "description": "คริสตัลแก้พิษและสถานะผิดปกติ ใช้ลบล้างพิษหรืออัมพาตทันทีในเสี้ยววินาที",
        "price": 90,
        "stock": 5,
        "category": "consumable"
      },
      {
        "name": "Crystallite Ingot",
        "description": "แร่คริสตัลไลต์หายากสำหรับหลอมตีอาวุธระดับสูงหรือใช้เป็นของขวัญให้ช่างตีเหล็ก",
        "price": 240,
        "stock": 3,
        "category": "material"
      }
    ]
  }
}
\`\`\``
  }

  // Handle Date / Gift / Party in Demo Mode
  if (lowerMsg.includes('เดต') || lowerMsg.includes('ของขวัญ') || lowerMsg.includes('date') || lowerMsg.includes('gift')) {
    const newAff = Math.min(1000, currentAffection + 260)
    const canPropose = newAff >= 900
    return `คุณชวน **Asuna** มานั่งพักผ่อนที่ร้านเบเกอรีลับใกล้ถนนสายหลัก พร้อมยื่นขนมปังครีมสดที่เพิ่งได้มาให้เธอ ดวงตาของเธอเป็นประกายทันทีที่รับไปชิม

"อร่อยจัง! ไม่คิดเลยว่าในเกมนี้จะมีของอร่อยแบบนี้ซ่อนอยู่ด้วย ขอบคุณมากนะ ${name}" เธอหัวเราะเบาๆ ก่อนจะขยับเข้ามานั่งใกล้ขึ้นอีกนิด "อยู่กับนายแล้วรู้สึกปลอดภัยกว่าที่คิดไว้เยอะเลยล่ะ"

1. ลองชวนเธอออกไปเดินเล่นชมวิวริมระเบียงเมืองเริ่มต้น
2. ชวนเข้าปาร์ตี้ไปล่ามอนสเตอร์ระดับ Field Boss ชั้นถัดไป
3. ${canPropose ? 'ใช้โอกาสนี้เอ่ยปากขอเธอแต่งงาน!' : 'พูดคุยเปิดใจเพื่อเพิ่มค่าความสัมพันธ์ต่อ'}

\`\`\`json_state
{
  "world_arc": "${session.worldState.world_arc}",
  "location": "Floor 1 - Bakery Terrace",
  "in_game_date": "${session.worldState.in_game_date}",
  "canon_divergence": "Medium (32% - สนิทกับ Asuna เร็วกว่า Canon)",
  "player": {
    "level": ${p.level + 1},
    "hp": ${p.max_hp},
    "max_hp": ${p.max_hp},
    "col": ${Math.max(0, p.col - 50)},
    "status_effects": ["Well Fed (+10% HP Regen)"],
    "inventory_changes": ["+1 Ragout Rabbit Sandwich"],
    "spouse": ${p.spouse ? `"${p.spouse}"` : 'null'}
  },
  "characters_in_scene": [
    {
      "name": "Asuna",
      "affection": ${newAff},
      "affection_delta": "+260",
      "relationship_tier": "${newAff >= 900 ? 'Ready for Marriage' : newAff >= 700 ? 'Lover' : newAff >= 500 ? 'Romantic Interest' : 'Close Friend'}",
      "mood": "Happy & Flustered",
      "is_married": ${Boolean(p.spouse === 'Asuna')},
      "can_propose": ${canPropose && p.spouse !== 'Asuna'}
    }
  ],
  "system_alerts": [
    "Affection with Asuna increased by 260!",
    ${canPropose ? '"ปลดล็อกปุ่มขอแต่งงาน (Propose) กับ Asuna แล้ว!"' : '"ได้รับไอเทมพิเศษ: Ragout Rabbit Sandwich"'}
  ],
  "marriage_event_triggered": false,
  "scene_image_prompt": "Asuna sitting happily at a sunlit bakery terrace in Town of Beginnings holding a cream pastry, blushing slightly"
}
\`\`\``
  }

  // Generic Combat / Exploration Demo Turn
  const newHp = Math.max(40, p.hp - 35)
  const newAff = Math.min(1000, currentAffection + 45)
  return `คุณพุ่งทะยานไปข้างหน้าด้วยท่วงท่าอันเฉียบคม ปลดปล่อย **Sword Skill** ประจำอาวุธ **${weapon}** แสงสีฟ้าครามพาดผ่านกลางอากาศปะทะเข้ากับมอนสเตอร์เบื้องหน้าจนเกิดประกายไฟ! แม้คุณจะโดนแรงกระแทกเฉียดไหล่ไปเล็กน้อย แต่เสียง **"Switch!"** ของ **Asuna** ก็ดังประสานขึ้นทันท่วงที

*เพล้ง!* ร่างของศัตรูแตกสลายเป็นโพลีกอนสีฟ้าในพริบตา Asuna ลดดาบเรเปียร์ลงแล้วหันมายิ้มให้คุณ

"จังหวะ Switch เมื่อกี้ยอดเยี่ยมมากเลย! แต่ระวัง HP ตัวเองด้วยนะ ${name}"

1. กิน Healing Potion ฟื้นฟู HP แล้วสำรวจหีบสมบัติตรงหน้า
2. ชวน Asuna ออกเดตพักผ่อนในเมืองเพื่อเพิ่มความสัมพันธ์
3. แวะไปคุยกับ Argo หรือ Lisbeth เพื่อหาข่าวสารและอัปเกรดอาวุธ

\`\`\`json_state
{
  "world_arc": "${session.worldState.world_arc}",
  "location": "Floor 1 - Labyrinth Corridor",
  "in_game_date": "${session.worldState.in_game_date}",
  "canon_divergence": "Low (12% - ร่วมสู้กับ Asuna)",
  "player": {
    "level": ${p.level + 1},
    "hp": ${newHp},
    "max_hp": ${p.max_hp},
    "col": ${p.col + 250},
    "status_effects": [],
    "inventory_changes": ["+1 Iron Ingot", "+250 Col"],
    "spouse": ${p.spouse ? `"${p.spouse}"` : 'null'}
  },
  "characters_in_scene": [
    {
      "name": "Asuna",
      "affection": ${newAff},
      "affection_delta": "+45",
      "relationship_tier": "${newAff >= 900 ? 'Ready for Marriage' : newAff >= 700 ? 'Lover' : newAff >= 500 ? 'Romantic Interest' : newAff >= 250 ? 'Close Friend' : 'Friend'}",
      "mood": "Impressed",
      "is_married": ${Boolean(p.spouse === 'Asuna')},
      "can_propose": ${newAff >= 900 && p.spouse !== 'Asuna'}
    }
  ],
  "system_alerts": [
    "Level Up! เลเวลของคุณเพิ่มขึ้นเป็น Lv.${p.level + 1}",
    "Affection with Asuna increased by 45!"
  ],
  "marriage_event_triggered": false,
  "scene_image_prompt": null
}
\`\`\``
}
