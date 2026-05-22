import { expect, test } from '@playwright/test'

const KMAP_CASES = ['v2', 'v3', 'v4', 'v4-pos', 'v5', 'v5-wrap', 'v6', 'v6-wrap']
const PIPELINE_PROGRAMS = ['raw', 'waw', 'war', 'control', 'forwarding', 'stall']
KMAP_CASES.map(c =>
  test(`visual.kmap.${c}`, async ({ page }) => {
    await page.goto(`/kmap/${c}`)
    await expect(page.locator('h1')).toContainText(c)
    await expect(page).toHaveScreenshot(`kmap-${c}.png`, { maxDiffPixelRatio: 0.05 })
  })
)
PIPELINE_PROGRAMS.map(p =>
  test(`visual.pipeline.${p}`, async ({ page }) => {
    await page.goto(`/pipeline/${p}`)
    await expect(page.locator('h1')).toContainText(p)
    await expect(page).toHaveScreenshot(`pipeline-${p}.png`, { maxDiffPixelRatio: 0.05 })
  })
)
