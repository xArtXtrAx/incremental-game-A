import { readFile } from 'node:fs/promises'
import { expect, test, type Locator, type Page } from '@playwright/test'

const GAME_STORAGE_KEY = 'incremental-game-a:save:v1'
const PROFILE_STORAGE_KEY = 'incremental-game-a:balance-dev-profiles:v2'

async function installDriftingGamepad(page: Page) {
  await page.addInitScript(() => {
    const buttons = Array.from({ length: 18 }, () => ({
      pressed: false,
      touched: false,
      value: 0,
    }))
    const gamepad = {
      axes: [0.8, 0, 0, 0],
      buttons,
      connected: true,
      id: 'DualSense mock con deriva',
      index: 0,
      mapping: 'standard',
      timestamp: 1,
    } as unknown as Gamepad

    Object.defineProperty(navigator, 'getGamepads', {
      configurable: true,
      value: () => [gamepad],
    })
  })
}

async function openCleanGame(page: Page) {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
}

async function closeDialog(dialog: Locator) {
  await dialog.getByRole('button', { name: 'Cerrar', exact: true }).click()
  await expect(dialog).toBeHidden()
}

async function openTemplates(page: Page) {
  await page
    .getByRole('button', { name: /Plantillas Matemáticas/ })
    .first()
    .click()
  return page.getByRole('dialog', {
    name: 'Plantillas Matemáticas Seguras',
  })
}

test.describe('Fase 6 · Plantillas Matemáticas Seguras', () => {
  test('crea, previsualiza, exporta, importa, guarda y compara un borrador sin alterar el runtime', async ({
    page,
  }) => {
    await openCleanGame(page)
    const normalSave = await page.evaluate(
      (key) => localStorage.getItem(key),
      GAME_STORAGE_KEY,
    )

    const dialog = await openTemplates(page)
    await expect(dialog.getByTestId('mathematical-template-preview')).toBeVisible()
    await expect(
      dialog.getByTestId('mathematical-template-preview').getByRole('row'),
    ).toHaveCount(10)

    await dialog.getByLabel('Nombre de la plantilla').fill('Costos lineales E2E')
    await dialog.getByLabel('Intercepto').fill('100')
    await dialog.getByLabel('Pendiente').fill('100')

    const preview = dialog.getByTestId('mathematical-template-preview')
    await expect(preview.getByRole('row', { name: /Amplificador de pulso/ })).toContainText(
      '100',
    )
    await expect(preview.getByRole('row', { name: /Gatillo de pulso/ })).toContainText(
      '900',
    )

    const exportPromise = page.waitForEvent('download')
    await dialog.getByRole('button', { name: 'Exportar JSON' }).click()
    const download = await exportPromise
    const path = await download.path()
    expect(path).not.toBeNull()
    const exportedText = await readFile(path ?? '', 'utf8')
    const exported = JSON.parse(exportedText)
    expect(exported.specification.name).toBe('Costos lineales E2E')
    expect(exported.specification.template).toEqual({
      kind: 'linear',
      intercept: 100,
      slope: 100,
    })

    await dialog.getByLabel('Tipo de plantilla').selectOption('exponential')
    await expect(dialog.getByLabel('Tipo de plantilla')).toHaveValue('exponential')
    await dialog.getByLabel('JSON de plantilla matemática').fill(exportedText)
    await dialog.getByRole('button', { name: 'Importar y validar' }).click()
    await expect(dialog.getByLabel('Tipo de plantilla')).toHaveValue('linear')
    await expect(dialog.getByText('Especificación importada y reevaluada desde cero.')).toBeVisible()

    await dialog.getByRole('button', { name: 'Guardar como perfil DEV' }).click()
    await dialog.getByTestId('confirm-template-profile-save').click()
    await expect(
      dialog.getByText(/Perfil “Costos lineales E2E” guardado sin aplicarlo/),
    ).toBeVisible()

    await dialog.getByRole('button', { name: 'Abrir Comparador A/B' }).click()
    const comparator = page.getByRole('dialog', {
      name: 'Comparador de Experimentos A/B',
    })
    await expect(comparator).toBeVisible()
    await comparator
      .getByLabel('Perfil B')
      .selectOption({ label: 'Costos lineales E2E' })
    await comparator.getByLabel('Límite temporal').selectOption({ label: '5 min' })
    await comparator.getByTestId('comparative-run').click()
    await expect(comparator.getByTestId('comparative-results')).toBeVisible()
    await expect(comparator.getByText(/Comparación terminada:/)).toBeVisible()

    expect(
      await page.evaluate((key) => localStorage.getItem(key), GAME_STORAGE_KEY),
    ).toBe(normalSave)

    await closeDialog(comparator)
    await page.getByRole('button', { name: /Laboratorio de Balance/ }).click()
    const laboratory = page.getByRole('dialog', {
      name: 'Laboratorio de Balance',
    })
    await expect(laboratory.getByText(/Runtime activo: official/)).toBeVisible()
  })

  test('un DualSense con deriva no roba el foco de desplegables ni campos del modal', async ({
    page,
  }) => {
    await installDriftingGamepad(page)
    await openCleanGame(page)

    const dialog = await openTemplates(page)
    const destination = dialog.getByLabel('Destino matemático')
    await destination.focus()
    await page.waitForTimeout(650)
    await expect(destination).toBeFocused()

    await destination.selectOption('cost-growth-series')
    await expect(destination).toHaveValue('cost-growth-series')

    const name = dialog.getByLabel('Nombre de la plantilla')
    await name.fill('Plantilla editable con DualSense')
    await page.waitForTimeout(650)
    await expect(name).toBeFocused()
    await expect(name).toHaveValue('Plantilla editable con DualSense')
  })

  test('envía el BalanceConfig al borrador del Laboratorio sin aplicarlo a la sesión', async ({
    page,
  }) => {
    await openCleanGame(page)
    const normalSave = await page.evaluate(
      (key) => localStorage.getItem(key),
      GAME_STORAGE_KEY,
    )

    const templates = await openTemplates(page)
    await templates.getByLabel('Nombre de la plantilla').fill('Costos para Laboratorio')
    await templates.getByLabel('Intercepto').fill('100')
    await templates.getByLabel('Pendiente').fill('100')
    await templates.getByTestId('send-template-to-laboratory').click()

    const laboratory = page.getByRole('dialog', {
      name: 'Laboratorio de Balance',
    })
    const transfer = laboratory.getByTestId('laboratory-template-transfer')
    await expect(transfer).toBeVisible()
    await expect(transfer).toContainText('Costos para Laboratorio')
    await expect(laboratory.getByText(/Runtime activo: official/)).toBeVisible()

    await transfer.getByTestId('use-template-in-laboratory').click()
    await expect(transfer).toBeHidden()
    const receivedBaseCost = laboratory
      .locator('.balance-laboratory-field')
      .filter({ hasText: 'Costo base' })
      .locator('input')
      .first()
    await expect(receivedBaseCost).toHaveValue('100')
    await expect(
      laboratory.getByText(/recibido desde Plantillas Matemáticas; aún no afecta la partida/),
    ).toBeVisible()
    await expect(laboratory.getByText(/Runtime activo: official/)).toBeVisible()
    expect(
      await page.evaluate((key) => localStorage.getItem(key), GAME_STORAGE_KEY),
    ).toBe(normalSave)
  })

  test('compara una plantilla transitoria sin crear un perfil DEV', async ({
    page,
  }) => {
    await openCleanGame(page)
    const profileStorageBefore = await page.evaluate(
      (key) => localStorage.getItem(key),
      PROFILE_STORAGE_KEY,
    )

    const templates = await openTemplates(page)
    await templates.getByLabel('Nombre de la plantilla').fill('Candidato matemático sin guardar')
    await templates.getByLabel('Intercepto').fill('100')
    await templates.getByLabel('Pendiente').fill('100')
    await templates.getByTestId('compare-template-transient').click()

    const comparator = page.getByRole('dialog', {
      name: 'Comparador de Experimentos A/B',
    })
    await expect(comparator.getByTestId('comparative-template-transfer')).toContainText(
      'Candidato matemático sin guardar',
    )
    await expect(comparator.getByTestId('comparative-profile-b')).toHaveValue(
      /template:/,
    )
    await comparator.getByLabel('Límite temporal').selectOption({ label: '5 min' })
    await comparator.getByTestId('comparative-run').click()
    await expect(comparator.getByTestId('comparative-results')).toBeVisible()
    await expect(comparator.getByText(/Comparación terminada:/)).toBeVisible()

    expect(
      await page.evaluate((key) => localStorage.getItem(key), PROFILE_STORAGE_KEY),
    ).toBe(profileStorageBefore)
  })
})
