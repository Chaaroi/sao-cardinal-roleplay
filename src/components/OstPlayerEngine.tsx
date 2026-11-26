import { useEffect, useRef } from 'react'
import type { OstTrack } from '../data/saoOstCatalog'

interface YTPlayerInstance {
  loadVideoById: (options: { videoId: string; startSeconds?: number }) => void
  playVideo: () => void
  pauseVideo: () => void
  setVolume: (volume: number) => void
  unMute: () => void
  getPlayerState: () => number
  destroy: () => void
}

interface YTNamespace {
  Player: new (
    elementId: string | HTMLElement,
    options: {
      height?: string | number
      width?: string | number
      videoId?: string
      playerVars?: Record<string, string | number>
      events?: {
        onReady?: () => void
        onStateChange?: (event: { data: number }) => void
        onError?: () => void
      }
    }
  ) => YTPlayerInstance
  PlayerState: {
    ENDED: number
    PLAYING: number
    PAUSED: number
    BUFFERING: number
  }
}

declare global {
  interface Window {
    YT?: YTNamespace
    onYouTubeIframeAPIReady?: () => void
  }
}

let ytApiPromise: Promise<YTNamespace> | null = null

function loadYouTubeIframeApi(): Promise<YTNamespace> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('No window'))
  }
  if (window.YT?.Player) {
    return Promise.resolve(window.YT)
  }
  if (ytApiPromise) return ytApiPromise

  ytApiPromise = new Promise<YTNamespace>((resolve) => {
    const prevCallback = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      prevCallback?.()
      if (window.YT) {
        resolve(window.YT)
      }
    }

    const existingScript = document.querySelector('script[src*="youtube.com/iframe_api"]')
    if (!existingScript) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      tag.async = true
      document.head.appendChild(tag)
    } else {
      const poll = setInterval(() => {
        if (window.YT?.Player) {
          clearInterval(poll)
          resolve(window.YT)
        }
      }, 100)
    }
  })

  return ytApiPromise
}

interface OstPlayerEngineProps {
  enabled: boolean
  volume: number
  track: OstTrack
  onPlayingChange: (isPlaying: boolean) => void
  onErrorSkip: () => void
}

export function OstPlayerEngine({
  enabled,
  volume,
  track,
  onPlayingChange,
  onErrorSkip,
}: OstPlayerEngineProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const playerRef = useRef<YTPlayerInstance | null>(null)
  const isReadyRef = useRef(false)
  const loadedVideoIdRef = useRef<string | null>(null)
  const isPlayingRef = useRef(false)

  const latestPropsRef = useRef({ enabled, volume, track, onPlayingChange, onErrorSkip })
  latestPropsRef.current = { enabled, volume, track, onPlayingChange, onErrorSkip }

  // Initialize YouTube IFrame Player once
  useEffect(() => {
    let mounted = true
    void loadYouTubeIframeApi().then((YT) => {
      if (!mounted || !containerRef.current || playerRef.current) return

      playerRef.current = new YT.Player(containerRef.current, {
        width: 240,
        height: 135,
        videoId: latestPropsRef.current.track.videoId,
        playerVars: {
          autoplay: latestPropsRef.current.enabled ? 1 : 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            if (!mounted || !playerRef.current) return
            isReadyRef.current = true
            loadedVideoIdRef.current = latestPropsRef.current.track.videoId
            playerRef.current.unMute()
            playerRef.current.setVolume(latestPropsRef.current.volume)
            if (latestPropsRef.current.enabled) {
              playerRef.current.playVideo()
            } else {
              playerRef.current.pauseVideo()
            }
          },
          onStateChange: (event) => {
            if (!mounted) return
            if (event.data === YT.PlayerState.PLAYING) {
              isPlayingRef.current = true
              latestPropsRef.current.onPlayingChange(true)
            } else if (event.data === YT.PlayerState.PAUSED) {
              isPlayingRef.current = false
              latestPropsRef.current.onPlayingChange(false)
            } else if (event.data === YT.PlayerState.ENDED) {
              isPlayingRef.current = false
              if (latestPropsRef.current.enabled && playerRef.current) {
                playerRef.current.playVideo()
              }
            }
          },
          onError: () => {
            if (!mounted) return
            if (latestPropsRef.current.enabled) {
              latestPropsRef.current.onErrorSkip()
            }
          },
        },
      })
    })

    return () => {
      mounted = false
      playerRef.current?.destroy()
      playerRef.current = null
      isReadyRef.current = false
      loadedVideoIdRef.current = null
    }
  }, [])

  // Respond to enabled / track changes
  useEffect(() => {
    const player = playerRef.current
    if (!player || !isReadyRef.current) return

    if (!enabled) {
      player.pauseVideo()
      isPlayingRef.current = false
      onPlayingChange(false)
      return
    }

    player.unMute()
    player.setVolume(volume)
    if (loadedVideoIdRef.current !== track.videoId) {
      loadedVideoIdRef.current = track.videoId
      player.loadVideoById({ videoId: track.videoId, startSeconds: 0 })
    } else {
      player.playVideo()
    }
  }, [enabled, track.videoId, onPlayingChange, volume])

  // Respond to volume slider
  useEffect(() => {
    const player = playerRef.current
    if (!player || !isReadyRef.current) return
    player.setVolume(volume)
  }, [volume])

  // Unlock browser autoplay restriction smoothly on first user interaction when OST is enabled
  useEffect(() => {
    if (!enabled) return
    const unlockOnGesture = () => {
      const player = playerRef.current
      if (!player || !isReadyRef.current || isPlayingRef.current) return
      player.unMute()
      player.setVolume(latestPropsRef.current.volume)
      player.playVideo()
    }
    window.addEventListener('pointerdown', unlockOnGesture, { capture: true, passive: true })
    window.addEventListener('keydown', unlockOnGesture, { capture: true, passive: true })
    return () => {
      window.removeEventListener('pointerdown', unlockOnGesture, true)
      window.removeEventListener('keydown', unlockOnGesture, true)
    }
  }, [enabled])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed -bottom-48 -left-48 h-1 w-1 overflow-hidden opacity-0"
    >
      <div ref={containerRef} />
    </div>
  )
}
