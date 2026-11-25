import { useEffect, useState } from 'react'
import { getCachedPortraitUrl, resolveCharacterPortrait } from '../services/portraitService'

interface CharacterAvatarProps {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  ringClassName?: string
}

const SIZE_CLASSES: Record<NonNullable<CharacterAvatarProps['size']>, string> = {
  xs: 'h-5 w-5 text-[9px]',
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-11 w-11 text-sm',
  lg: 'h-16 w-16 text-lg',
}

const AVATAR_PALETTES = [
  'from-cyan-500/40 to-sky-700/60 text-cyan-100',
  'from-pink-500/40 to-rose-700/60 text-pink-100',
  'from-amber-500/40 to-orange-700/60 text-amber-100',
  'from-indigo-500/40 to-purple-700/60 text-indigo-100',
  'from-emerald-500/40 to-teal-700/60 text-emerald-100',
]

function getPaletteForName(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length]
}

export function CharacterAvatar({
  name,
  size = 'md',
  ringClassName = 'border-cyan-300/60',
}: CharacterAvatarProps) {
  const [url, setUrl] = useState<string | null>(() => getCachedPortraitUrl(name))
  const [imgFailed, setImgFailed] = useState(false)

  useEffect(() => {
    setImgFailed(false)
    const cached = getCachedPortraitUrl(name)
    if (cached) {
      setUrl(cached)
      return
    }
    let cancelled = false
    void resolveCharacterPortrait(name).then((found) => {
      if (!cancelled && found) {
        setUrl(found)
      }
    })
    return () => {
      cancelled = true
    }
  }, [name])

  const initial = (name.trim()[0] || '?').toUpperCase()
  const sizeClass = SIZE_CLASSES[size]

  if (url && !imgFailed) {
    return (
      <img
        src={url}
        alt={name}
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className={`${sizeClass} shrink-0 rounded-full border-2 object-cover object-top shadow-sm ${ringClassName}`}
      />
    )
  }

  return (
    <div
      className={`${sizeClass} font-hud flex shrink-0 items-center justify-center rounded-full border-2 bg-gradient-to-br font-bold shadow-sm ${getPaletteForName(name)} ${ringClassName}`}
      title={name}
    >
      {initial}
    </div>
  )
}
