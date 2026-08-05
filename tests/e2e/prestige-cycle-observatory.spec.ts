import { expect, test, type Page } from '@playwright/test'

const GAME_STORAGE_KEY = 'incremental-game-a:save:v1'

async function openCleanWideGame(page: Page) {
  await page.setViewportSize({ width: 1600, height: 1200 })
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
  await expect(page.getByLabel('Panel de desarrollador')).toHaveAttribute(
    'data-height-synced',
    'true',
  )
  await expect(
    page.getByRole('button', { name: /Observatorio de Prestigio/ }).first(),
  ).toBeVisible()
}

test.describe('Observatorio de Ciclos y Prestigio', () => {
  test('observa la sesión y mantiene el juego operable dentro del Panel DEV', async ({
    page,
  }) => {
    await openCleanWideGame(page)
    await page
      .getByRole('button', { name: /Observatorio de Prestigio/ })
      .first()
      .click()

    const dialog = page.getByRole('dialog', {
      name: 'Observatorio de Ciclos y Prestigio',
    })
    await expect(dialog).toBeVisible()
    await expect(dialog.getByTestId('prestige-live-metrics')).toBeVisible()
    await expect(dialog.getByText('P0 → P1')).toBeVisible()

    const energy = page
      .locator('.summary-item')
      .filter({ hasText: 'Energía' })
      .locator('strong')
    await expect(energy).toHaveText('0')
    await page.getByRole('button', { name: /Generar 1 de energía/ }).click()
    await expect(energy).toHaveText('1')
    await expect(dialog).toBeVisible()
  })

  test('simula un ciclo, muestra cronología y preserva el guardado normal', async ({
    page,
  }) => {
    await openCleanWideGame(page)
    const saveBefore = await page.evaluate(
      (key) => localStorage.getItem(key),
      GAME_STORAGE_KEY,
    )

    await page
      .getByRole('button', { name: /Observatorio de Prestigio/ })
      .first()
      .click()
    const dialog = page.getByRole('dialog', {
      name: 'Observatorio de Ciclos y Prestigio',
    })
    await dialog.getByRole('button', { name: 'Simulación multiciclo' }).click()
    await dialog.getByLabel('Ciclos objetivo').selectOption('1')
    await dialog.getByLabel('Límite multiciclo').selectOption('900')
    await dialog.getByTestId('run-prestige-cycle-experiment').click()

    await expect(dialog.getByTestId('prestige-cycle-results')).toBeVisible({
      timeout: 30_000,
    })
    await expect(dialog.getByTestId('prestige-cycle-timeline')).toBeVisible()
    await expect(dialog.getByText('P5→P6').first()).toBeVisible()
    await expect(dialog.getByText(/Simulación terminada:/)).toBeVisible()

    const saveAfter = await page.evaluate(
      (key) => localStorage.getItem(key),
      GAME_STORAGE_KEY,
    )
    expect(saveAfter).toBe(saveBefore)
  })
})
