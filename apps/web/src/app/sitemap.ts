/** biome-ignore-all lint/nursery/noUndeclaredEnvVars: noise */
/** biome-ignore-all lint/style/noProcessEnv: Next metadata route runs in Next runtime */
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
import type { MetadataRoute } from 'next'
import process from 'node:process'
import { LEARN_SLUGS } from '@/features/learn/manifest'
const sitemap = (): MetadataRoute.Sitemap => {
  const base = process.env.SITE_URL ?? 'http://localhost:3000'
  const routes = ['', '/mips', '/kmap', '/pipeline', '/compare', '/learn', '/accessibility', '/privacy', '/terms']
  const staticEntries = routes.map(r => ({ changeFrequency: 'weekly' as const, priority: 0.8, url: `${base}${r}` }))
  const learnEntries = LEARN_SLUGS.map(s => ({
    changeFrequency: 'monthly' as const,
    priority: 0.6,
    url: `${base}/learn/${s}`
  }))
  return [...staticEntries, ...learnEntries]
}
export default sitemap
