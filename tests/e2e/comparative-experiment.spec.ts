import { readFile } from 'node:fs/promises'
import { expect, test, type Locator, type Page } from '@playwright/test'

const GAME_STORAGE_KEY = 'incremental-game-a:save:v1'

async function openCleanGame(page: Page) {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
}

async function openLaboratory(page: Page) {
  await page.getByRole('button', { name: /Laboratorio de Balance/ }).click()
  return page.getByRole('dialog', { name: 'Laboratorio de Balance' })
}

async function closeDialog(dialog: Locator) {
  await dialog.getByRole('button', { name: 'Cerrar', exact: true }).click()
  await expect(dialog).toBeHidden()
}

async function applySphereCapacity(page: Page, capacity: number) {
  const dialog = await openLaboratory(page)
  await dialog.getByRole('button', { name: 'Núcleo', exact: true }).click()
  const field = dialog
    .locator('label')
    .filter({ hasText: /Capacidad de la esfera/ })
  await field.locator('input').fill(String(capacity))
  await dialog.getByRole('button', { name: 'Aplicar a sesión' }).click()
  await expect(dialog.getByText(/Runtime activo: session/)).toBeVisible()
  await closeDialog(dialog)
}

async function saveActiveProfile(page: Page, name: string) {
  await page.getByRole('button', { name: /Perfiles DEV/ }).click()
  const dialog = page.getByRole('dialog', {
    name: 'Perfiles DEV persistentes',
  })
  await dialog.getByLabel('Nombre del perfil DEV').fill(name)
  await dialog.getByRole('button', { name: 'Guardar perfil' }).click()
  await expect(dialog.getByText(new RegExp(`Perfil “${name}” guardado`))).toBeVisible()
  await dialog.getByRole('button', { name: 'Restaurar balance oficial' }).click()
  await expect(dialog.locator('.balance-profile-message')).toContainText(
    /Valores oficiales restaurados/i,
  )
  await closeDialog(dialog)
}

async function openComparator(page: Page) {
  await page
    .getByRole('button', { name: /Comparador de Experimentos/ })
    .first()
    .click()
  return page.getByRole('dialog', {
    name: 'Comparador de Experimentos A/B',
  })
}

test.describe('Comparador de Experimentos A/B', () => {
  test('compara un perfil con el oficial sin modificar partida ni runtime', async ({
    page,
  }) => {
    await openCleanGame(page)
    await applySphereCapacity(page, 2_000)
    await saveActiveProfile(page, 'Núcleo 2000')

    const normalSave = await page.evaluate(
      (key) => localStorage.getItem(key),
      GAME_STORAGE_KEY,
    )
    expect(normalSave).not.toBeNull()

    const dialog = await openComparator(page)
    await dialog.getByLabel('Escenario').selectOption({ label: 'Partida nueva' })
    await dialog
      .getByLabel('Perfil B')
      .selectOption({ label: 'Núcleo 2000' })
    await dialog
      .getByLabel('Condición de parada')
      .selectOption({ label: 'Núcleo lleno' })
    await dialog.getByLabel('Límite temporal').selectOption({ label: '120 min' })
    await dialog
      .getByLabel('Clics manuales por segundo')
      .selectOption({ label: '5/s' })
    await dialog
      .getByLabel('Comprar automáticamente la evolución disponible más barata')
      .uncheck()
    await dialog.getByTestId('comparative-run').click()

    const results = dialog.getByTestId('comparative-results')
    await expect(results).toBeVisible()
    await expect(dialog.getByText(/Comparación terminada:/)).toBeVisible()
    const coreRow = dialog.getByRole('row', {
      name: /Tiempo al núcleo lleno/,
    })
    await expect(coreRow).toContainText('Perfil B')
    await expect(coreRow).toContainText('1,000 s')
    await expect(coreRow).toContainText('400 s')

    expect(
      await page.evaluate((key) => localStorage.getItem(key), GAME_STORAGE_KEY),
    ).toBe(normalSave)

    await closeDialog(dialog)
    const laboratory = await openLaboratory(page)
    await expect(laboratory.getByText(/Runtime activo: official/)).toBeVisible()
  })

  test('se abre desde Herramientas y exporta resultados reproducibles', async ({
    page,
  }) => {
    await openCleanGame(page)
    await page.getByRole('button', { name: /Centro de Control DEV/ }).click()
    const controlCenter = page.getByRole('dialog', {
      name: 'Centro de Control DEV',
    })
    await controlCenter
      .getByRole('button', { name: 'Herramientas', exact: true })
      .click()
    await controlCenter
      .getByRole('button', { name: /Comparador de Experimentos/ })
      .click()

    const comparator = page.getByRole('dialog', {
      name: 'Comparador de Experimentos A/B',
    })
    await expect(comparator).toBeVisible()
    await comparator.getByLabel('Límite temporal').selectOption({ label: '5 min' })
    await comparator.getByTestId('comparative-run').click()
    await expect(comparator.getByTestId('comparative-results')).toBeVisible()

    const jsonDownloadPromise = page.waitForEvent('download')
    await comparator.getByRole('button', { name: 'Exportar JSON' }).click()
    const jsonDownload = await jsonDownloadPromise
    const jsonPath = await jsonDownload.path()
    expect(jsonPath).not.toBeNull()
    const exported = JSON.parse(await readFile(jsonPath ?? '', 'utf8'))
    expect(exported.scenarioName).toBe('Mitad del primer ciclo')
    expect(exported.runA.finalState).toEqual(exported.runB.finalState)

    const csvDownloadPromise = page.waitForEvent('download')
    await comparator.getByRole('button', { name: 'Exportar CSV' }).click()
    const csvDownload = await csvDownloadPromise
    const csvPath = await csvDownload.path()
    expect(csvPath).not.toBeNull()
    const csv = await readFile(csvPath ?? '', 'utf8')
    expect(csv).toContain('Tiempo al núcleo lleno')
    expect(csv).toContain('Balance oficial')
  })
})
