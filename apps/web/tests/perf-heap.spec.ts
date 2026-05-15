import { expect, test } from '@playwright/test'
const CYCLES = [
  { name: 'datapath-cycle', path: '/mips/add' },
  { name: 'kmap-cycle', path: '/kmap/v4' },
  { name: 'share-cycle', path: '/s/abc123' }
]
const MAX_GROWTH_BYTES = 5_000_000
for (const { name, path } of CYCLES) {
  test(`perf.heap-leak.${name}: ${path} repeated navigation no leak`, async ({ page }) => {
    await page.goto(path)
    await page.evaluate(() => 'gc' in window ? (window as unknown as { gc: () => void }).gc() : undefined)
    const before = await page.evaluate(() => (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize ?? 0)
    for (let i = 0; i < 5; i += 1) {
      await page.goto('/')
      await page.goto(path)
    }
    await page.evaluate(() => 'gc' in window ? (window as unknown as { gc: () => void }).gc() : undefined)
    const after = await page.evaluate(() => (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize ?? 0)
    const growth = after - before
    expect(growth).toBeLessThan(MAX_GROWTH_BYTES)
  })
}
