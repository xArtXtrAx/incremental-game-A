import { expect, test, type Locator, type Page } from '@playwright/test'

const GAME_STORAGE_KEY = 'incremental-game-a:save:v1'

const baseGameState = {
  energy: 0,
  manualClicks: 0,
  clickLevel: 0,
  pulseTriggerLevel: 0,
  generatorLevel: 0,
  resonanceLevel: 0,
  pressureLevel: 0,
  cavitationLevel: 0,
  cavitationCharge: 0,
  autoclickLevel: 0,
  autoclickProgress: 0,
  overloadLevel: 0,
  overloadCharge: 0,
  overloadUntil: 0,
  refractionLevel: 0,
  refractionOrbitProgress: 0,
  refractionFacetsCharged: 0,
  refractionUntil: 0,
  refractionDischargeCount: 0,
  refractionLastReward: 0,
  prestigeCount: 0,
}

async function openCleanGame(page: Page) {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
}

async function openSeededGame(
  page: Page,
  overrides: Partial<typeof baseGameState>,
) {
  const state = { ...baseGameState, ...overrides }
  await page.goto('/')
  await page.evaluate(
    ({ key, gameState }) => {
      window.localStorage.clear()
      window.localStorage.setItem(
        key,
        JSON.stringify({ version: 1, state: gameState }),
      )
    },
    { key: GAME_STORAGE_KEY, gameState: state },
  )
  await page.reload()
}

async function applyDeveloperValues(
  page: Page,
  values: { energy?: number; clicks?: number; prestige?: number },
) {
  if (values.energy !== undefined) {
    await page.getByLabel('Energía acumulada').fill(String(values.energy))
  }
  if (values.clicks !== undefined) {
    await page.getByLabel('Clics del núcleo').fill(String(values.clicks))
  }
  if (values.prestige !== undefined) {
    await page.getByLabel('Cristalizaciones').fill(String(values.prestige))
  }
  await page.getByRole('button', { name: 'Aplicar valores' }).click()
}

async function openLaboratory(page: Page) {
  await page
    .getByRole('button', { name: /Laboratorio de Balance/ })
    .click()
  return page.getByRole('dialog', { name: 'Laboratorio de Balance' })
}

async function setLaboratoryField(
  dialog: Locator,
  label: RegExp,
  value: number,
) {
  await dialog.getByLabel(label).fill(String(value))
}

async function closeLaboratory(dialog: Locator) {
  await dialog.getByRole('button', { name: 'Cerrar', exact: true }).click()
  await expect(dialog).toBeHidden()
}

test.describe('Laboratorio de Balance · Fase 4', () => {
  test('automatiza esfera incompleta → completa → incompleta y restauración al recargar', async ({
    page,
  }) => {
    await openCleanGame(page)
    await applyDeveloperValues(page, { clicks: 3_000 })

    let dialog = await openLaboratory(page)
    await dialog.getByRole('button', { name: 'Núcleo', exact: true }).click()
    await setLaboratoryField(dialog, /Capacidad de la esfera/, 2_000)
    await dialog
      .getByRole('button', { name: 'Diagnóstico', exact: true })
      .click()
    await expect(
      dialog.getByText(/Estado de la esfera: Incompleta → Completa/),
    ).toBeVisible()
    await dialog.getByRole('button', { name: 'Aplicar a sesión' }).click()
    await expect(dialog.getByText(/Runtime activo: session/)).toBeVisible()
    await closeLaboratory(dialog)

    await expect(page.getByText('NÚCLEO LLENO', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: /CRISTALIZAR/ })).toBeVisible()
    await expect(page.getByLabel('Clics del núcleo')).toHaveValue('3000')

    dialog = await openLaboratory(page)
    await dialog.getByRole('button', { name: 'Núcleo', exact: true }).click()
    await setLaboratoryField(dialog, /Capacidad de la esfera/, 6_000)
    await dialog
      .getByRole('button', { name: 'Diagnóstico', exact: true })
      .click()
    await expect(
      dialog.getByText(/Estado de la esfera: Completa → Incompleta/),
    ).toBeVisible()
    await dialog.getByRole('button', { name: 'Aplicar a sesión' }).click()
    await closeLaboratory(dialog)

    await expect(page.getByText('CLICK', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: /CRISTALIZAR/ })).toHaveCount(
      0,
    )
    await expect(
      page.getByRole('button', { name: /Núcleo 3000 de 6000/ }),
    ).toBeVisible()

    await page.reload()
    await expect(
      page.getByRole('button', { name: /Núcleo 3000 de 5000/ }),
    ).toBeVisible()
    dialog = await openLaboratory(page)
    await expect(dialog.getByText(/Runtime activo: official/)).toBeVisible()
  })

  test('aplica el bono de Presión a resumen, clic y producción', async ({
    page,
  }) => {
    await openSeededGame(page, {
      energy: 100_000,
      manualClicks: 2_500,
      generatorLevel: 2,
      pressureLevel: 2,
    })

    const pressureSummary = page
      .locator('.summary-item')
      .filter({ hasText: 'Presión' })
    await expect(pressureSummary).toContainText('+20%')

    const dialog = await openLaboratory(page)
    await dialog.getByRole('button', { name: 'Núcleo', exact: true }).click()
    await setLaboratoryField(dialog, /Bono de Presión por tramo/, 5)
    await dialog.getByRole('button', { name: 'Aplicar a sesión' }).click()
    await closeLaboratory(dialog)

    await expect(pressureSummary).toContainText('+50%')
    await expect(
      page.locator('.summary-item').filter({ hasText: 'Por clic' }),
    ).toContainText('+1.5')
    await expect(
      page.locator('.summary-item').filter({ hasText: 'Producción' }),
    ).toContainText('+3/s')
  })

  test('conserva Autoclicker comprado y bloquea solo la compra siguiente', async ({
    page,
  }) => {
    await openSeededGame(page, {
      energy: 1_000_000,
      manualClicks: 1_000,
      generatorLevel: 1,
      autoclickLevel: 1,
      prestigeCount: 2,
    })

    const dialog = await openLaboratory(page)
    await dialog.getByRole('button', { name: 'Núcleo', exact: true }).click()
    await setLaboratoryField(dialog, /Desbloqueo del Autoclicker/, 8_000)
    await dialog
      .getByRole('button', { name: 'Autoclicker', exact: true })
      .click()
    await setLaboratoryField(dialog, /Tasa inicial/, 2)
    await dialog.getByRole('button', { name: 'Aplicar a sesión' }).click()
    await closeLaboratory(dialog)

    const autoclickCard = page
      .locator('article')
      .filter({ hasText: 'Módulo de pulsación autónoma' })
    const purchaseButton = autoclickCard.getByRole('button', {
      name: /Automatizar/,
    })

    await expect(autoclickCard).toContainText('Nivel 1')
    await expect(autoclickCard).toContainText('Requiere 8000 clics')
    await expect(purchaseButton).toBeDisabled()
    await expect
      .poll(async () => Number(await page.getByLabel('Clics del núcleo').inputValue()))
      .toBeGreaterThan(1_000)

    await applyDeveloperValues(page, { clicks: 8_000 })
    await expect(purchaseButton).toBeEnabled()
  })

  test('conserva Refracción comprada y bloquea solo su siguiente nivel', async ({
    page,
  }) => {
    await openSeededGame(page, {
      energy: 1_000_000,
      manualClicks: 5_000,
      generatorLevel: 1,
      refractionLevel: 1,
      refractionOrbitProgress: 0.25,
      prestigeCount: 1,
    })

    const dialog = await openLaboratory(page)
    await dialog.getByRole('button', { name: 'Núcleo', exact: true }).click()
    await setLaboratoryField(dialog, /Desbloqueo de Refracción/, 5)
    await dialog.getByRole('button', { name: 'Aplicar a sesión' }).click()
    await closeLaboratory(dialog)

    await page.getByRole('button', { name: /^Avanzadas/ }).click()
    const refractionCard = page
      .locator('article')
      .filter({ hasText: 'Matriz de refracción' })
    const purchaseButton = refractionCard.getByRole('button', {
      name: /Calibrar matriz/,
    })
    const status = page
      .locator('.sphere-status')
      .filter({ hasText: 'Matriz de refracción' })
    const initialStatus = await status.textContent()

    await expect(refractionCard).toContainText('Nivel 1')
    await expect(refractionCard).toContainText('Requiere prestigio 5')
    await expect(purchaseButton).toBeDisabled()
    await expect.poll(async () => status.textContent()).not.toBe(initialStatus)

    await applyDeveloperValues(page, { prestige: 5 })
    await expect(refractionCard).toContainText('Nivel 1')
    await expect(purchaseButton).toBeEnabled()
  })
})
