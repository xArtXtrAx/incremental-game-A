export const CHROMATIC_REQUIRED_SAPPHIRE_LEVEL = 5
export const CHROMATIC_OPEN_EVENT = 'incremental-game-a:chromatic-open'
export const CHROMATIC_CLOSE_EVENT = 'incremental-game-a:chromatic-close'
export const CHROMATIC_PREVIOUS_GEM_EVENT =
  'incremental-game-a:chromatic-previous-gem'
export const CHROMATIC_NEXT_GEM_EVENT =
  'incremental-game-a:chromatic-next-gem'

export type ChromaticOpenMode = 'normal' | 'developer-preview'

export type ChromaticOpenDetail = {
  mode: ChromaticOpenMode
}

export type ChromaticGemId =
  | 'sapphire'
  | 'emerald'
  | 'yellow'
  | 'orange'
  | 'red'

export type ChromaticGemDefinition = {
  id: ChromaticGemId
  name: string
  className: string
  status: string
}

export const CHROMATIC_GEMS: readonly ChromaticGemDefinition[] = [
  {
    id: 'sapphire',
    name: 'Zafiro',
    className: 'is-sapphire',
    status: 'Primera órbita',
  },
  {
    id: 'emerald',
    name: 'Esmeralda',
    className: 'is-emerald',
    status: 'Siguiente resonancia',
  },
  {
    id: 'yellow',
    name: 'Gema amarilla',
    className: 'is-yellow',
    status: 'Espectro bloqueado',
  },
  {
    id: 'orange',
    name: 'Gema naranja',
    className: 'is-orange',
    status: 'Espectro bloqueado',
  },
  {
    id: 'red',
    name: 'Gema roja',
    className: 'is-red',
    status: 'Espectro bloqueado',
  },
]

function dispatchChromaticOpen(mode: ChromaticOpenMode) {
  document.dispatchEvent(
    new CustomEvent<ChromaticOpenDetail>(CHROMATIC_OPEN_EVENT, {
      detail: { mode },
    }),
  )
}

export function requestChromaticOpen() {
  dispatchChromaticOpen('normal')
}

export function requestChromaticDeveloperPreview() {
  dispatchChromaticOpen('developer-preview')
}

export function requestChromaticClose() {
  document.dispatchEvent(new Event(CHROMATIC_CLOSE_EVENT))
}

export function requestPreviousChromaticGem() {
  document.dispatchEvent(new Event(CHROMATIC_PREVIOUS_GEM_EVENT))
}

export function requestNextChromaticGem() {
  document.dispatchEvent(new Event(CHROMATIC_NEXT_GEM_EVENT))
}
