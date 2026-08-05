import { expect, test, type Locator, type Page } from '@playwright/test'

const GEOMETRY_TOLERANCE_PX = 2

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
    page.getByRole('button', { name: /Plantillas Matemáticas/ }).first(),
  ).toBeVisible()
}

async function expectInsidePanel(panel: Locator, surface: Locator) {
  const panelBox = await panel.boundingBox()
  const surfaceBox = await surface.boundingBox()

  expect(panelBox).not.toBeNull()
  expect(surfaceBox).not.toBeNull()

  if (!panelBox || !surfaceBox) return

  expect(surfaceBox.x).toBeGreaterThanOrEqual(
    panelBox.x - GEOMETRY_TOLERANCE_PX,
  )
  expect(surfaceBox.y).toBeGreaterThanOrEqual(
    panelBox.y - GEOMETRY_TOLERANCE_PX,
  )
  expect(surfaceBox.x + surfaceBox.width).toBeLessThanOrEqual(
    panelBox.x + panelBox.width + GEOMETRY_TOLERANCE_PX,
  )
  expect(surfaceBox.y + surfaceBox.height).toBeLessThanOrEqual(
    panelBox.y + panelBox.height + GEOMETRY_TOLERANCE_PX,
  )
}

async function closeDialog(dialog: Locator) {
  const labelledClose = dialog.getByRole('button', { name: 'Cerrar' })
  if (await labelledClose.count()) {
    await labelledClose.last().click()
  } else {
    await dialog.getByRole('button', { name: /Volver al reactor/ }).click()
  }
  await expect(dialog).toBeHidden()
}

test.describe('Panel DEV acoplado', () => {
  test('iguala la altura del juego y usa solo desplazamiento vertical interno', async ({
    page,
  }) => {
    await openCleanWideGame(page)

    const gamePanel = page.locator('.game-workspace > .game-panel')
    const developerPanel = page.getByLabel('Panel de desarrollador')
    const scrollArea = developerPanel.getByTestId('developer-panel-scroll')

    const [gameBox, developerBox] = await Promise.all([
      gamePanel.boundingBox(),
      developerPanel.boundingBox(),
    ])
    expect(gameBox).not.toBeNull()
    expect(developerBox).not.toBeNull()
    expect(
      Math.abs((gameBox?.height ?? 0) - (developerBox?.height ?? 0)),
    ).toBeLessThanOrEqual(1)

    if (gameBox && developerBox) {
      expect(developerBox.width).toBeGreaterThanOrEqual(520)
      expect(developerBox.width).toBeLessThanOrEqual(642)
      expect(gameBox.width).toBeGreaterThanOrEqual(760)
    }

    const gamepadBox = await page
      .getByLabel('Configuración del control')
      .boundingBox()
    expect(gamepadBox).not.toBeNull()
    if (developerBox && gamepadBox) {
      expect(gamepadBox.x + gamepadBox.width).toBeLessThanOrEqual(
        developerBox.x - 1,
      )
    }

    const layout = await scrollArea.evaluate((element) => {
      const style = getComputedStyle(element)
      return {
        clientHeight: element.clientHeight,
        clientWidth: element.clientWidth,
        scrollHeight: element.scrollHeight,
        scrollWidth: element.scrollWidth,
        overflowX: style.overflowX,
        overflowY: style.overflowY,
      }
    })

    expect(layout.overflowY).toBe('auto')
    expect(layout.overflowX).toBe('hidden')
    expect(layout.scrollHeight).toBeGreaterThan(layout.clientHeight)
    expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth)

    await scrollArea.evaluate((element) =>
      element.scrollTo({ top: element.scrollHeight }),
    )
    await expect
      .poll(() => scrollArea.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0)

    const pageWidth = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }))
    expect(pageWidth.scroll).toBeLessThanOrEqual(pageWidth.client)
  })

  test('mantiene el juego operable mientras el Laboratorio ocupa solo la columna DEV', async ({
    page,
  }) => {
    await openCleanWideGame(page)

    const developerPanel = page.getByLabel('Panel de desarrollador')
    await page.getByRole('button', { name: /Laboratorio de Balance/ }).click()

    const dialog = page.getByRole('dialog', { name: 'Laboratorio de Balance' })
    const surface = developerPanel.locator('.developer-workspace-overlay')
    await expect(dialog).toBeVisible()
    await expect(surface).toHaveCount(1)
    await expectInsidePanel(developerPanel, surface)

    const layerOrder = await page.evaluate(() => ({
      developerPanel: Number(
        getComputedStyle(
          document.querySelector<HTMLElement>('.developer-panel')!,
        ).zIndex,
      ),
      gamepadPanel: Number(
        getComputedStyle(
          document.querySelector<HTMLElement>('.gamepad-panel')!,
        ).zIndex,
      ),
    }))
    expect(layerOrder.developerPanel).toBeGreaterThan(layerOrder.gamepadPanel)

    const energy = page
      .locator('.summary-item')
      .filter({ hasText: 'Energía' })
      .locator('strong')
    await expect(energy).toHaveText('0')
    await page.getByRole('button', { name: /Generar 1 de energía/ }).click()
    await expect(energy).toHaveText('1')
    await expect(dialog).toBeVisible()

    expect(
      await page.evaluate(() =>
        document.body.classList.contains('is-chromatic-open'),
      ),
    ).toBe(false)

    await dialog.getByRole('button', { name: 'Cerrar', exact: true }).click()
    await expect(dialog).toBeHidden()
  })

  test('acopla las herramientas principales y la vista cromática sin cubrir el juego', async ({
    page,
  }) => {
    await openCleanWideGame(page)
    const developerPanel = page.getByLabel('Panel de desarrollador')

    const tools: readonly {
      button: RegExp
      dialog: string
    }[] = [
      { button: /Perfiles DEV/, dialog: 'Perfiles DEV persistentes' },
      { button: /Centro de Control DEV/, dialog: 'Centro de Control DEV' },
      {
        button: /Comparador de Experimentos/,
        dialog: 'Comparador de Experimentos A/B',
      },
      {
        button: /Plantillas Matemáticas/,
        dialog: 'Plantillas Matemáticas Seguras',
      },
    ]

    for (const tool of tools) {
      await page.getByRole('button', { name: tool.button }).first().click()
      const dialog = page.getByRole('dialog', { name: tool.dialog })
      await expect(dialog).toBeVisible()
      await expectInsidePanel(
        developerPanel,
        developerPanel.locator('.developer-workspace-overlay'),
      )
      await closeDialog(dialog)
    }

    await page.locator('.developer-chromatic-button').click()
    const chamber = developerPanel.locator(
      '.chromatic-developer-docked[role="dialog"]',
    )
    await expect(chamber).toBeVisible()
    await expectInsidePanel(developerPanel, chamber)
    expect(
      await page.evaluate(() =>
        document.body.classList.contains('is-chromatic-open'),
      ),
    ).toBe(false)

    await page.getByRole('button', { name: /Generar 1 de energía/ }).click()
    await expect(
      page
        .locator('.summary-item')
        .filter({ hasText: 'Energía' })
        .locator('strong'),
    ).toHaveText('1')
  })
})
