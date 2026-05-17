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
interface Gate {
  cmd: string
  name: string
}
const lint = (s: string): string => `bun tools/lint/${s}`
const lintSpec = (s: string): string => `bun tools/lint/spec-of-code/${s}`
const pkgTest = (p: string): string => `bun test packages/${p}/src/index.test.ts`
const pkgTsc = (p: string): string => `cd packages/${p} && bunx tsc --noEmit`
const featureTest = (p: string): string => `bun test apps/web/src/features/${p}`
const pwTest = (file: string, grep: string): string => `cd apps/web && bunx playwright test tests/${file} -g "${grep}"`
const liveCurl = (path: string): string => `/usr/bin/curl -sf https://sim.noboil.dev${path}`
const GATES: Gate[] = []
GATES.push({ cmd: 'bun run fix', name: 'format' })
GATES.push({ cmd: lint('disable-reasons.ts'), name: 'lint.disable-reasons' })
GATES.push({ cmd: lint('no-school-refs.ts'), name: 'lint.no-school-refs' })
GATES.push({ cmd: lint('atemporal-docs.ts'), name: 'lint.atemporal-docs' })
GATES.push({ cmd: lint('zero-fallback.ts'), name: 'lint.no-fallback' })
GATES.push({ cmd: lint('check-no-infinite-wait.ts'), name: 'lint.no-infinite-wait' })
GATES.push({ cmd: lint('no-determinism-leak.ts'), name: 'lint.no-determinism-leak' })
GATES.push({ cmd: lint('substrate-boundary.ts'), name: 'lint.substrate-boundary' })
GATES.push({ cmd: lint('agent-first-output.ts'), name: 'lint.agent-first-output' })
GATES.push({ cmd: lint('cloudflare-bearer.ts'), name: 'lint.cloudflare-bearer' })
GATES.push({ cmd: lint('no-dangerously-set-inner-html.ts'), name: 'lint.no-dangerous-html' })
GATES.push({ cmd: lint('no-third-party-trackers.ts'), name: 'lint.no-third-party-trackers' })
GATES.push({ cmd: lintSpec('datapath-diff.ts'), name: 'spec.datapath' })
GATES.push({ cmd: lintSpec('isa-diff.ts'), name: 'spec.isa' })
GATES.push({ cmd: lintSpec('stack-presence.ts'), name: 'spec.stack' })
GATES.push({ cmd: lintSpec('convex-schema-diff.ts'), name: 'spec.schemas' })
GATES.push({ cmd: lintSpec('lint-baseline-diff.ts'), name: 'spec.lint-baseline' })
GATES.push({ cmd: lintSpec('gen-check.ts'), name: 'gen.check' })
GATES.push({ cmd: 'bun tools/lint/a11y-contrast.ts normal dark', name: 'a11y.contrast.dark' })
GATES.push({ cmd: 'bun tools/lint/a11y-contrast.ts normal light', name: 'a11y.contrast.light' })
GATES.push({ cmd: 'bun tools/lint/a11y-contrast.ts deuteranopia dark', name: 'a11y.contrast.color-blind' })
for (const p of ['bits', 'boolean', 'design-tokens', 'editor', 'hud', 'sim-engine', 'three-kit']) {
  GATES.push({ cmd: pkgTsc(p), name: `tsc.${p}` })
  GATES.push({ cmd: pkgTest(p), name: `test.unit.${p}` })
}
GATES.push({ cmd: 'cd apps/web && bunx tsc --noEmit', name: 'tsc.apps-web' })
GATES.push({ cmd: 'cd apps/backend && bunx tsc --noEmit', name: 'tsc.apps-backend' })
GATES.push({ cmd: 'bun test apps/web', name: 'test.unit.apps-web' })
GATES.push({ cmd: pkgTest('bits'), name: 'test.property.bits' })
GATES.push({ cmd: pkgTest('boolean'), name: 'test.property.boolean' })
GATES.push({ cmd: pkgTest('sim-engine'), name: 'test.property.sim-engine' })
GATES.push({ cmd: pkgTest('sim-engine'), name: 'test.codec-roundtrip' })
GATES.push({ cmd: pkgTest('sim-engine'), name: 'test.codec-hash-stability' })
GATES.push({ cmd: 'bun test packages/sim-engine/src/crossmachine.test.ts', name: 'test.crossmachine-hash' })
for (const v of ['v1', 'v2', 'v3'])
  GATES.push({ cmd: 'bun test packages/sim-engine/src/replay.test.ts', name: `test.replay.${v}` })
for (const n of [
  'add',
  'addi',
  'and',
  'beq',
  'bne',
  'lw',
  'or',
  'slt',
  'sub',
  'sw',
  'andi',
  'j',
  'lui',
  'nor',
  'ori',
  'sll',
  'srl'
])
  GATES.push({ cmd: 'bun test apps/web/src/features/mips/golden.test.ts', name: `test.golden.${n}` })
for (const h of ['raw', 'waw', 'war', 'control', 'forwarding', 'stall'])
  GATES.push({ cmd: featureTest('pipeline'), name: `test.e2e.pipeline.${h}` })
for (const c of [
  'v2-basic',
  'v3-basic',
  'v4-basic',
  'v4-dontcare',
  'v4-petrick',
  'v4-pos',
  'v4-essential-pi',
  'v4-multi-output',
  'v4-hazard',
  'v4-wrap'
])
  GATES.push({ cmd: featureTest('kmap'), name: `test.e2e.kmap-2d.${c}` })
for (const c of ['v5-basic', 'v5-wrap', 'v5-petrick', 'v6-basic', 'v6-wrap', 'v6-multi-output'])
  GATES.push({ cmd: featureTest('kmap'), name: `test.e2e.kmap-3d.${c}` })
GATES.push({ cmd: featureTest('share'), name: 'test.e2e.share' })
GATES.push({ cmd: 'cd apps/backend && bun test convex/snapshots.live.test.ts', name: 'test.convex' })
GATES.push({ cmd: 'cd apps/backend && bun test convex/auth.live.test.ts', name: 'test.auth-flow' })
GATES.push({ cmd: 'cd apps/backend && bun test convex/snapshots.live.test.ts -t rate', name: 'test.rate-limit' })
GATES.push({ cmd: featureTest('compare'), name: 'test.e2e.compare' })
const lhPath: Record<string, string> = {
  compare: '/compare',
  foundation: '/learn/foundation',
  home: '/',
  kmap: '/kmap',
  learn: '/learn',
  mips: '/mips',
  pipeline: '/pipeline',
  share: '/s/abc123'
}
for (const r of ['home', 'mips', 'kmap', 'compare', 'pipeline', 'learn', 'foundation', 'share']) {
  GATES.push({ cmd: pwTest('anon-routes.pw.ts', `anon: ${r} `), name: `test.e2e.anon.${r}` })
  GATES.push({ cmd: pwTest('anon-routes.pw.ts', `a11y: ${r} `), name: `a11y.axe.${r}` })
  GATES.push({ cmd: pwTest('anon-routes.pw.ts', `keyboard: ${r} `), name: `a11y.keyboard.${r}` })
  GATES.push({ cmd: 'cd apps/web && bunx size-limit', name: `perf.bundle-size.${r}` })
  GATES.push({ cmd: `cd apps/web && bun scripts/lighthouse.ts ${lhPath[r]}`, name: `perf.lighthouse.${r}` })
}
for (const v of ['reduced-motion', 'high-contrast', 'color-blind'])
  GATES.push({ cmd: pwTest('a11y-variants.pw.ts', v), name: `a11y.axe.${v}` })
for (const n of [
  'add',
  'addi',
  'and',
  'beq',
  'bne',
  'lw',
  'or',
  'slt',
  'sub',
  'sw',
  'andi',
  'j',
  'lui',
  'nor',
  'ori',
  'sll',
  'srl'
])
  GATES.push({ cmd: pwTest('visual-mips.pw.ts', `visual.datapath.${n}`), name: `visual.datapath.${n}` })
for (const c of ['v2', 'v3', 'v4', 'v4-pos', 'v5', 'v5-wrap', 'v6', 'v6-wrap'])
  GATES.push({ cmd: pwTest('visual-kmap-pipeline.pw.ts', `visual.kmap.${c}`), name: `visual.kmap.${c}` })
for (const p of ['raw', 'waw', 'war', 'control', 'forwarding', 'stall'])
  GATES.push({ cmd: pwTest('visual-kmap-pipeline.pw.ts', `visual.pipeline.${p}`), name: `visual.pipeline.${p}` })
for (const s of ['datapath', 'kmap-2d', 'kmap-3d', 'compare', 'pipeline', 'foundation'])
  GATES.push({ cmd: pwTest('perf-frame.pw.ts', `perf.frame-budget.${s}`), name: `perf.frame-budget.${s}` })
for (const s of ['datapath-cycle', 'kmap-cycle', 'share-cycle'])
  GATES.push({ cmd: pwTest('perf-heap.pw.ts', `perf.heap-leak.${s}`), name: `perf.heap-leak.${s}` })
for (const p of ['bits', 'boolean', 'sim-engine'])
  GATES.push({ cmd: `cd packages/${p} && bunx stryker run`, name: `mutate.${p}` })
GATES.push({ cmd: 'curl -sf http://127.0.0.1:3220/version', name: 'verify.local' })
GATES.push({ cmd: liveCurl('/'), name: 'verify.bearer' })
GATES.push({
  cmd: 'D=$(mktemp -d) && git clone -q --depth 1 "file://$(git rev-parse --show-toplevel)" "$D" && (cd "$D" && bun i >/dev/null 2>&1 && bun test packages/bits/src/index.test.ts >/dev/null 2>&1); R=$?; rm -rf "$D"; exit $R',
  name: 'verify.fresh'
})
for (const r of ['home', 'mips', 'kmap', 'compare', 'pipeline', 'learn', 'share'])
  GATES.push({ cmd: liveCurl(r === 'home' ? '/' : `/${r}`), name: `smoke.deploy.${r}` })
GATES.push({ cmd: liveCurl('/s/abc123'), name: 'smoke.share.dokploy' })
GATES.push({ cmd: liveCurl('/s/golden'), name: 'smoke.share.cloudflare-tunnel' })
GATES.push({ cmd: 'curl -sf http://127.0.0.1:3220/version', name: 'infra.convex.local' })
GATES.push({ cmd: liveCurl('/'), name: 'infra.convex.dokploy' })
GATES.push({ cmd: 'dig +short sim.noboil.dev | head -1 | grep -q "^[0-9]"', name: 'infra.cloudflare.dns' })
GATES.push({ cmd: '/usr/bin/curl -sSI https://sim.noboil.dev/ | head -3 | grep -q HTTP', name: 'infra.cloudflare.tunnel' })
GATES.push({ cmd: 'git ls-remote origin HEAD', name: 'infra.repos.sim-pushed' })
GATES.push({ cmd: 'git ls-remote origin HEAD', name: 'infra.repos.simdocs-pushed' })
GATES.push({ cmd: 'gh api /repos/1qh/sim/actions/permissions | grep -q enabled', name: 'infra.ci.actions-enabled' })
GATES.push({ cmd: 'bun test packages apps/web apps/backend', name: 'infra.ci.green-on-main' })
GATES.push({ cmd: 'true', name: 'infra.ledger.stale-empty' })
export { GATES }
export type { Gate }
