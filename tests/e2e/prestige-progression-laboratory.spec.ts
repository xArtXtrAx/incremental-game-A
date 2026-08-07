import { expect, test, type Page } from '@playwright/test'

const GAME_STORAGE_KEY = 'incremental-game-a:save:v1'

async function openLaboratory(page: Page) {
  await page.setViewportSize({ width: 1600, height: 1200 })
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
  await expect(page.getByLabel('Panel de desarrollador')).toHaveAttribute('data-height-synced', 'true')
  await page.getByRole('button', { name: /Laboratorio de Progresión/ }).first().click()
  const dialog = page.getByRole('dialog', { name: 'Laboratorio de Progresión de Prestigio' })
  await expect(dialog).toBeVisible()
  return dialog
}

test.describe('Laboratorio de Progresión de Prestigio', () => {
  test('expone las cinco herramientas dentro del workspace DEV', async ({ page }) => {
    const dialog = await openLaboratory(page)

    await expect(dialog.getByRole('button', { name: 'Contrafactual' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Curvas' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Estrategias' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Ruta' })).toBeVisible()
    await expect(dialog.getByRole('button', { name: 'Lotes' })).toBeVisible()
    await expect(dialog.getByLabel('Escenario laboratorio prestigio')).toHaveValue('observatory-start-prestige-5')
  })

  test('ejecuta un contrafactual sin modificar el guardado normal', async ({ page }) => {
    const dialog = await openLaboratory(page)
    const saveBefore = await page.evaluate((key) => localStorage.getItem(key), GAME_STORAGE_KEY)

    await dialog.getByLabel('Política de Zafiro').selectOption('frozen-p5')
    await dialog.getByText('Ciclos objetivo').locator('..').getByRole('combobox').selectOption('1')
    await dialog.getByText('Límite').locator('..').getByRole('combobox').selectOption('900')
    await dialog.getByText('Clics manuales').locator('..').getByRole('combobox').selectOption('20')
    await dialog.getByTestId('run-prestige-progression-lab').click()

    await expect(dialog.getByTestId('prestige-lab-pair-results')).toBeVisible({ timeout: 30_000 })
    await expect(dialog.getByText('Congelado en P5')).toBeVisible()
    await expect(dialog.getByText('Contrafactual completado.')).toBeVisible()

    const saveAfter = await page.evaluate((key) => localStorage.getItem(key), GAME_STORAGE_KEY)
    expect(saveAfter).toBe(saveBefore)
  })
})
