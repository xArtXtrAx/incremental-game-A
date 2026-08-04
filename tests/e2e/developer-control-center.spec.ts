import { expect, test, type Locator, type Page } from '@playwright/test'

const GAME_STORAGE_KEY = 'incremental-game-a:save:v1'
const SCENARIO_STORAGE_KEY = 'incremental-game-a:developer-scenarios:v1'

async function openCleanGame(page: Page) {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
}

async function openControlCenter(page: Page) {
  await page.getByRole('button', { name: /Centro de Control DEV/ }).click()
  return page.getByRole('dialog', { name: 'Centro de Control DEV' })
}

async function closeControlCenter(dialog: Locator) {
  await dialog.getByRole('button', { name: 'Cerrar' }).click()
  await expect(dialog).toBeHidden()
}

function scenarioCard(dialog: Locator, name: string) {
  return dialog.locator('article').filter({ hasText: name })
}

test.describe('Centro de Control Experimental DEV', () => {
  test('aplica un escenario aislado, avanza el reducer y restaura la partida normal', async ({
    page,
  }) => {
    await openCleanGame(page)
    const normalSave = await page.evaluate((key) => localStorage.getItem(key), GAME_STORAGE_KEY)
    expect(normalSave).not.toBeNull()

    const dialog = await openControlCenter(page)
    await dialog.getByRole('button', { name: 'Escenarios', exact: true }).click()
    const scenario = scenarioCard(dialog, 'Antes de cristalizar')
    await scenario.getByRole('button', { name: 'Previsualizar' }).click()
    await expect(dialog.getByText(/campos cambiarían/)).toBeVisible()
    await scenario.getByRole('button', { name: 'Aplicar aislado' }).click()

    await expect(
      dialog.getByText('SESIÓN AISLADA', { exact: true }),
    ).toBeVisible()
    await expect(dialog.getByText('PAUSADO', { exact: true })).toBeVisible()
    await expect(page.getByLabel('Clics del núcleo')).toHaveValue('5000')
    expect(
      await page.evaluate((key) => localStorage.getItem(key), GAME_STORAGE_KEY),
    ).toBe(normalSave)

    await dialog.getByRole('button', { name: 'Simulación', exact: true }).click()
    await dialog.getByRole('button', { name: '+10 s', exact: true }).click()
    await expect(dialog.getByText('Simulación avanzada 10 s.')).toBeVisible()
    expect(
      await page.evaluate((key) => localStorage.getItem(key), GAME_STORAGE_KEY),
    ).toBe(normalSave)

    await dialog.getByRole('button', { name: 'Estado', exact: true }).click()
    await dialog.getByRole('button', { name: 'Restaurar sesión original' }).click()
    await expect(
      dialog.getByText('SESIÓN NORMAL', { exact: true }),
    ).toBeVisible()
    await expect(dialog.getByText('EN MARCHA', { exact: true })).toBeVisible()
    await expect(page.getByLabel('Clics del núcleo')).toHaveValue('0')
    expect(
      await page.evaluate((key) => localStorage.getItem(key), GAME_STORAGE_KEY),
    ).toBe(normalSave)
  })

  test('captura un snapshot persistente sin mezclarlo con la partida', async ({
    page,
  }) => {
    await openCleanGame(page)
    await page.getByLabel('Energía acumulada').fill('4321')
    await page.getByLabel('Clics del núcleo').fill('321')
    await page.getByRole('button', { name: 'Aplicar valores' }).click()
    const normalSave = await page.evaluate((key) => localStorage.getItem(key), GAME_STORAGE_KEY)

    let dialog = await openControlCenter(page)
    await dialog.getByRole('button', { name: 'Escenarios', exact: true }).click()
    await dialog.getByPlaceholder('Nombre del escenario').fill('Snapshot personal')
    await dialog.getByRole('button', { name: 'Guardar snapshot' }).click()
    await expect(dialog.getByText(/Snapshot “Snapshot personal” guardado/)).toBeVisible()
    await expect(scenarioCard(dialog, 'Snapshot personal')).toBeVisible()
    expect(
      await page.evaluate((key) => localStorage.getItem(key), GAME_STORAGE_KEY),
    ).toBe(normalSave)
    expect(
      await page.evaluate((key) => localStorage.getItem(key), SCENARIO_STORAGE_KEY),
    ).not.toBeNull()

    await closeControlCenter(dialog)
    await page.reload()
    dialog = await openControlCenter(page)
    await dialog.getByRole('button', { name: 'Escenarios', exact: true }).click()
    const saved = scenarioCard(dialog, 'Snapshot personal')
    await expect(saved).toBeVisible()
    await saved.getByRole('button', { name: 'Eliminar' }).click()
    await expect(dialog.getByText(/Escenario “Snapshot personal” eliminado/)).toBeVisible()
    await expect(scenarioCard(dialog, 'Snapshot personal')).toHaveCount(0)
  })

  test('muestra métricas y conserva acceso a las herramientas existentes', async ({
    page,
  }) => {
    await openCleanGame(page)
    const dialog = await openControlCenter(page)

    await dialog.getByRole('button', { name: 'Métricas', exact: true }).click()
    await expect(dialog.getByText('Energía por segundo')).toBeVisible()
    await expect(dialog.getByText('Tiempo estimado al núcleo')).toBeVisible()
    await expect(dialog.getByText('Llenado del núcleo')).toBeVisible()

    await dialog.getByRole('button', { name: 'Herramientas', exact: true }).click()
    await dialog.getByRole('button', { name: /Laboratorio de Balance/ }).click()
    await expect(
      page.getByRole('dialog', { name: 'Laboratorio de Balance' }),
    ).toBeVisible()
  })
})
