import type { ChromaticGemId } from './chromatic'

export type ChromaticThemePreviewDefinition = {
  id: ChromaticGemId
  label: string
  description: string
  className: string
}

export const DEFAULT_CHROMATIC_THEME_PREVIEW: ChromaticGemId = 'sapphire'

export const CHROMATIC_THEME_PREVIEWS: readonly ChromaticThemePreviewDefinition[] = [
  {
    id: 'sapphire',
    label: 'Zafiro',
    description: 'Azul cian cristalino',
    className: 'is-sapphire',
  },
  {
    id: 'emerald',
    label: 'Esmeralda',
    description: 'Verde mineral luminoso',
    className: 'is-emerald',
  },
  {
    id: 'yellow',
    label: 'Amarilla',
    description: 'Dorado eléctrico',
    className: 'is-yellow',
  },
  {
    id: 'orange',
    label: 'Naranja',
    description: 'Ámbar térmico',
    className: 'is-orange',
  },
  {
    id: 'red',
    label: 'Roja',
    description: 'Rojo de sobrecarga',
    className: 'is-red',
  },
]

export const CHROMATIC_THEME_PREVIEW_EVENT =
  'incremental-game-a:developer-theme-preview'

export type ChromaticThemePreviewDetail = {
  theme: ChromaticGemId
}

export function applyDeveloperChromaticTheme(theme: ChromaticGemId) {
  document.documentElement.dataset.developerChromaticTheme = theme
  document.dispatchEvent(
    new CustomEvent<ChromaticThemePreviewDetail>(
      CHROMATIC_THEME_PREVIEW_EVENT,
      { detail: { theme } },
    ),
  )
}

export function clearDeveloperChromaticTheme() {
  delete document.documentElement.dataset.developerChromaticTheme
}
