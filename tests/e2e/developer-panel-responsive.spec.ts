import { expect, test } from '@playwright/test'

test('mantiene la herramienta dentro del panel al apilar la interfaz', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1100, height: 1000 })
  await page.goto('/')
  await page.evaluate(() => window.localStorage.clear())
  await page.reload()

  const panel = page.getByLabel('Panel de desarrollador')
  await expect(panel).toBeVisible()
  await expect(panel).toHaveCSS('position', 'relative')

  await page.getByRole('button', { name: /Laboratorio de Balance/ }).click()
  const dialog = page.getByRole('dialog', { name: 'Laboratorio de Balance' })
  const overlay = panel.locator('.developer-workspace-overlay')
  await expect(dialog).toBeVisible()
  await expect(overlay).toHaveCount(1)

  const [panelBox, overlayBox] = await Promise.all([
    panel.boundingBox(),
    overlay.boundingBox(),
  ])
  expect(panelBox).not.toBeNull()
  expect(overlayBox).not.toBeNull()

  if (panelBox && overlayBox) {
    expect(overlayBox.x).toBeGreaterThanOrEqual(panelBox.x - 1)
    expect(overlayBox.y).toBeGreaterThanOrEqual(panelBox.y - 1)
    expect(overlayBox.x + overlayBox.width).toBeLessThanOrEqual(
      panelBox.x + panelBox.width + 1,
    )
    expect(overlayBox.y + overlayBox.height).toBeLessThanOrEqual(
      panelBox.y + panelBox.height + 1,
    )
  }

  const pageWidth = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }))
  expect(pageWidth.scroll).toBeLessThanOrEqual(pageWidth.client)
})
