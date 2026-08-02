import { useEffect } from 'react'
import './RegionFocusGuide.css'
import {
  REGION_FOCUS_EVENT,
  type GameRegion,
  type RegionFocusDetail,
} from './regionFocus'

type RegionElements = Record<GameRegion, HTMLElement | null>
type HighlightSource = 'pointer' | 'navigation'

const REGION_CLASS = 'is-region-highlighted'
const POINTER_CLASS = 'is-pointer-region'
const NAVIGATION_CLASS = 'is-navigation-region'

function getRegionElements(): RegionElements {
  return {
    core: document.querySelector<HTMLElement>('.core-layout-section'),
    upgrades: document.querySelector<HTMLElement>('.upgrades-layout-section'),
  }
}

export function RegionFocusGuide() {
  useEffect(() => {
    const elements = getRegionElements()
    let navigationRegion: GameRegion | null = null
    let activeRegion: GameRegion | null = null
    let activeSource: HighlightSource | null = null

    function applyHighlight() {
      for (const region of ['core', 'upgrades'] as const) {
        const element = elements[region]
        if (!element) continue

        const isActive = region === activeRegion
        element.classList.toggle(REGION_CLASS, isActive)
        element.classList.toggle(
          POINTER_CLASS,
          isActive && activeSource === 'pointer',
        )
        element.classList.toggle(
          NAVIGATION_CLASS,
          isActive && activeSource === 'navigation',
        )
      }
    }

    function setNavigationRegion(region: GameRegion) {
      navigationRegion = region
      activeRegion = region
      activeSource = 'navigation'
      applyHighlight()
    }

    function handleRegionFocus(event: Event) {
      const detail = (event as CustomEvent<RegionFocusDetail>).detail
      if (!detail) return
      setNavigationRegion(detail.region)
    }

    const cleanups: Array<() => void> = []

    for (const region of ['core', 'upgrades'] as const) {
      const element = elements[region]
      if (!element) continue

      const handlePointerEnter = () => {
        activeRegion = region
        activeSource = 'pointer'
        applyHighlight()
      }
      const handlePointerLeave = () => {
        if (activeSource !== 'pointer' || activeRegion !== region) return

        activeRegion = navigationRegion
        activeSource = navigationRegion ? 'navigation' : null
        applyHighlight()
      }
      const handleFocusIn = () => setNavigationRegion(region)

      element.addEventListener('pointerenter', handlePointerEnter)
      element.addEventListener('pointerleave', handlePointerLeave)
      element.addEventListener('focusin', handleFocusIn)

      cleanups.push(() => {
        element.removeEventListener('pointerenter', handlePointerEnter)
        element.removeEventListener('pointerleave', handlePointerLeave)
        element.removeEventListener('focusin', handleFocusIn)
      })
    }

    document.addEventListener(REGION_FOCUS_EVENT, handleRegionFocus)

    return () => {
      document.removeEventListener(REGION_FOCUS_EVENT, handleRegionFocus)
      cleanups.forEach((cleanup) => cleanup())
      Object.values(elements).forEach((element) => {
        element?.classList.remove(
          REGION_CLASS,
          POINTER_CLASS,
          NAVIGATION_CLASS,
        )
      })
    }
  }, [])

  return null
}
