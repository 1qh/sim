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
/* eslint-disable no-namespace */
import { expect, test } from '@playwright/test'
const KMAP_CASES = ['v2', 'v3', 'v4', 'v4-pos', 'v5', 'v5-wrap', 'v6', 'v6-wrap']
const PIPELINE_PROGRAMS = ['raw', 'waw', 'war', 'control', 'forwarding', 'stall']
for (const c of KMAP_CASES)
  test(`visual.kmap.${c}`, async ({ page }) => {
    await page.goto(`/kmap/${c}`)
    await expect(page.locator('h1')).toContainText(c)
    await expect(page).toHaveScreenshot(`kmap-${c}.png`, { maxDiffPixelRatio: 0.05 })
  })
for (const p of PIPELINE_PROGRAMS)
  test(`visual.pipeline.${p}`, async ({ page }) => {
    await page.goto(`/pipeline/${p}`)
    await expect(page.locator('h1')).toContainText(p)
    await expect(page).toHaveScreenshot(`pipeline-${p}.png`, { maxDiffPixelRatio: 0.05 })
  })
