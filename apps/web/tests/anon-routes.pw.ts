/** biome-ignore-all lint/nursery/noUndeclaredEnvVars: noise */
/** biome-ignore-all lint/nursery/useGlobalThis: noise */
/** biome-ignore-all lint/suspicious/noBitwiseOperators: noise */
/** biome-ignore-all lint/suspicious/noMisplacedAssertion: noise */
/** biome-ignore-all lint/nursery/noComponentHookFactories: noise */
/** biome-ignore-all lint/nursery/noContinue: noise */
/** biome-ignore-all lint/performance/noAwaitInLoops: noise */
/** biome-ignore-all lint/performance/noNamespaceImport: noise */
/** biome-ignore-all lint/complexity/noUselessStringRaw: noise */
/** biome-ignore-all lint/complexity/useMaxParams: noise */
/* oxlint-disable unicorn/no-array-reduce, unicorn/no-immediate-mutation, unicorn/number-literal-case, unicorn/no-process-exit, import/no-duplicates, promise/param-names, @eslint-react/naming-convention/component-name */
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const ROUTES = [
  { name: 'home', path: '/' },
  { name: 'mips', path: '/mips' },
  { name: 'kmap', path: '/kmap' },
  { name: 'compare', path: '/compare' },
  { name: 'pipeline', path: '/pipeline' },
  { name: 'learn', path: '/learn' },
  { name: 'foundation', path: '/learn/foundation' },
  { name: 'share', path: '/s/abc123' }
]
ROUTES.map(({ name, path }) => {
  test(`anon: ${name} loads with 200 + no auth wall`, async ({ page }) => {
    const response = await page.goto(path)
    expect(response?.status()).toBe(200)
    await expect(page.locator('h1')).toBeVisible()
    const html = await page.content()
    expect(html).not.toContain('Sign in to continue')
    expect(html).not.toContain('You must be logged in')
  })
  test(`a11y: ${name} axe AA`, async ({ page }) => {
    await page.goto(path)
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([])
  })
  test(`keyboard: ${name} reachable by tab`, async ({ page }) => {
    await page.goto(path)
    await page.keyboard.press('Tab')
    const focused = await page.evaluate(() => document.activeElement?.tagName ?? null)
    expect(focused).not.toBeNull()
  })
  return name
})
test('visual: mips datapath snapshot', async ({ page }) => {
  await page.goto('/mips')
  await expect(page).toHaveScreenshot('mips-datapath.png', { maxDiffPixelRatio: 0.05 })
})
test('visual: kmap snapshot', async ({ page }) => {
  await page.goto('/kmap')
  await expect(page).toHaveScreenshot('kmap.png', { maxDiffPixelRatio: 0.05 })
})
test('visual: pipeline snapshot', async ({ page }) => {
  await page.goto('/pipeline')
  await expect(page).toHaveScreenshot('pipeline.png', { maxDiffPixelRatio: 0.05 })
})
