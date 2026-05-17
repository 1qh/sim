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
const LOCKED_FLOOR_ISA = [
  'add',
  'addi',
  'and',
  'andi',
  'beq',
  'bne',
  'j',
  'lui',
  'lw',
  'nor',
  'or',
  'ori',
  'sll',
  'slt',
  'srl',
  'sub',
  'sw'
] as const
const golden = await read('apps/web/src/features/mips/golden.test.ts')
const goldenMissing = LOCKED_FLOOR_ISA.filter(m => !new RegExp(`['"\`]${m}['"\`]`, 'u').test(golden))
add(
  'golden traces cover all 17 locked-floor instructions',
  goldenMissing.length === 0,
  goldenMissing.length === 0 ? '17/17 present' : `missing: ${goldenMissing.join(',')}`
)
const datapathPage = await read('apps/web/src/app/mips/[name]/page.tsx')
const pageMissing = LOCKED_FLOOR_ISA.filter(m => !new RegExp(`'${m}'`, 'u').test(datapathPage))
add(
  'datapath page animates all 17 locked-floor instructions',
  pageMissing.length === 0,
  pageMissing.length === 0 ? '17/17 wired' : `missing: ${pageMissing.join(',')}`
)
const asmGrammar = await read('apps/web/src/features/datapath/asm-grammar.ts')
add(
  'asm editor MIPS grammar (ASM-EDITOR.md)',
  asmGrammar.length > 0 && /\.data|\.text|monarch|chevrotain|tokeniz/iu.test(asmGrammar),
  asmGrammar.length > 0 ? 'present' : 'missing apps/web/src/features/datapath/asm-grammar.ts'
)
const mipsSrc = await Promise.all(
  ['apps/web/src/features/mips', 'apps/web/src/features/datapath'].map(async d =>
    (
      await $`git grep -lIE "breakpoint|watchpoint|runToCursor|stepBack|syscall|speedControl" -- ${d}`.nothrow().text()
    ).trim()
  )
)
const execOk = mipsSrc.some(s => s.length > 0)
add(
  'execution/debug controls: breakpoint+watchpoint+run-to-cursor+step-back+syscall (REQUIREMENTS.md)',
  execOk,
  execOk ? 'present' : 'missing all debug/exec/syscall code'
)
const pipePage = await read('apps/web/src/app/pipeline/[program]/page.tsx')
add(
  'pipeline stage-time diagram UI (PIPELINE.md)',
  /StageMatrix|PipelineDiagram|stage-time|<table|gridcell/iu.test(pipePage) && pipePage.length > 1500,
  /StageMatrix|PipelineDiagram|stage-time|<table|gridcell/iu.test(pipePage) && pipePage.length > 1500
    ? 'diagram present'
    : 'stub page, no diagram'
)
const cmpPage = await read('apps/web/src/app/compare/page.tsx')
const cmpIsland = exists('apps/web/src/features/compare/compare-island.tsx')
add(
  'compare dual 3D scene (COMPARE.md)',
  cmpIsland || /DatapathIsland[\s\S]*DatapathIsland|split-pane|two.*scene/iu.test(cmpPage),
  cmpIsland ? 'present' : 'no dual-scene compare island'
)
const learnDir = `${repoRoot}/apps/web/content/learn`
const exDir = `${repoRoot}/apps/web/content/examples`
const learnMdx = existsSync(learnDir)
  ? (await $`find ${learnDir} -name '*.mdx'`.nothrow().text()).trim().split('\n').filter(Boolean)
  : []
const mipsEx = existsSync(`${exDir}/mips`)
  ? (await $`find ${exDir}/mips -name '*.mdx'`.nothrow().text()).trim().split('\n').filter(Boolean)
  : []
const kmapEx = existsSync(`${exDir}/kmap`)
  ? (await $`find ${exDir}/kmap -name '*.mdx'`.nothrow().text()).trim().split('\n').filter(Boolean)
  : []
add('learn MDX pages >= 17 (LEARN.md/CONTENT-DESIGN.md)', learnMdx.length >= 17, `${learnMdx.length} pages`)
add('MIPS example library >= 20 (adr/example-library.md)', mipsEx.length >= 20, `${mipsEx.length} examples`)
add('K-map example library >= 20 (adr/example-library.md)', kmapEx.length >= 20, `${kmapEx.length} examples`)
const killer = await read('apps/web/content/learn/cross-link-derive-control-in-kmap.mdx')
add(
  'killer cross-link demo derive-control-in-kmap (LEARN.md headline)',
  killer.length > 0 && /datapath/iu.test(killer) && /kmap|k-map/iu.test(killer),
  killer.length > 0 ? 'present' : 'missing'
)
const palette = (
  await $`git grep -lIE "CommandPalette|command-palette|Cmd\\+K|cmdk" -- apps/web/src`.nothrow().text()
).trim()
add('command palette Cmd+K (adr/command-palette.md)', palette.length > 0, palette.length > 0 ? 'present' : 'missing')
const bookmarks = (
  await $`git grep -lIE "cameraBookmark|CameraBookmark|useBookmark|bookmark" -- apps/web/src packages/three-kit/src`
    .nothrow()
    .text()
).trim()
add('camera bookmarks (UX-DOCTRINE.md)', bookmarks.length > 0, bookmarks.length > 0 ? 'present' : 'missing')
for (const r of [
  'apps/web/src/app/me/page.tsx',
  'apps/web/src/app/learn/[slug]/page.tsx',
  'apps/web/src/app/api/og/[type]/[hash]/route.tsx',
  'apps/web/src/app/accessibility/page.tsx',
  'apps/web/src/app/privacy/page.tsx',
  'apps/web/src/app/terms/page.tsx',
  'apps/web/src/app/api/healthz/route.ts',
  'apps/web/src/app/sitemap.ts'
])
  add(
    `route ${r.replace('apps/web/src/app', '').replace('/page.tsx', '').replace('/route.ts', '')}`,
    exists(r),
    exists(r) ? 'present' : 'missing'
  )
const { GATES } = await import('../../ledger/record-all-gates')
const NOOP = /^\s*(?:true|:|echo\b|exit 0)\s*$/u
const noopGates = GATES.filter(g => NOOP.test(g.cmd) || g.cmd.includes('|| true') || g.cmd.includes('; true'))
add(
  'zero no-op/placeholder ledger gates',
  noopGates.length === 0,
  noopGates.length === 0 ? `${GATES.length} gates all assert` : `no-op: ${noopGates.map(g => g.name).join(',')}`
)
const failed = checks.filter(c => !c.ok)
for (const c of checks) console.log(`${c.ok ? 'ok ' : 'XX '}${c.deliverable} — ${c.why}`)
if (failed.length > 0) {
  console.error(`vision-coverage: ${failed.length} deliverable(s) placeholder-backed or missing`)
  process.exit(1)
}
console.log(`ok vision-coverage ${checks.length} deliverables real`)
process.exit(0)
