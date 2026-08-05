export const DEVELOPER_PANEL_WIDTH_STORAGE_KEY =
  'incremental-game-a:developer-panel-width:v1'

export const DEVELOPER_PANEL_MIN_WIDTH = 400
export const DEVELOPER_PANEL_MAX_WIDTH = 760
export const DEVELOPER_PANEL_DEFAULT_MAX_WIDTH = 640
export const DEVELOPER_PANEL_COMPACT_WIDTH = 440
export const DEVELOPER_PANEL_WIDE_WIDTH = 640
export const DEVELOPER_PANEL_GAME_MIN_WIDTH = 760
export const DEVELOPER_PANEL_WORKSPACE_GAP = 18
export const DEVELOPER_PANEL_VIEWPORT_PADDING = 48
export const DEVELOPER_PANEL_DESKTOP_BREAKPOINT = 1280
export const DEVELOPER_PANEL_KEYBOARD_STEP = 16

export type DeveloperPanelWidthPreset = 'compact' | 'normal' | 'wide'

export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum)
}

export function isDeveloperPanelDesktop(viewportWidth: number) {
  return viewportWidth > DEVELOPER_PANEL_DESKTOP_BREAKPOINT
}

export function getDefaultDeveloperPanelWidth(viewportWidth: number) {
  const responsiveDefault = Math.round(viewportWidth * 0.33)
  return clamp(
    responsiveDefault,
    DEVELOPER_PANEL_MIN_WIDTH,
    DEVELOPER_PANEL_DEFAULT_MAX_WIDTH,
  )
}

export function getMaximumDeveloperPanelWidth(viewportWidth: number) {
  if (!Number.isFinite(viewportWidth)) {
    return DEVELOPER_PANEL_DEFAULT_MAX_WIDTH
  }

  const available = Math.floor(
    viewportWidth -
      DEVELOPER_PANEL_GAME_MIN_WIDTH -
      DEVELOPER_PANEL_WORKSPACE_GAP -
      DEVELOPER_PANEL_VIEWPORT_PADDING,
  )

  return clamp(
    available,
    DEVELOPER_PANEL_MIN_WIDTH,
    DEVELOPER_PANEL_MAX_WIDTH,
  )
}

export function clampDeveloperPanelWidth(
  width: number,
  viewportWidth: number,
) {
  const fallback = getDefaultDeveloperPanelWidth(viewportWidth)
  const safeWidth = Number.isFinite(width) ? Math.round(width) : fallback

  return clamp(
    safeWidth,
    DEVELOPER_PANEL_MIN_WIDTH,
    getMaximumDeveloperPanelWidth(viewportWidth),
  )
}

export function getDeveloperPanelPresetWidth(
  preset: DeveloperPanelWidthPreset,
  viewportWidth: number,
) {
  const requested =
    preset === 'compact'
      ? DEVELOPER_PANEL_COMPACT_WIDTH
      : preset === 'wide'
        ? DEVELOPER_PANEL_WIDE_WIDTH
        : getDefaultDeveloperPanelWidth(viewportWidth)

  return clampDeveloperPanelWidth(requested, viewportWidth)
}

export function parseDeveloperPanelWidthPreference(value: unknown) {
  if (typeof value !== 'string' || value.trim() === '') return null

  const parsed = Number(value)
  if (
    !Number.isFinite(parsed) ||
    !Number.isInteger(parsed) ||
    parsed < DEVELOPER_PANEL_MIN_WIDTH ||
    parsed > DEVELOPER_PANEL_MAX_WIDTH
  ) {
    return null
  }

  return parsed
}

export function readDeveloperPanelWidthPreference(storage: StorageLike) {
  try {
    return parseDeveloperPanelWidthPreference(
      storage.getItem(DEVELOPER_PANEL_WIDTH_STORAGE_KEY),
    )
  } catch {
    return null
  }
}

export function writeDeveloperPanelWidthPreference(
  storage: StorageLike,
  width: number,
) {
  const parsed = parseDeveloperPanelWidthPreference(String(Math.round(width)))
  if (parsed === null) return false

  try {
    storage.setItem(DEVELOPER_PANEL_WIDTH_STORAGE_KEY, String(parsed))
    return true
  } catch {
    return false
  }
}

export function clearDeveloperPanelWidthPreference(storage: StorageLike) {
  try {
    storage.removeItem(DEVELOPER_PANEL_WIDTH_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}
