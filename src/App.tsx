import { useCallback, useEffect, useRef, useState } from 'react'
import { MessageSquare, Users } from 'lucide-react'
import { ArcTransferModal } from './components/ArcTransferModal'
import { ChatPanel } from './components/ChatPanel'
import { DiceRollModal } from './components/DiceRollModal'
import type { DiceRollResolution } from './components/DiceRollModal'
import { InventoryPanel } from './components/InventoryPanel'
import { LinkStartScreen } from './components/LinkStartScreen'
import { MarriageModal } from './components/MarriageModal'
import { RelationshipPanel } from './components/RelationshipPanel'
import { SettingsModal } from './components/SettingsModal'
import { ShopModal } from './components/ShopModal'
import { StatPanel } from './components/StatPanel'
import { SystemAlertOverlay } from './components/SystemAlertOverlay'
import { TopStatusHud } from './components/TopStatusHud'
import { sendCardinalTurn } from './services/geminiService'
import { evaluateEventCGTrigger, generateEventCGImage } from './services/imageService'
import { saveItemToCache } from './services/itemService'
import type {
  AppSettings,
  ChatMessage,
  DiceChallenge,
  EventCG,
  GameSession,
  GeminiModel,
  PlayerProfile,
  SaveSlotMeta,
  ShopItem,
  StatKey,
  SystemAlertItem,
  WikiLoreEntry,
  WorldState,
} from './types/game'
import {
  computeDerivedStats,
  createInitialStatState,
  ensureCharacterStats,
  HP_PER_VIT,
  STAT_POINTS_PER_LEVEL,
} from './utils/statSystem'
import { buildDiceChallengeFromAction } from './utils/diceSystem'
import {
  applyInventoryChanges,
  mergeKnownCharacters,
  parseCardinalResponse,
} from './utils/jsonStateParser'
import {
  createInitialSession,
  deleteSaveSlot,
  loadAutoSave,
  loadSaveSlots,
  loadSettings,
  saveAutoSave,
  saveSettings,
  saveToSlot,
} from './utils/storage'

function inferAlertVariant(text: string): SystemAlertItem['variant'] {
  const lower = text.toLowerCase()
  if (lower.includes('marriage') || lower.includes('แต่งงาน') || lower.includes('คู่สมรส')) {
    return 'marriage'
  }
  if (lower.includes('affection') || lower.includes('ความสัมพันธ์') || lower.includes('friend')) {
    return 'affection'
  }
  if (lower.includes('danger') || lower.includes('warning') || lower.includes('hp') || lower.includes('ลด')) {
    return 'warning'
  }
  return 'info'
}

export function App() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings())
  const [session, setSession] = useState<GameSession | null>(null)
  const [hasAutoSave, setHasAutoSave] = useState<boolean>(() => Boolean(loadAutoSave()))
  const [saveSlots, setSaveSlots] = useState<SaveSlotMeta[]>(() => loadSaveSlots())
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [isShopOpen, setIsShopOpen] = useState(false)
  const [pendingDiceChallenge, setPendingDiceChallenge] = useState<DiceChallenge | null>(null)
  const [isDiceModalOpen, setIsDiceModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [alerts, setAlerts] = useState<SystemAlertItem[]>([])
  const [marriageModalPartner, setMarriageModalPartner] = useState<string | null>(null)
  const [marriageModalCG, setMarriageModalCG] = useState<EventCG | null>(null)
  const [generatingImageMsgId, setGeneratingImageMsgId] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<'chat' | 'hud'>('chat')
  const abortControllerRef = useRef<AbortController | null>(null)
  const lastFailedTurnRef = useRef<{ userText: string; isOpening: boolean } | null>(null)

  useEffect(() => {
    if (!isLoading) {
      setElapsedSeconds(0)
      return
    }
    const startedAt = Date.now()
    const timer = setInterval(() => {
      setElapsedSeconds((Date.now() - startedAt) / 1000)
    }, 100)
    return () => clearInterval(timer)
  }, [isLoading])

  const pushAlert = useCallback(
    (title: string, message: string, variant: SystemAlertItem['variant'] = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      setAlerts((prev) => [...prev.slice(-3), { id, title, message, variant }])
      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => a.id !== id))
      }, 6500)
    },
    []
  )

  useEffect(() => {
    if (session) {
      saveAutoSave(session)
      setHasAutoSave(true)
    }
  }, [session])

  const triggerEventCGInBackground = useCallback(
    async (
      messageId: string,
      worldState: WorldState,
      userText: string,
      narrative: string,
      eventType: EventCG['eventType'],
      activeSettings: AppSettings,
      isManual = false
    ) => {
      setGeneratingImageMsgId(messageId)
      try {
        const cg = await generateEventCGImage({
          apiKey: activeSettings.apiKey,
          imageModelSetting: activeSettings.imageModel,
          worldState,
          userText,
          narrative,
          eventType,
          demoMode: activeSettings.demoMode,
        })

        setSession((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            messages: prev.messages.map((m) =>
              m.id === messageId ? { ...m, eventImage: cg } : m
            ),
            updatedAt: Date.now(),
          }
        })

        if (eventType === 'marriage') {
          setMarriageModalCG(cg)
        }

        pushAlert(
          eventType === 'marriage' ? 'MARRIAGE CG' : 'EVENT CG',
          `📸 ${cg.caption}`,
          eventType === 'marriage' ? 'marriage' : 'affection'
        )
      } catch (err) {
        if (isManual) {
          const msg = err instanceof Error ? err.message : 'สร้างภาพไม่สำเร็จ'
          pushAlert('IMAGE CG', msg, 'warning')
        }
      } finally {
        setGeneratingImageMsgId((curr) => (curr === messageId ? null : curr))
      }
    },
    [pushAlert]
  )

  const executeTurn = useCallback(
    async (
      targetSession: GameSession,
      userText: string,
      isOpening = false,
      options?: { skipAppendUser?: boolean; overrideSettings?: AppSettings }
    ) => {
      const activeSettings = options?.overrideSettings ?? settings
      abortControllerRef.current?.abort()
      const controller = new AbortController()
      abortControllerRef.current = controller

      setErrorMessage(null)
      setStreamingText('')
      setIsLoading(true)

      let workingSession = targetSession
      if (!isOpening && !options?.skipAppendUser) {
        const userMsg: ChatMessage = {
          id: `u-${Date.now()}`,
          role: 'user',
          text: userText,
          timestamp: Date.now(),
        }
        workingSession = {
          ...targetSession,
          messages: [...targetSession.messages, userMsg],
        }
        setSession(workingSession)
      }

      let resolvedModel = activeSettings.model
      let wikiReferences: WikiLoreEntry[] = []

      try {
        const rawResponse = await sendCardinalTurn({
          apiKey: activeSettings.apiKey,
          model: activeSettings.model,
          session: workingSession,
          userMessage: userText,
          isOpening,
          demoMode: activeSettings.demoMode,
          fastMode: activeSettings.fastMode,
          signal: controller.signal,
          onStreamText: (partial) => setStreamingText(partial),
          onWikiReferencesLoaded: (entries) => {
            wikiReferences = entries
          },
          onModelAutoSwitched: (newModel) => {
            resolvedModel = newModel
            const updatedSettings = { ...activeSettings, model: newModel }
            setSettings(updatedSettings)
            saveSettings(updatedSettings)
            pushAlert(
              'AUTO MODEL SWITCH',
              `เปลี่ยนไปใช้โมเดล ${newModel} ที่รองรับกับคีย์ของคุณอัตโนมัติ`,
              'info'
            )
          },
        })
        lastFailedTurnRef.current = null

        const parsed = parseCardinalResponse(rawResponse, workingSession.worldState)
        const nextWorldState = parsed.worldState ?? workingSession.worldState

        const nextInventory = applyInventoryChanges(
          workingSession.inventory,
          nextWorldState.player.inventory_changes
        )

        const nextCharacters = mergeKnownCharacters(
          workingSession.knownCharacters,
          nextWorldState.characters_in_scene,
          nextWorldState.location
        )

        // Detect party additions from prompt/character state
        const nextParty = new Set(workingSession.partyMembers)
        for (const ch of nextWorldState.characters_in_scene) {
          if (ch.in_party) nextParty.add(ch.name)
          if (userText.includes('ปาร์ตี้') && userText.includes(ch.name) && ch.affection >= 100) {
            nextParty.add(ch.name)
          }
          if (ch.is_married) nextParty.add(ch.name)
        }

        // Track Butterfly Effect milestones if canon divergence shifted
        const nextButterfly = [...workingSession.butterflyEffects]
        if (
          nextWorldState.canon_divergence !== workingSession.worldState.canon_divergence &&
          !nextButterfly.includes(nextWorldState.canon_divergence)
        ) {
          nextButterfly.push(`${nextWorldState.location}: ${nextWorldState.canon_divergence}`)
        }

        const spouseName = nextWorldState.player.spouse
        const nextSharedHome =
          workingSession.sharedHome ?? (spouseName ? 'Floor 22 - Lakeside Forest Cabin' : null)

        // Level-up Stat Points reward (+5 AP per level gained) & preserve VIT bonus HP
        const prevLevel = workingSession.worldState.player.level
        const newLevel = nextWorldState.player.level
        const gainedLevels = Math.max(0, newLevel - prevLevel)
        const baseStats = ensureCharacterStats(
          workingSession.characterStats,
          prevLevel,
          workingSession.profile.weapon
        )
        const gainedAP = gainedLevels * STAT_POINTS_PER_LEVEL
        const nextCharacterStats =
          gainedAP > 0
            ? { ...baseStats, statPoints: baseStats.statPoints + gainedAP }
            : baseStats

        const derivedStats = computeDerivedStats(nextCharacterStats, newLevel)
        const effectiveMaxHp = Math.max(
          nextWorldState.player.max_hp,
          250 + derivedStats.vitBonusHp
        )
        const effectiveHp =
          gainedLevels > 0
            ? effectiveMaxHp
            : Math.min(effectiveMaxHp, nextWorldState.player.hp)

        const syncedWorldState: WorldState = {
          ...nextWorldState,
          player: {
            ...nextWorldState.player,
            max_hp: effectiveMaxHp,
            hp: effectiveHp,
          },
        }

        const modelMsg: ChatMessage = {
          id: `m-${Date.now()}`,
          role: 'model',
          text: parsed.narrative,
          rawText: rawResponse,
          timestamp: Date.now(),
          choices: parsed.choices,
          stateSnapshot: parsed.worldState ? syncedWorldState : undefined,
          modelUsed: activeSettings.demoMode ? 'cardinal-demo' : resolvedModel,
          wikiReferences: wikiReferences.length > 0 ? wikiReferences : undefined,
        }

        const updatedSession: GameSession = {
          ...workingSession,
          characterStats: nextCharacterStats,
          worldState: syncedWorldState,
          knownCharacters: nextCharacters,
          inventory: nextInventory,
          sharedHome: nextSharedHome,
          partyMembers: Array.from(nextParty),
          butterflyEffects: nextButterfly,
          messages: [...workingSession.messages, modelMsg],
          updatedAt: Date.now(),
        }

        setSession(updatedSession)

        if (gainedAP > 0) {
          pushAlert(
            'LEVEL UP!',
            `Lv.${newLevel} — ได้รับ +${gainedAP} Stat Points สำหรับอัปเกรดค่าสถานะ!`,
            'affection'
          )
        }

        // Dispatch System Alerts
        for (const alertText of nextWorldState.system_alerts) {
          pushAlert('SYSTEM ALERT', alertText, inferAlertVariant(alertText))
        }

        // Auto-open Shop Modal when Cardinal provides an active shop with items
        if (nextWorldState.shop && nextWorldState.shop.items.length > 0) {
          setIsShopOpen(true)
        }

        // Auto-open Dice Roll Modal when Cardinal triggers a dice check
        if (nextWorldState.dice_challenge) {
          setPendingDiceChallenge(nextWorldState.dice_challenge)
          setIsDiceModalOpen(true)
        }

        if (parsed.parseWarning) {
          pushAlert('CARDINAL PARSER', parsed.parseWarning, 'warning')
        }

        // Trigger Marriage Modal
        if (nextWorldState.marriage_event_triggered) {
          const partner =
            nextWorldState.marriage_partner ||
            nextWorldState.player.spouse ||
            nextWorldState.characters_in_scene.find((c) => c.is_married)?.name ||
            'Partner'
          setMarriageModalCG(null)
          setMarriageModalPartner(partner)
        }

        // Trigger Event CG (Marriage 100%, or Random Date/Walk/Cozy/Scene)
        if (activeSettings.autoEventImages) {
          const trigger = evaluateEventCGTrigger(userText, parsed.narrative, nextWorldState)
          if (trigger.shouldTrigger) {
            void triggerEventCGInBackground(
              modelMsg.id,
              nextWorldState,
              userText,
              parsed.narrative,
              trigger.eventType,
              activeSettings,
              false
            )
          }
        }
      } catch (err) {
        lastFailedTurnRef.current = { userText, isOpening }
        const msg = err instanceof Error ? err.message : 'ไม่สามารถเชื่อมต่อ Gemini API ได้'
        setErrorMessage(msg)
        pushAlert('SYSTEM ERROR', msg, 'warning')
      } finally {
        setIsLoading(false)
        setStreamingText('')
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null
        }
      }
    },
    [pushAlert, settings, triggerEventCGInBackground]
  )

  const handleRequestSceneImage = (messageId: string) => {
    if (!session || generatingImageMsgId) return
    const targetMsg = session.messages.find((m) => m.id === messageId)
    if (!targetMsg) return
    const stateForMsg = targetMsg.stateSnapshot ?? session.worldState
    const eventType: EventCG['eventType'] = stateForMsg.marriage_event_triggered
      ? 'marriage'
      : 'scene'
    void triggerEventCGInBackground(
      messageId,
      stateForMsg,
      '',
      targetMsg.text,
      eventType,
      settings,
      true
    )
  }

  const handleRetryLastTurn = () => {
    if (!session) return
    const last = lastFailedTurnRef.current
    if (last) {
      void executeTurn(session, last.userText, last.isOpening, { skipAppendUser: true })
    } else if (session.messages.length === 0) {
      void executeTurn(session, '', true)
    } else {
      const lastUser = [...session.messages].reverse().find((m) => m.role === 'user')
      if (lastUser) {
        void executeTurn(session, lastUser.text, false, { skipAppendUser: true })
      }
    }
  }

  const handleEnableDemoFromError = () => {
    const next = { ...settings, demoMode: true }
    setSettings(next)
    saveSettings(next)
    pushAlert('DEMO MODE', 'เปิดโหมดทดลอง (Offline Demo Mode) แล้ว', 'info')
    if (!session) return
    const last = lastFailedTurnRef.current
    if (last) {
      void executeTurn(session, last.userText, last.isOpening, {
        skipAppendUser: true,
        overrideSettings: next,
      })
    } else if (session.messages.length === 0) {
      void executeTurn(session, '', true, { overrideSettings: next })
    }
  }

  const handleCancelRequest = () => {
    abortControllerRef.current?.abort()
  }

  const handleStartNewGame = (profile: PlayerProfile) => {
    const fresh = createInitialSession(profile)
    setSession(fresh)
    setMobileTab('chat')
    pushAlert('LINK START', `กำลังเชื่อมต่อสู่ ${profile.startingArc}...`, 'info')
    void executeTurn(fresh, '', true)
  }

  const handleConfirmTransfer = (transferredSession: GameSession) => {
    setSession(transferredSession)
    setErrorMessage(null)
    setMobileTab('chat')
    pushAlert(
      'WORLD TRANSFER',
      `โอนย้ายเซฟเข้าสู่ ${transferredSession.profile.startingArc} สำเร็จ!`,
      'info'
    )
    void executeTurn(transferredSession, '', true)
  }

  const handleResumeAutoSave = () => {
    const saved = loadAutoSave()
    if (saved) {
      setSession(saved)
      setErrorMessage(null)
      pushAlert('CARDINAL SYSTEM', `โหลดข้อมูลล่าสุดของ ${saved.profile.name} สำเร็จ`, 'info')
    }
  }

  const handleSaveSettings = (next: AppSettings) => {
    setSettings(next)
    saveSettings(next)
    pushAlert('SETTINGS SAVED', `อัปเดตการตั้งค่าเรียบร้อย (${next.demoMode ? 'Demo Mode' : next.model})`, 'info')
  }

  const handleToggleModel = (model: GeminiModel) => {
    const next = { ...settings, model }
    setSettings(next)
    saveSettings(next)
    pushAlert('MODEL SWITCHED', `สลับเป็น ${model}`, 'info')
  }

  const handleToggleFastMode = () => {
    const next = { ...settings, fastMode: !settings.fastMode }
    setSettings(next)
    saveSettings(next)
    pushAlert(
      'SPEED MODE',
      next.fastMode ? 'เปิดโหมดตอบไว (Fast Thinking)' : 'เปิดโหมดคิดลึก (Deep Thinking)',
      'info'
    )
  }

  const handleSaveToSlot = (slotId: string, label: string) => {
    if (!session) return
    const nextSlots = saveToSlot(slotId, label, session)
    setSaveSlots(nextSlots)
    pushAlert('GAME SAVED', `บันทึกข้อมูลลง ${slotId.toUpperCase()} แล้ว`, 'info')
  }

  const handleLoadFromSlot = (slot: SaveSlotMeta) => {
    setSession(slot.session)
    setErrorMessage(null)
    pushAlert('GAME LOADED', `โหลดเซฟ "${slot.label}" เรียบร้อย`, 'info')
  }

  const handleDeleteSlot = (slotId: string) => {
    const nextSlots = deleteSaveSlot(slotId)
    setSaveSlots(nextSlots)
  }

  const handleBuyShopItem = (shopItem: ShopItem, quantity: number) => {
    if (!session) return
    const shop = session.worldState.shop
    if (!shop || quantity <= 0 || shopItem.stock < quantity) return
    const totalCost = shopItem.price * quantity
    if (session.worldState.player.col < totalCost) {
      pushAlert('SHOP ERROR', 'Col ของคุณไม่เพียงพอ', 'warning')
      return
    }

    // Cache the Thai description so Inventory hover displays it immediately
    saveItemToCache(shopItem.name, shopItem.description)

    // Update inventory with purchased item
    const nextInventory = [...session.inventory]
    const existingIdx = nextInventory.findIndex(
      (i) => i.name.toLowerCase() === shopItem.name.toLowerCase()
    )
    if (existingIdx !== -1) {
      nextInventory[existingIdx] = {
        ...nextInventory[existingIdx],
        quantity: nextInventory[existingIdx].quantity + quantity,
        description: nextInventory[existingIdx].description || shopItem.description,
      }
    } else {
      nextInventory.push({
        name: shopItem.name,
        quantity,
        category: shopItem.category ?? 'special',
        description: shopItem.description,
      })
    }

    // Decrement shop stock & player Col
    const nextShopItems = shop.items.map((it) =>
      it.name === shopItem.name ? { ...it, stock: Math.max(0, it.stock - quantity) } : it
    )

    const currency = shop.currency || 'Col'
    const nextSession: GameSession = {
      ...session,
      inventory: nextInventory,
      worldState: {
        ...session.worldState,
        player: {
          ...session.worldState.player,
          col: session.worldState.player.col - totalCost,
        },
        shop: {
          ...shop,
          items: nextShopItems,
        },
      },
      updatedAt: Date.now(),
    }

    setSession(nextSession)
    pushAlert(
      'PURCHASE COMPLETE',
      `ซื้อ ${shopItem.name} x${quantity} สำเร็จ (-${totalCost.toLocaleString()} ${currency})`,
      'info'
    )
  }

  const handleAllocateStat = (stat: StatKey, amount: number) => {
    if (!session || amount <= 0) return
    const currentStats = ensureCharacterStats(
      session.characterStats,
      session.worldState.player.level,
      session.profile.weapon
    )
    if (currentStats.statPoints < amount) return

    const nextStats = {
      attributes: {
        ...currentStats.attributes,
        [stat]: currentStats.attributes[stat] + amount,
      },
      statPoints: currentStats.statPoints - amount,
      spentPoints: currentStats.spentPoints + amount,
    }

    const hpGain = stat === 'VIT' ? amount * HP_PER_VIT : 0
    const nextMaxHp = session.worldState.player.max_hp + hpGain
    const nextHp = Math.min(nextMaxHp, session.worldState.player.hp + hpGain)

    setSession({
      ...session,
      characterStats: nextStats,
      worldState: {
        ...session.worldState,
        player: {
          ...session.worldState.player,
          max_hp: nextMaxHp,
          hp: nextHp,
        },
      },
      updatedAt: Date.now(),
    })
  }

  const handleResetStats = () => {
    if (!session) return
    const currentStats = ensureCharacterStats(
      session.characterStats,
      session.worldState.player.level,
      session.profile.weapon
    )
    if (currentStats.spentPoints <= 0) return

    const oldDerived = computeDerivedStats(currentStats, session.worldState.player.level)
    const freshBase = createInitialStatState(session.profile.weapon)
    const refundedStats = {
      attributes: freshBase.attributes,
      statPoints: currentStats.statPoints + currentStats.spentPoints,
      spentPoints: 0,
    }

    const nextMaxHp = Math.max(250, session.worldState.player.max_hp - oldDerived.vitBonusHp)
    const nextHp = Math.min(nextMaxHp, session.worldState.player.hp)

    setSession({
      ...session,
      characterStats: refundedStats,
      worldState: {
        ...session.worldState,
        player: {
          ...session.worldState.player,
          max_hp: nextMaxHp,
          hp: nextHp,
        },
      },
      updatedAt: Date.now(),
    })
    pushAlert('STATS RESET', `คืนแต้ม Stat ทั้งหมด (${refundedStats.statPoints} แต้ม) แล้ว`, 'info')
  }

  const handleToggleEquip = (itemName: string) => {
    if (!session) return
    const currentEquipped = session.equippedItems ?? [session.profile.weapon]
    const isEquipped = currentEquipped.includes(itemName)
    const nextEquipped = isEquipped
      ? currentEquipped.filter((i) => i !== itemName)
      : [...currentEquipped, itemName]

    setSession({
      ...session,
      equippedItems: nextEquipped,
      updatedAt: Date.now(),
    })
    pushAlert(
      isEquipped ? 'UNEQUIPPED' : 'EQUIPPED',
      isEquipped ? `ถอดอุปกรณ์ ${itemName} แล้ว` : `สวมใส่ ${itemName} แล้ว (มีผลกับโบนัสลูกเต๋า)`,
      'info'
    )
  }

  const handleTriggerManualDice = (actionText: string) => {
    if (!session) return
    const challenge = buildDiceChallengeFromAction(actionText, session.worldState)
    setPendingDiceChallenge(challenge)
    setIsDiceModalOpen(true)
  }

  const handleResolveDiceRoll = (resolution: DiceRollResolution) => {
    if (!session) return
    setPendingDiceChallenge(null)
    setIsDiceModalOpen(false)
    pushAlert(
      resolution.outcome,
      `ผลทอย ${resolution.total} (1d20=${resolution.d20}) vs DC ${resolution.dc}`,
      resolution.outcome.includes('SUCCESS') ? 'affection' : 'warning'
    )
    void executeTurn(session, resolution.promptText, false)
  }

  return (
    <div className="min-h-screen text-slate-100">
      <SystemAlertOverlay
        alerts={alerts}
        onDismiss={(id) => setAlerts((prev) => prev.filter((a) => a.id !== id))}
      />

      {!session ? (
        <LinkStartScreen
          settings={settings}
          hasAutoSave={hasAutoSave}
          hasAnySaves={hasAutoSave || saveSlots.length > 0}
          onStartNewGame={handleStartNewGame}
          onResumeAutoSave={handleResumeAutoSave}
          onOpenTransfer={() => setIsTransferOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
      ) : (
        <div className="flex min-h-screen flex-col">
          <TopStatusHud
            session={session}
            model={settings.model}
            fastMode={settings.fastMode}
            demoMode={settings.demoMode}
            onToggleModel={handleToggleModel}
            onToggleFastMode={handleToggleFastMode}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onExitToTitle={() => {
              abortControllerRef.current?.abort()
              setSession(null)
            }}
          />

          {/* Mobile Tab Bar */}
          <div className="mx-auto mt-3 flex w-full max-w-[1440px] gap-2 px-3 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileTab('chat')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-bold ${
                mobileTab === 'chat'
                  ? 'border-cyan-300 bg-cyan-400/20 text-white'
                  : 'border-white/15 bg-slate-900/60 text-slate-300'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              เนื้อเรื่อง (Roleplay)
            </button>
            <button
              type="button"
              onClick={() => setMobileTab('hud')}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-bold ${
                mobileTab === 'hud'
                  ? 'border-cyan-300 bg-cyan-400/20 text-white'
                  : 'border-white/15 bg-slate-900/60 text-slate-300'
              }`}
            >
              <Users className="h-4 w-4" />
              ความสัมพันธ์ &amp; กระเป๋า ({Object.keys(session.knownCharacters).length})
            </button>
          </div>

          {/* Main Workspace Grid */}
          <main className="mx-auto grid w-full max-w-[1440px] flex-1 gap-4 p-3 sm:p-5 lg:grid-cols-12">
            {/* Left/Center: Roleplay Chat Panel */}
            <section
              className={`lg:col-span-7 xl:col-span-8 ${
                mobileTab === 'chat' ? 'block' : 'hidden lg:block'
              } h-[calc(100vh-145px)] min-h-[520px]`}
            >
              <ChatPanel
                messages={session.messages}
                playerName={session.profile.name}
                isLoading={isLoading}
                streamingText={streamingText}
                elapsedSeconds={elapsedSeconds}
                generatingImageMsgId={generatingImageMsgId}
                activeShop={session.worldState.shop}
                pendingDiceChallenge={pendingDiceChallenge}
                errorMessage={errorMessage}
                onSendMessage={(txt) => void executeTurn(session, txt, false)}
                onTriggerManualDice={handleTriggerManualDice}
                onOpenPendingDice={() => setIsDiceModalOpen(true)}
                onCancelRequest={handleCancelRequest}
                onRetry={handleRetryLastTurn}
                onEnableDemoMode={handleEnableDemoFromError}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenShop={() => setIsShopOpen(true)}
                onRequestSceneImage={handleRequestSceneImage}
              />
            </section>

            {/* Right: Relationship + Inventory & Party */}
            <aside
              className={`space-y-4 lg:col-span-5 xl:col-span-4 ${
                mobileTab === 'hud' ? 'block' : 'hidden lg:block'
              }`}
            >
              <RelationshipPanel
                knownCharacters={session.knownCharacters}
                inSceneNames={session.worldState.characters_in_scene.map((c) => c.name)}
                partyMembers={session.partyMembers}
                inventory={session.inventory}
                isLoading={isLoading}
                onQuickAction={(prompt) => {
                  setMobileTab('chat')
                  void executeTurn(session, prompt, false)
                }}
              />

              <InventoryPanel
                session={session}
                settings={settings}
                isLoading={isLoading}
                onQuickAction={(prompt) => {
                  setMobileTab('chat')
                  void executeTurn(session, prompt, false)
                }}
                onToggleEquip={handleToggleEquip}
              />

              <StatPanel
                stats={session.characterStats}
                level={session.worldState.player.level}
                weapon={session.profile.weapon}
                onAllocateStat={handleAllocateStat}
                onResetStats={handleResetStats}
              />
            </aside>
          </main>
        </div>
      )}

      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          currentSession={session}
          saveSlots={saveSlots}
          onSaveSettings={handleSaveSettings}
          onSaveToSlot={handleSaveToSlot}
          onLoadFromSlot={handleLoadFromSlot}
          onDeleteSlot={handleDeleteSlot}
          onOpenTransfer={() => setIsTransferOpen(true)}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isTransferOpen && (
        <ArcTransferModal
          currentSession={session}
          autoSaveSession={loadAutoSave()}
          saveSlots={saveSlots}
          onConfirmTransfer={handleConfirmTransfer}
          onClose={() => setIsTransferOpen(false)}
        />
      )}

      {isDiceModalOpen && pendingDiceChallenge && session && (
        <DiceRollModal
          challenge={pendingDiceChallenge}
          stats={ensureCharacterStats(
            session.characterStats,
            session.worldState.player.level,
            session.profile.weapon
          )}
          equippedItems={session.equippedItems ?? [session.profile.weapon]}
          onConfirmResolution={handleResolveDiceRoll}
          onClose={() => setIsDiceModalOpen(false)}
        />
      )}

      {isShopOpen && session?.worldState.shop && (
        <ShopModal
          shop={session.worldState.shop}
          playerCol={session.worldState.player.col}
          onBuyItem={handleBuyShopItem}
          onClose={() => setIsShopOpen(false)}
        />
      )}

      {marriageModalPartner && session && (
        <MarriageModal
          partnerName={marriageModalPartner}
          playerName={session.profile.name}
          sharedHome={session.sharedHome}
          marriageCG={marriageModalCG}
          isGeneratingCG={Boolean(generatingImageMsgId)}
          onClose={() => {
            setMarriageModalPartner(null)
            setMarriageModalCG(null)
          }}
        />
      )}
    </div>
  )
}

export default App
