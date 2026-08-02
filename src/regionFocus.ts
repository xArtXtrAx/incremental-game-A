export const REGION_FOCUS_EVENT = 'incremental-game-a:region-focus'

export type GameRegion = 'core' | 'upgrades'

export type RegionFocusDetail = {
  region: GameRegion
  source: 'gamepad' | 'navigation'
}

export function announceRegionFocus(
  region: GameRegion,
  source: RegionFocusDetail['source'] = 'navigation',
) {
  document.dispatchEvent(
    new CustomEvent<RegionFocusDetail>(REGION_FOCUS_EVENT, {
      detail: { region, source },
    }),
  )
}
