import { expect, test } from '@playwright/test'

const SCENES = [
  { name: 'datapath', path: '/mips/add' },
  { name: 'kmap-2d', path: '/kmap/v4' },
  { name: 'kmap-3d', path: '/kmap/v5' },
  { name: 'compare', path: '/compare' },
  { name: 'pipeline', path: '/pipeline/raw' },
  { name: 'foundation', path: '/learn/foundation' }
]
const FCP_BUDGET_MS = 800
const registerScene = ({ name, path }: { name: string; path: string }): void => {
  test(`perf.frame-budget.${name}: FCP < ${FCP_BUDGET_MS}ms`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'load' })
    const fcp = await page.evaluate(() => {
      const entries = performance.getEntriesByType('paint')
      const fcpEntry = entries.find(e => e.name === 'first-contentful-paint')
      return fcpEntry?.startTime ?? 0
    })
    expect(fcp).toBeLessThan(FCP_BUDGET_MS)
  })
}
for (const scene of SCENES) registerScene(scene)
