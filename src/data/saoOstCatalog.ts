import type { GameSession } from '../types/game'

export const SAO_OST_PLAYLIST_ID = 'PLnnCEh3csc8ptvQcAknJN8OkWN5MhY7ri'
export const SAO_OST_PLAYLIST_URL =
  'https://youtube.com/playlist?list=PLnnCEh3csc8ptvQcAknJN8OkWN5MhY7ri'

export type OstSituation =
  | 'title'
  | 'town'
  | 'romance_daily'
  | 'romance'
  | 'marriage'
  | 'shop'
  | 'combat'
  | 'combat_alo'
  | 'combat_ggo'
  | 'danger'
  | 'sorrow'
  | 'victory'
  | 'exploration_alo'

export interface OstTrack {
  videoId: string
  title: string
  moods: OstSituation[]
}

export const OST_SITUATION_LABELS: Record<OstSituation, string> = {
  title: 'LINK START',
  town: 'SAFE ZONE / TOWN',
  romance_daily: 'DAILY / SCHOOL',
  romance: 'ROMANCE / DATE',
  marriage: 'MARRIAGE BOND',
  shop: 'MERCHANT / SHOP',
  combat: 'BATTLE',
  combat_alo: 'AERIAL BATTLE',
  combat_ggo: 'GGO FIREFIGHT',
  danger: 'CRITICAL DANGER',
  sorrow: 'EMOTIONAL / SORROW',
  victory: 'VICTORY',
  exploration_alo: 'FAIRY FLIGHT',
}

/**
 * All 83 tracks from the user's YouTube playlist (PLnnCEh3csc8ptvQcAknJN8OkWN5MhY7ri),
 * mapped accurately to SAO moods and scenes.
 */
export const SAO_OST_TRACKS: OstTrack[] = [
  { videoId: 'jUuknk81n2w', title: 'Swordland', moods: ['title', 'combat'] },
  { videoId: '9r785y3f1Nk', title: 'The First Town', moods: ['town'] },
  { videoId: '8lXWuFGMpb4', title: 'Friendly Feelings', moods: ['shop', 'romance_daily'] },
  { videoId: 'bfaBr7EuZCE', title: 'A Tender Feeling', moods: ['romance'] },
  { videoId: 'ztb1Hp8q5M0', title: 'Welcome to This World', moods: ['title', 'town'] },
  { videoId: '9bLpyGlQGtg', title: 'Luminous Sword', moods: ['combat'] },
  { videoId: 'cIeOWMk2TbU', title: 'Confront Battle', moods: ['combat'] },
  { videoId: 'V9TtXSv84Ec', title: 'Stand at Bay', moods: ['combat', 'danger'] },
  { videoId: 'EHbJKskpOb8', title: 'At Our Parting', moods: ['sorrow'] },
  { videoId: 'MDOYbpBjFHQ', title: 'A Strategy Meeting', moods: ['danger', 'town'] },
  { videoId: 'sdCTTIGNKM4', title: 'March Down', moods: ['combat'] },
  { videoId: '2NC0AM2qxC0', title: 'Gracefully', moods: ['shop', 'town'] },
  { videoId: 'h3g5ug67C6c', title: 'In Your Past', moods: ['sorrow'] },
  { videoId: 'ZEQHVAkSHwM', title: 'A Tiny Love', moods: ['romance'] },
  { videoId: '8Q4kP4zkDUA', title: 'Everyday Life', moods: ['romance_daily', 'shop'] },
  { videoId: '878l5MGZoVI', title: 'Smile for Me', moods: ['romance'] },
  { videoId: 'zWDrH1jJ3gE', title: 'At Nightfall', moods: ['sorrow'] },
  { videoId: 'DHsEIl9UHP0', title: 'Survive the Swordland', moods: ['combat'] },
  { videoId: '3VH-QtFxVW0', title: 'A Narrow Escape', moods: ['danger'] },
  { videoId: '2GeARueYx1s', title: 'With My Friend', moods: ['romance_daily', 'town'] },
  { videoId: 'gtSGY6SJxLk', title: 'We Have to Defeat It', moods: ['combat', 'danger'] },
  { videoId: 'vmHESNYMo2A', title: 'Friendly Feelings (Piano)', moods: ['romance_daily', 'town'] },
  { videoId: 'm6b8z8m3OXc', title: 'Critical Phase', moods: ['danger'] },
  { videoId: '-BUdYgn8_MI', title: 'Swordland -To Be Continued-', moods: ['victory', 'title'] },
  { videoId: 'KPyYJaal40Y', title: 'Is This Love?', moods: ['romance'] },
  { videoId: '9oFGNBEDL0U', title: 'She Is Still Sleeping', moods: ['sorrow'] },
  { videoId: 'ViHX_lNQXQo', title: 'Climbing Up the World Tree', moods: ['exploration_alo', 'danger'] },
  { videoId: 'YEDlbHkO_Ic', title: 'A New World of Fairies', moods: ['exploration_alo', 'town'] },
  { videoId: 'aeo1jTW_wA8', title: 'Yui', moods: ['marriage', 'romance'] },
  { videoId: 'Y6ChuS5KB-0', title: 'In Time of Peace', moods: ['town'] },
  { videoId: 'Hg10Txfzq4k', title: 'Last Flight', moods: ['sorrow', 'exploration_alo'] },
  { videoId: 'ZcQnCxgoRwE', title: 'Aerial Fight', moods: ['combat_alo', 'combat'] },
  { videoId: '1roMMXdYndY', title: 'Got to Win', moods: ['combat_alo', 'combat'] },
  { videoId: 'JxWmg6s81mw', title: 'Fly, If You Can', moods: ['exploration_alo'] },
  { videoId: '-IW7wqwZ-SQ', title: 'Town in the Morning', moods: ['town'] },
  { videoId: 'S1rGUAsmmH8', title: 'Is This Love? (Piano)', moods: ['romance', 'marriage'] },
  { videoId: '02ABsBZevz8', title: 'Fly Higher and Faster', moods: ['exploration_alo'] },
  { videoId: '4mEfejikezw', title: 'Victory', moods: ['victory'] },
  { videoId: 'y3yX7NvtYtQ', title: 'Fight with a Devil', moods: ['danger', 'combat'] },
  { videoId: 'ELPdPgcMrws', title: 'Reconciliation', moods: ['marriage', 'sorrow'] },
  { videoId: 'Au7My49EUOw', title: 'False King', moods: ['danger', 'combat_alo'] },
  { videoId: 'MQ9wpYhQGMs', title: 'Dance with Me', moods: ['combat'] },
  { videoId: 'mJj0ddB1XxM', title: 'Aincrad', moods: ['title', 'town'] },
  { videoId: 'SmUwEA76o-E', title: 'In This World', moods: ['title'] },
  { videoId: 'vHMDJrX9e1Q', title: 'Swordbreaking Land', moods: ['combat'] },
  { videoId: 'cE0vPS9qihY', title: 'In This Cruel Land', moods: ['danger', 'sorrow'] },
  { videoId: 'BlmHHjBbvZ4', title: 'Gunland', moods: ['combat_ggo', 'combat'] },
  { videoId: 'ptVQSp2Lx0M', title: 'Death Gun', moods: ['danger', 'combat_ggo'] },
  { videoId: 'Zv0ius0U4Ow', title: 'Think Tenderly of You', moods: ['romance'] },
  { videoId: 'P0lK9IGNNZg', title: 'Daily Life, You and Me', moods: ['romance_daily'] },
  { videoId: 'wU9UQda78hs', title: 'Inside Information', moods: ['shop', 'danger'] },
  { videoId: 'GZRUkzXXHxc', title: 'She Has to Overcome Her Fear', moods: ['sorrow', 'danger'] },
  { videoId: 't7nFoV2rRXo', title: 'Good Bye, Again and Again', moods: ['sorrow'] },
  { videoId: 'Gc0Yd3-4bzU', title: 'No-Escape', moods: ['danger'] },
  { videoId: '_zXJlQOakcU', title: 'Crooked Mind', moods: ['danger'] },
  { videoId: 'DcE3ANSohls', title: 'A Brisk Conversation', moods: ['shop', 'romance_daily'] },
  { videoId: 'LzQgnYz9yI8', title: 'He, or She?', moods: ['romance_daily'] },
  { videoId: '61ySuhquWFM', title: "Shoot 'Em Up!", moods: ['combat_ggo'] },
  { videoId: 'OfWDIjYAC2Y', title: 'Quickly and without Fail', moods: ['combat_ggo', 'combat'] },
  { videoId: 'lHb9cC9PqmQ', title: 'Drive Your Way', moods: ['combat_ggo', 'combat'] },
  { videoId: 'RsuHvkHXlDI', title: 'Bullet of Bullets', moods: ['combat_ggo'] },
  { videoId: 'JG4agu4BRZA', title: 'Think Tenderly of You (Mbox)', moods: ['romance', 'marriage'] },
  { videoId: 'Ls7gAqNuK34', title: "I'm Always Thinking of You", moods: ['romance'] },
  { videoId: 'mREuGYTVANU', title: "She's a Knockout!", moods: ['combat_ggo', 'combat'] },
  { videoId: 'Mp_B0AdJZGM', title: 'Fighting Hard and Close', moods: ['combat_ggo', 'combat'] },
  { videoId: 'UagZozxoxfA', title: 'You Are the Winner!', moods: ['victory'] },
  { videoId: 'wjIdomfiShw', title: 'Peace, Again', moods: ['town', 'marriage'] },
  { videoId: 'paEKjigoGWk', title: 'Desolate Landscape', moods: ['sorrow', 'combat_ggo'] },
  { videoId: '-opy0YXCk4w', title: 'Tonky', moods: ['exploration_alo', 'town'] },
  { videoId: 'KQbArbJgJBw', title: 'Urd', moods: ['sorrow', 'exploration_alo'] },
  { videoId: 'FRFOJu6J4Yk', title: 'In Another Land', moods: ['exploration_alo', 'town'] },
  { videoId: 'Ryc2lO0PxVc', title: 'Fly Away from Here!', moods: ['exploration_alo'] },
  { videoId: 'cWTQjYnloa8', title: 'Light Your Sword', moods: ['combat', 'exploration_alo'] },
  { videoId: 'YlGzWsktAd0', title: 'Heartbreaking Reality', moods: ['sorrow'] },
  { videoId: 'MQcK7NiB-pk', title: 'You Are Not Alone', moods: ['marriage', 'romance'] },
  { videoId: 'KnQIXmSq5Zs', title: 'Tears for You', moods: ['sorrow'] },
  { videoId: 'Ao5vu8vHIEI', title: 'Moon and Shadow', moods: ['sorrow', 'town'] },
  { videoId: 'VPxr7gV0OCw', title: 'You Are Not Alone (Acoustic)', moods: ['romance', 'marriage'] },
  { videoId: 'Mf4jMjx7gg8', title: 'School Days, with You', moods: ['romance_daily'] },
  { videoId: 'fx4NWrB6Nuc', title: 'You Are Not Alone #3', moods: ['romance', 'marriage'] },
  { videoId: 'tE3WrFZf-Yo', title: 'Trying to Understand', moods: ['romance_daily', 'sorrow'] },
  { videoId: 'ZmP5hEKXd9Q', title: 'Cold and Wild', moods: ['danger', 'combat'] },
  { videoId: 'QLbzKX3Vgcg', title: 'You Are Not Alone (Piano)', moods: ['marriage', 'romance'] },
]

export function getTracksForSituation(situation: OstSituation): OstTrack[] {
  const exact = SAO_OST_TRACKS.filter((t) => t.moods.includes(situation))
  if (exact.length > 0) return exact
  return SAO_OST_TRACKS.filter((t) => t.moods.includes('town'))
}

/**
 * Infers the most fitting SAO OST situation from live gameplay state, active modals,
 * HP/danger status, World Arc, and recent roleplay narrative.
 */
export function detectOstSituation(params: {
  session: GameSession | null
  isShopOpen: boolean
  isDiceModalOpen: boolean
  marriageModalPartner: string | null
}): OstSituation {
  const { session, isShopOpen, isDiceModalOpen, marriageModalPartner } = params
  if (!session) return 'title'

  const { worldState, profile, messages } = session
  if (marriageModalPartner || worldState.marriage_event_triggered) {
    return 'marriage'
  }
  if (isShopOpen || (worldState.shop && worldState.shop.items.length > 0)) {
    return 'shop'
  }

  const arcLower = worldState.world_arc.toLowerCase()
  const isAlo = arcLower.includes('alfheim')
  const isGgo = arcLower.includes('gun gale')

  const hpPct = worldState.player.max_hp > 0 ? worldState.player.hp / worldState.player.max_hp : 1
  const statusText = worldState.player.status_effects.join(' ').toLowerCase()
  if (hpPct <= 0.25 || statusText.includes('stagger') || statusText.includes('poison') || statusText.includes('critical')) {
    return 'danger'
  }

  const lastModelMsg = [...messages].reverse().find((m) => m.role === 'model')
  const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user')
  // Strip trailing suggested choices list from narrative so option previews ("ออกไปล่ามอนสเตอร์") don't falsely trigger battle BGM while standing in town
  const narrativeBody = (lastModelMsg?.text ?? '')
    .split('\n')
    .filter((line) => !/^\s*\d+[.)]\s+/.test(line))
    .join(' ')
  const recentCombined = `${lastUserMsg?.text ?? ''} ${narrativeBody} ${worldState.location}`.toLowerCase()
  const sceneMoods = worldState.characters_in_scene.map((c) => c.mood.toLowerCase()).join(' ')
  const isSafeZoneLocation = /town of beginnings|central plaza|tolbana|market|bakery|cafe|inn|smithy|cabin|house|rulid|sylvein|glocken/.test(
    worldState.location.toLowerCase()
  )

  if (isDiceModalOpen) {
    if (isGgo) return 'combat_ggo'
    if (isAlo) return 'combat_alo'
    return 'combat'
  }

  if (/outcome:\s*(?:critical\s+)?success|level up!|victory|ชนะแล้ว|โค่น.*สำเร็จ|แตกสลายเป็นโพลีกอน/.test(recentCombined)) {
    return 'victory'
  }

  if (
    !isSafeZoneLocation &&
    /sword skill|switch!|boss|บอส|มอนสเตอร์|โจมตี|ต่อสู้|ฟาดฟัน|ยิงปะทะ|ดวลดาบ|kobold|frenzy boar|death gun/.test(
      recentCombined
    )
  ) {
    if (isGgo) return 'combat_ggo'
    if (isAlo) return 'combat_alo'
    return 'combat'
  }

  if (
    /วิกฤต|อันตราย|กับดัก|ลอบโจมตี|no escape|hp ลด|บาดเจ็บสาหัส/.test(recentCombined)
  ) {
    return 'danger'
  }

  if (
    /เศร้า|ร้องไห้|น้ำตา|จากลา|สูญเสีย|ปวดใจ|grief|sorrow|tears/.test(
      `${recentCombined} ${sceneMoods}`
    )
  ) {
    return 'sorrow'
  }

  if (profile.storyMode === 'romance') {
    const activeTarget = session.romanceTarget ?? profile.romanceTarget
    const targetState = activeTarget ? session.knownCharacters[activeTarget.name] : undefined
    if (
      (targetState && targetState.affection >= 450) ||
      /flustered|in love|romantic|เดต|สารภาพ|คบ|เขิน|รัก/.test(`${recentCombined} ${sceneMoods}`)
    ) {
      return 'romance'
    }
    return 'romance_daily'
  }

  if (
    /romantic|lover|affectionate|blissful|flustered|ออกเดต|ของขวัญ|สารภาพ|จับมือ|โอบกอด/.test(
      `${recentCombined} ${sceneMoods}`
    )
  ) {
    return 'romance'
  }

  if (isAlo && /บิน|ปีก|world tree|ท้องฟ้า|sylvein|fly/.test(recentCombined)) {
    return 'exploration_alo'
  }

  return 'town'
}
