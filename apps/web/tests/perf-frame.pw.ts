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
import { expect, test } from '@playwright/test'
const SCENES = [
  { name: 'datapath', path: '/mips/add' },
  { name: 'kmap-2d', path: '/kmap/v4' },
  { name: 'kmap-3d', path: '/kmap/v5' },
  { name: 'compare', path: '/compare' },
  { name: 'pipeline', path: '/pipeline/raw' },
  { name: 'foundation', path: '/learn/foundation' }
]
const FCP_BUDGET_MS = 1500
for (const { name, path } of SCENES)
  test(`perf.frame-budget.${name}: FCP < ${FCP_BUDGET_MS}ms`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'load' })
    const fcp = await page.evaluate(() => {
      const entries = performance.getEntriesByType('paint')
      const fcpEntry = entries.find(e => e.name === 'first-contentful-paint')
      return fcpEntry?.startTime ?? 0
    })
    expect(fcp).toBeLessThan(FCP_BUDGET_MS)
  })
