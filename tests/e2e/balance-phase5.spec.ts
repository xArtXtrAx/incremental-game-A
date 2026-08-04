import { readFile } from 'node:fs/promises'
import { expect, test, type Locator, type Page } from '@playwright/test'

async function openCleanGame(page: Page) {
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
}

async function openLaboratory(page: Page) {
  await page
    .getByRole('button', { name: /Laboratorio de Balance/ })
    .click()
  return page.getByRole('dialog', { name: 'Laboratorio de Balance' })
}

async function closeLaboratory(dialog: Locator) {
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
  await closeLaboratory(dialog)
}

async function openProfiles(page: Page) {
  await page.getByRole('button', { name: /Perfiles DEV/ }).click()
  return page.getByRole('dialog', { name: 'Perfiles DEV persistentes' })
}

async function closeProfiles(dialog: Locator) {
  await dialog.getByRole('button', { name: 'Cerrar', exact: true }).click()
  await expect(dialog).toBeHidden()
}

async function saveActiveProfile(dialog: Locator, name: string) {
  await dialog.getByLabel('Nombre del perfil DEV').fill(name)
  await dialog.getByRole('button', { name: 'Guardar perfil' }).click()
  await expect(dialog.getByText(new RegExp(`Perfil “${name}” guardado`))).toBeVisible()
}

function profileRow(dialog: Locator, name: string) {
  return dialog.locator('article').filter({ hasText: name })
}

test.describe('Laboratorio de Balance · Fase 5', () => {
  test('persiste perfiles sin cargarlos automáticamente y restaura el balance oficial', async ({
    page,
  }) => {
    await openCleanGame(page)
    await applySphereCapacity(page, 2_000)

    let profiles = await openProfiles(page)
    await saveActiveProfile(profiles, 'Capacidad 2000')
    await closeProfiles(profiles)

    await page.reload()
    let laboratory = await openLaboratory(page)
    await expect(laboratory.getByText(/Runtime activo: official/)).toBeVisible()
    await closeLaboratory(laboratory)

    profiles = await openProfiles(page)
    const row = profileRow(profiles, 'Capacidad 2000')
    await expect(row).toBeVisible()
    await row.getByRole('button', { name: 'Cargar' }).click()
    await expect(
      profiles.getByText(/cargado manualmente en la sesión/),
    ).toBeVisible()
    await closeProfiles(profiles)

    laboratory = await openLaboratory(page)
    await expect(laboratory.getByText(/Runtime activo: session/)).toBeVisible()
    await closeLaboratory(laboratory)

    profiles = await openProfiles(page)
    await profiles
      .getByRole('button', { name: 'Restaurar balance oficial' })
      .click()
    await expect(profiles.getByText(/balance oficial/i)).toBeVisible()
    await closeProfiles(profiles)

    laboratory = await openLaboratory(page)
    await expect(laboratory.getByText(/Runtime activo: official/)).toBeVisible()
  })

  test('reemplaza con confirmación y cancela una eliminación sin perder el perfil', async ({
    page,
  }) => {
    await openCleanGame(page)
    await applySphereCapacity(page, 2_000)

    let profiles = await openProfiles(page)
    await saveActiveProfile(profiles, 'Perfil editable')
    await closeProfiles(profiles)

    await applySphereCapacity(page, 3_000)
    profiles = await openProfiles(page)
    let row = profileRow(profiles, 'Perfil editable')
    await row.getByRole('button', { name: 'Reemplazar' }).click()
    await expect(row.getByText(/¿Reemplazar/)).toBeVisible()
    await row.getByRole('button', { name: 'Confirmar reemplazo' }).click()
    await expect(profiles.getByText(/reemplazado con el balance activo/)).toBeVisible()

    row = profileRow(profiles, 'Perfil editable')
    await row.getByRole('button', { name: 'Eliminar' }).click()
    await expect(row.getByText(/¿Eliminar definitivamente/)).toBeVisible()
    await row.getByRole('button', { name: 'Cancelar' }).click()
    await expect(profiles.getByText(/Operación cancelada/)).toBeVisible()
    await expect(profileRow(profiles, 'Perfil editable')).toBeVisible()

    row = profileRow(profiles, 'Perfil editable')
    await row.getByRole('button', { name: 'Eliminar' }).click()
    await row.getByRole('button', { name: 'Confirmar eliminación' }).click()
    await expect(profiles.getByText(/Perfil “Perfil editable” eliminado/)).toBeVisible()
    await expect(profileRow(profiles, 'Perfil editable')).toHaveCount(0)
  })

  test('exporta un perfil e importa de nuevo el JSON validado', async ({ page }) => {
    await openCleanGame(page)
    await applySphereCapacity(page, 2_500)

    let profiles = await openProfiles(page)
    await saveActiveProfile(profiles, 'Perfil portable')
    const row = profileRow(profiles, 'Perfil portable')
    const downloadPromise = page.waitForEvent('download')
    await row.getByRole('button', { name: 'Exportar' }).click()
    const download = await downloadPromise
    const downloadPath = await download.path()
    expect(downloadPath).not.toBeNull()
    const exported = await readFile(downloadPath ?? '', 'utf8')
    expect(JSON.parse(exported).profile.name).toBe('Perfil portable')

    await row.getByRole('button', { name: 'Eliminar' }).click()
    await row.getByRole('button', { name: 'Confirmar eliminación' }).click()
    await expect(profileRow(profiles, 'Perfil portable')).toHaveCount(0)

    await profiles.getByLabel('JSON del perfil DEV').fill(exported)
    await profiles.getByRole('button', { name: 'Importar perfil' }).click()
    await expect(profiles.getByText(/Perfil “Perfil portable” importado/)).toBeVisible()
    await expect(profileRow(profiles, 'Perfil portable')).toBeVisible()
  })

  test('rechaza JSON malformado, valores fuera de límites y versiones incompatibles', async ({
    page,
  }) => {
    await openCleanGame(page)
    const profiles = await openProfiles(page)
    const input = profiles.getByLabel('JSON del perfil DEV')

    await input.fill('{roto')
    await profiles.getByRole('button', { name: 'Importar perfil' }).click()
    await expect(profiles.getByText(/no contiene JSON válido/)).toBeVisible()

    const official = await page.evaluate(() => ({
      schemaVersion: 1,
      costs: {
        click: { baseCost: 10, growth: 1.7 },
        generator: { baseCost: 25, growth: 1.8 },
        resonance: { baseCost: 120, growth: 2.2 },
        pressure: { baseCost: 500, growth: 2.4 },
        cavitation: { baseCost: 2000, growth: 2.6 },
        autoclick: { baseCost: 5000, growth: 2.8 },
        overload: { baseCost: 10000, growth: 3 },
        refraction: { baseCost: 25000, growth: 3.15 },
        pulseTrigger: { baseCost: 6000, growth: 2.25 },
      },
      unlocks: {
        pressureRequiredClicks: 100,
        cavitationRequiredClicks: 500,
        autoclickRequiredClicks: 500,
        refractionRequiredPrestige: 1,
      },
      core: { sphereClickCapacity: 0, pressureBonusPerTier: 2 },
      cavitation: {
        inactiveClicksRequired: 25,
        baseClicksRequired: 28,
        clicksReducedPerLevel: 3,
        minimumClicksRequired: 10,
        baseDurationSeconds: 3,
        durationSecondsPerLevel: 2,
      },
      autoclick: { baseRate: 0.2, growth: 1.6, maximumRate: 20 },
      overload: {
        inactiveClicksRequired: 100,
        baseClicksRequired: 110,
        clicksReducedPerLevel: 10,
        minimumClicksRequired: 40,
        baseDurationSeconds: 12,
        durationSecondsPerLevel: 3,
        baseMultiplier: 1.5,
        multiplierPerLevel: 0.5,
      },
      refraction: {
        facetCounts: [6, 8, 10, 12],
        baseChargeRate: 1,
        chargeRatePerLevel: 0.15,
        baseBonusMultiplier: 1.2,
        bonusMultiplierPerLevel: 0.05,
        baseDurationSeconds: 4,
        durationSecondsPerLevel: 1,
        baseRewardSeconds: 8,
        rewardSecondsPerLevel: 3,
        minimumOrbitDurationSeconds: 3,
        maximumOrbitDurationSeconds: 20,
        orbitAccelerationPower: 1.6,
      },
      pulseTrigger: {
        chargeClicks: 10,
        reserveGainMs: 1000,
        maximumReserveMs: 10000,
        baseRate: 6,
        ratePerLevel: 0.5,
        maximumRate: 9,
        maximumLevel: 6,
      },
      sapphire: {
        multipliers: [1, 1.5, 1.85, 2.2, 2.6, 3.05],
        postMaximumLevelIncrement: 0.5,
      },
      engineLimits: {
        maximumAutomaticClicksPerTick: 200,
        maximumBulkPurchaseIterations: 320,
        maximumFiniteValue: Number.MAX_SAFE_INTEGER,
      },
    }))

    await input.fill(
      JSON.stringify({
        exportVersion: 1,
        configSchemaVersion: 1,
        profile: { name: 'Fuera de límites', config: official },
      }),
    )
    await profiles.getByRole('button', { name: 'Importar perfil' }).click()
    await expect(profiles.getByText(/Debe permanecer entre/)).toBeVisible()

    await input.fill(
      JSON.stringify({
        exportVersion: 999,
        configSchemaVersion: 1,
        profile: { name: 'Incompatible', config: official },
      }),
    )
    await profiles.getByRole('button', { name: 'Importar perfil' }).click()
    await expect(profiles.getByText(/versión de exportación es incompatible/)).toBeVisible()
    await expect(profileRow(profiles, 'Fuera de límites')).toHaveCount(0)
    await expect(profileRow(profiles, 'Incompatible')).toHaveCount(0)
  })
})
