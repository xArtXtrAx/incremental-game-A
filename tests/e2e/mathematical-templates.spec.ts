import { readFile } from 'node:fs/promises'
import { expect, test, type Locator, type Page } from '@playwright/test'

const GAME_STORAGE_KEY = 'incremental-game-a:save:v1'

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
})
