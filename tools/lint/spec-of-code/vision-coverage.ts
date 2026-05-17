#!/usr/bin/env bun
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
/* eslint-disable no-console, no-await-in-loop */
import { $, file } from 'bun'
import { existsSync } from 'node:fs'
import process from 'node:process'
const repoRoot = (await $`git rev-parse --show-toplevel`.text()).trim()
const read = async (p: string): Promise<string> => (existsSync(`${repoRoot}/${p}`) ? file(`${repoRoot}/${p}`).text() : '')
const exists = (p: string): boolean => existsSync(`${repoRoot}/${p}`)
interface Check {
  deliverable: string
  ok: boolean
  why: string
}
const checks: Check[] = []
const add = (deliverable: string, ok: boolean, why: string): void => {
  checks.push({ deliverable, ok, why })
}
const placeholderHits: string[] = []
const grepPlaceholder =
  await $`git grep -nIE "placeholder = '|placeholder =\"|\\(skipped:" -- packages apps ':!*.test.ts' ':!*.md'`
    .nothrow()
    .text()
for (const line of grepPlaceholder.split('\n')) if (line.trim()) placeholderHits.push(line.trim())
add(
  'zero placeholder-backed exports/strings in shipped source',
  placeholderHits.length === 0,
  placeholderHits.length === 0 ? 'none' : `${placeholderHits.length} hits: ${placeholderHits.slice(0, 3).join(' | ')}`
)
for (const pkg of ['three-kit', 'hud', 'design-tokens', 'sim-engine', 'editor', 'bits', 'boolean']) {
  const src = await read(`packages/${pkg}/src/index.ts`)
  const isStub =
    src.includes('placeholder') &&
    src
      .replaceAll(/\/\*[\s\S]*?\*\//gu, '')
      .trim()
      .split('\n').length < 6
  add(`substrate package ${pkg} is real`, src.length > 0 && !isStub, isStub ? 'placeholder stub' : 'real')
}
const datapathScene = exists('apps/web/src/features/datapath/scene/datapath-scene.tsx')
const datapathSceneSrc = await read('apps/web/src/features/datapath/scene/datapath-scene.tsx')
const hasCanvas = datapathSceneSrc.includes('<Canvas') || datapathSceneSrc.includes('Canvas frameloop')
add(
  '3D datapath scene exists with R3F Canvas',
  datapathScene && hasCanvas,
  datapathScene ? (hasCanvas ? 'Canvas present' : 'no <Canvas>') : 'scene file missing'
)
for (const gen of ['topology.ts', 'isa.ts', 'stepTraces.ts']) {
  const p = `apps/web/src/features/datapath/generated/${gen}`
  add(`datapath generated/${gen}`, exists(p), exists(p) ? 'present' : 'missing')
}
const topo = await read('apps/web/src/features/datapath/generated/topology.ts')
const compCount = (topo.match(/\bid:\s*'[A-Z]/gu) ?? []).length
const pathCount = (topo.match(/_TO_[A-Z]/gu) ?? []).length
add('topology >= 22 components', compCount >= 22, `${compCount} component ids`)
add('topology >= 40 paths', pathCount >= 40, `${pathCount} path refs`)
const kmap3d = exists('apps/web/src/features/kmap/scene/toroidal-kmap.tsx')
const kmap3dSrc = await read('apps/web/src/features/kmap/scene/toroidal-kmap.tsx')
add('3D toroidal K-map scene exists', kmap3d && kmap3dSrc.includes('<Canvas'), kmap3d ? 'present' : 'missing')
add(
  'datapath a11y DOM proxies',
  exists('apps/web/src/features/datapath/a11y/proxies.tsx'),
  exists('apps/web/src/features/datapath/a11y/proxies.tsx') ? 'present' : 'missing'
)
const failed = checks.filter(c => !c.ok)
for (const c of checks) console.log(`${c.ok ? 'ok ' : 'XX '}${c.deliverable} — ${c.why}`)
if (failed.length > 0) {
  console.error(`vision-coverage: ${failed.length} deliverable(s) placeholder-backed or missing`)
  process.exit(1)
}
console.log(`ok vision-coverage ${checks.length} deliverables real`)
process.exit(0)
