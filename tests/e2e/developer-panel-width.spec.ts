import { expect, test, type Page } from '@playwright/test'

const WIDTH_STORAGE_KEY = 'incremental-game-a:developer-panel-width:v1'

async function openCleanGame(page: Page, width = 1600) {
  await page.setViewportSize({ width, height: 1200 })
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()
  await expect(page.getByLabel('Panel de desarrollador')).toHaveAttribute(
    'data-height-synced',
    'true',
  )
  await expect(page.getByTestId('developer-panel-width-controls')).toBeVisible()
}

async function panelWidth(page: Page) {
  return Math.round(
    (await page.getByLabel('Panel de desarrollador').boundingBox())?.width ?? 0,
  )
}

async function expectPanelWidth(page: Page, expected: number) {
  await expect.poll(() => panelWidth(page)).toBe(expected)
  await expect
    .poll(() =>
      page.evaluate(() =>
        getComputedStyle(document.documentElement)
          .getPropertyValue('--developer-panel-width')
          .trim(),
      ),
    )
    .toBe(`${expected}px`)
}

test.describe('Anchura configurable del Panel DEV', () => {
  test('ofrece presets, teclado y arrastre hacia la derecha sin comprimir el juego bajo su mínimo', async ({
    page,
  }) => {
    await openCleanGame(page)

    const panel = page.getByLabel('Panel de desarrollador')
    const handle = page.getByTestId('developer-panel-resize-handle')

    await expectPanelWidth(page, 528)

    await panel.getByRole('button', { name: 'Compacto' }).click()
    await expectPanelWidth(page, 440)

    await panel.getByRole('button', { name: 'Amplio' }).click()
    await expectPanelWidth(page, 640)

    await handle.focus()
    await handle.press('ArrowLeft')
    await expectPanelWidth(page, 624)

    const handleBox = await handle.boundingBox()
    expect(handleBox).not.toBeNull()
    if (!handleBox) return

    await page.mouse.move(
      handleBox.x + handleBox.width / 2,
      handleBox.y + handleBox.height / 2,
    )
    await page.mouse.down()
    await page.mouse.move(handleBox.x + handleBox.width / 2 + 80, handleBox.y)
    await page.mouse.up()
    await expectPanelWidth(page, 704)

    const [gameBox, developerBox, gamepadBox] = await Promise.all([
      page.locator('.game-workspace > .game-panel').boundingBox(),
      panel.boundingBox(),
      page.getByLabel('Configuración del control').boundingBox(),
    ])
    expect(gameBox).not.toBeNull()
    expect(developerBox).not.toBeNull()
    expect(gamepadBox).not.toBeNull()
    expect(gameBox?.width ?? 0).toBeGreaterThanOrEqual(760)
    if (developerBox && gamepadBox) {
      expect(gamepadBox.x + gamepadBox.width).toBeLessThanOrEqual(
        developerBox.x - 1,
      )
    }

    const pageWidth = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }))
    expect(pageWidth.scroll).toBeLessThanOrEqual(pageWidth.client)
  })

  test('persiste la preferencia, restaura el valor oficial e ignora datos corruptos', async ({
    page,
  }) => {
    await openCleanGame(page)
    const panel = page.getByLabel('Panel de desarrollador')
    const controls = page.getByTestId('developer-panel-width-controls')

    await panel.getByRole('button', { name: 'Amplio' }).click()
    await expectPanelWidth(page, 640)
    expect(
      await page.evaluate((key) => localStorage.getItem(key), WIDTH_STORAGE_KEY),
    ).toBe('640')

    await page.reload()
    await expectPanelWidth(page, 640)

    await controls
      .getByRole('button', { name: 'Restaurar', exact: true })
      .click()
    await expectPanelWidth(page, 528)
    expect(
      await page.evaluate((key) => localStorage.getItem(key), WIDTH_STORAGE_KEY),
    ).toBeNull()

    await page.evaluate(
      ([key, value]) => localStorage.setItem(key, value),
      [WIDTH_STORAGE_KEY, '{ancho roto}'],
    )
    await page.reload()
    await expectPanelWidth(page, 528)
  })

  test('limita una preferencia amplia en una ventana estrecha y la recupera al volver a escritorio ancho', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1281, height: 1200 })
    await page.goto('/')
    await page.evaluate(
      ([key, value]) => localStorage.setItem(key, value),
      [WIDTH_STORAGE_KEY, '760'],
    )
    await page.reload()

    await expectPanelWidth(page, 455)
    expect(
      await page.evaluate((key) => localStorage.getItem(key), WIDTH_STORAGE_KEY),
    ).toBe('760')
    expect(
      (await page.locator('.game-workspace > .game-panel').boundingBox())?.width ??
        0,
    ).toBeGreaterThanOrEqual(760)

    await page.setViewportSize({ width: 1600, height: 1200 })
    await expectPanelWidth(page, 760)
  })

  test('desactiva el arrastre al apilar la interfaz y conserva la página sin scroll horizontal', async ({
    page,
  }) => {
    await openCleanGame(page, 1100)

    const panel = page.getByLabel('Panel de desarrollador')
    const controls = page.getByTestId('developer-panel-width-controls')
    const handle = page.getByTestId('developer-panel-resize-handle')
    await expect(handle).toBeHidden()
    await expect(panel.getByText('Automático', { exact: true })).toBeVisible()
    await expect(controls.locator('.developer-panel-width-presets')).toBeHidden()

    const pageWidth = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }))
    expect(pageWidth.scroll).toBeLessThanOrEqual(pageWidth.client)
  })
})
