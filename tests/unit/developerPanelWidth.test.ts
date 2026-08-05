import { describe, expect, it } from 'vitest'
import {
  DEVELOPER_PANEL_MAX_WIDTH,
  DEVELOPER_PANEL_MIN_WIDTH,
  DEVELOPER_PANEL_WIDTH_STORAGE_KEY,
  clampDeveloperPanelWidth,
  clearDeveloperPanelWidthPreference,
  getDefaultDeveloperPanelWidth,
  getDeveloperPanelPresetWidth,
  getMaximumDeveloperPanelWidth,
  isDeveloperPanelDesktop,
  parseDeveloperPanelWidthPreference,
  readDeveloperPanelWidthPreference,
  writeDeveloperPanelWidthPreference,
} from '../../src/developerPanelWidth'

function createMemoryStorage(initial?: Record<string, string>) {
  const values = new Map(Object.entries(initial ?? {}))
  return {
    getItem(key: string) {
      return values.get(key) ?? null
    },
    setItem(key: string, value: string) {
      values.set(key, value)
    },
    removeItem(key: string) {
      values.delete(key)
    },
    snapshot() {
      return new Map(values)
    },
  }
}

describe('anchura configurable del Panel DEV', () => {
  it('conserva el valor predeterminado responsive dentro de 400–640 px', () => {
    expect(getDefaultDeveloperPanelWidth(1000)).toBe(400)
    expect(getDefaultDeveloperPanelWidth(1600)).toBe(528)
    expect(getDefaultDeveloperPanelWidth(1920)).toBe(634)
    expect(getDefaultDeveloperPanelWidth(2560)).toBe(640)
  })

  it('reserva 760 px para el juego y limita el panel a 760 px', () => {
    expect(getMaximumDeveloperPanelWidth(1281)).toBe(455)
    expect(getMaximumDeveloperPanelWidth(1600)).toBe(760)
    expect(getMaximumDeveloperPanelWidth(2560)).toBe(DEVELOPER_PANEL_MAX_WIDTH)
  })

  it('aplica mínimo, máximo dinámico y redondeo', () => {
    expect(clampDeveloperPanelWidth(300, 1600)).toBe(
      DEVELOPER_PANEL_MIN_WIDTH,
    )
    expect(clampDeveloperPanelWidth(527.7, 1600)).toBe(528)
    expect(clampDeveloperPanelWidth(900, 1600)).toBe(760)
    expect(clampDeveloperPanelWidth(700, 1281)).toBe(455)
  })

  it('usa el valor normal como predeterminado y limita presets al viewport', () => {
    expect(getDeveloperPanelPresetWidth('compact', 1600)).toBe(440)
    expect(getDeveloperPanelPresetWidth('normal', 1600)).toBe(528)
    expect(getDeveloperPanelPresetWidth('wide', 1600)).toBe(640)
    expect(getDeveloperPanelPresetWidth('wide', 1281)).toBe(455)
  })

  it('activa el redimensionamiento solo sobre 1280 px', () => {
    expect(isDeveloperPanelDesktop(1280)).toBe(false)
    expect(isDeveloperPanelDesktop(1281)).toBe(true)
  })

  it('acepta únicamente preferencias enteras dentro del rango global', () => {
    expect(parseDeveloperPanelWidthPreference('400')).toBe(400)
    expect(parseDeveloperPanelWidthPreference('760')).toBe(760)
    expect(parseDeveloperPanelWidthPreference('399')).toBeNull()
    expect(parseDeveloperPanelWidthPreference('761')).toBeNull()
    expect(parseDeveloperPanelWidthPreference('528.5')).toBeNull()
    expect(parseDeveloperPanelWidthPreference('Infinity')).toBeNull()
    expect(parseDeveloperPanelWidthPreference('')).toBeNull()
  })

  it('lee, escribe y elimina la preferencia sin mezclarla con la partida', () => {
    const storage = createMemoryStorage()

    expect(readDeveloperPanelWidthPreference(storage)).toBeNull()
    expect(writeDeveloperPanelWidthPreference(storage, 612)).toBe(true)
    expect(readDeveloperPanelWidthPreference(storage)).toBe(612)
    expect(storage.snapshot().get(DEVELOPER_PANEL_WIDTH_STORAGE_KEY)).toBe(
      '612',
    )
    expect(clearDeveloperPanelWidthPreference(storage)).toBe(true)
    expect(readDeveloperPanelWidthPreference(storage)).toBeNull()
  })

  it('ignora preferencias corruptas', () => {
    const storage = createMemoryStorage({
      [DEVELOPER_PANEL_WIDTH_STORAGE_KEY]: '{ancho roto}',
    })

    expect(readDeveloperPanelWidthPreference(storage)).toBeNull()
  })

  it('tolera bloqueos del almacenamiento sin propagar excepciones', () => {
    const storage = {
      getItem() {
        throw new Error('blocked')
      },
      setItem() {
        throw new Error('blocked')
      },
      removeItem() {
        throw new Error('blocked')
      },
    }

    expect(readDeveloperPanelWidthPreference(storage)).toBeNull()
    expect(writeDeveloperPanelWidthPreference(storage, 528)).toBe(false)
    expect(clearDeveloperPanelWidthPreference(storage)).toBe(false)
  })
})
