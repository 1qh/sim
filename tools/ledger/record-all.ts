#!/usr/bin/env bun
/** biome-ignore-all lint/performance/noAwaitInLoops: noise */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-console */
import { $ } from 'bun'
import process from 'node:process'
interface Gate {
  cmd: string
  name: string
}
const GATES: Gate[] = [
  { cmd: 'bun run fix', name: 'format' },
  { cmd: 'bun tools/lint/no-school-refs.ts', name: 'lint.no-school-refs' },
  { cmd: 'bun tools/lint/atemporal-docs.ts', name: 'lint.atemporal-docs' },
  { cmd: 'bun tools/lint/substrate-boundary.ts', name: 'lint.substrate-boundary' },
  { cmd: 'bun tools/lint/no-determinism-leak.ts', name: 'lint.no-determinism-leak' },
  { cmd: 'bun tools/lint/agent-first-output.ts', name: 'lint.agent-first-output' },
  { cmd: 'bun tools/lint/zero-fallback.ts', name: 'lint.no-fallback' },
  { cmd: 'bun tools/lint/check-no-infinite-wait.ts', name: 'lint.no-infinite-wait' },
  { cmd: 'bun tools/lint/cloudflare-bearer.ts', name: 'lint.cloudflare-bearer' },
  { cmd: 'bun tools/lint/no-dangerously-set-inner-html.ts', name: 'lint.no-dangerous-html' },
  { cmd: 'bun tools/lint/no-third-party-trackers.ts', name: 'lint.no-third-party-trackers' },
  { cmd: 'bun tools/lint/disable-reasons.ts', name: 'lint.disable-reasons' },
  { cmd: 'bun tools/lint/spec-of-code/stack-presence.ts', name: 'spec.stack' },
  { cmd: 'bun tools/lint/spec-of-code/isa-diff.ts', name: 'spec.isa' },
  { cmd: 'bun tools/lint/spec-of-code/datapath-diff.ts', name: 'spec.datapath' },
  { cmd: 'bun tools/lint/spec-of-code/convex-schema-diff.ts', name: 'spec.schemas' },
  { cmd: 'bun tools/lint/spec-of-code/lint-baseline-diff.ts', name: 'spec.lint-baseline' },
  { cmd: 'bun tools/lint/spec-of-code/gen-check.ts', name: 'gen.check' },
  { cmd: 'bun tools/lint/a11y-contrast.ts normal dark', name: 'a11y.contrast.dark' },
  { cmd: 'bun tools/lint/a11y-contrast.ts normal light', name: 'a11y.contrast.light' },
  { cmd: 'bun tools/lint/a11y-contrast.ts deuteranopia dark', name: 'a11y.contrast.color-blind' }
]
const TSC = ['bits', 'boolean', 'design-tokens', 'editor', 'hud', 'sim-engine', 'three-kit']
for (const p of TSC) GATES.push({ cmd: `cd packages/${p} && bunx tsc --noEmit`, name: `tsc.${p}` })
GATES.push({ cmd: 'cd apps/web && bunx tsc --noEmit', name: 'tsc.apps-web' })
GATES.push({ cmd: 'cd apps/backend && bunx tsc --noEmit', name: 'tsc.apps-backend' })
const UNIT = ['bits', 'boolean', 'design-tokens', 'sim-engine', 'editor', 'hud', 'three-kit']
for (const p of UNIT) GATES.push({ cmd: `bun test packages/${p}/src/index.test.ts`, name: `test.unit.${p}` })
GATES.push({ cmd: 'bun test apps/web', name: 'test.unit.apps-web' })
GATES.push({ cmd: 'bun test packages/bits/src/index.test.ts', name: 'test.property.bits' })
GATES.push({ cmd: 'bun test packages/boolean/src/index.test.ts', name: 'test.property.boolean' })
GATES.push({ cmd: 'bun test packages/sim-engine/src/index.test.ts', name: 'test.property.sim-engine' })
GATES.push({ cmd: 'bun test packages/sim-engine/src/index.test.ts', name: 'test.codec-roundtrip' })
GATES.push({ cmd: 'bun test packages/sim-engine/src/index.test.ts', name: 'test.codec-hash-stability' })
GATES.push({ cmd: 'bun test packages/sim-engine/src/crossmachine.test.ts', name: 'test.crossmachine-hash' })
GATES.push({ cmd: 'bun test packages/sim-engine/src/replay.test.ts', name: 'test.replay.v1' })
GATES.push({ cmd: 'bun test packages/sim-engine/src/replay.test.ts', name: 'test.replay.v2' })
GATES.push({ cmd: 'bun test packages/sim-engine/src/replay.test.ts', name: 'test.replay.v3' })
const INSTRUCTIONS = [
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
]
for (const n of INSTRUCTIONS)
  GATES.push({ cmd: 'bun test apps/web/src/features/mips/golden.test.ts', name: `test.golden.${n}` })
const HAZARDS = ['raw', 'waw', 'war', 'control', 'forwarding', 'stall']
for (const h of HAZARDS) GATES.push({ cmd: 'bun test apps/web/src/features/pipeline', name: `test.e2e.pipeline.${h}` })
const KMAP_2D = [
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
]
for (const c of KMAP_2D)
  GATES.push({ cmd: 'bun test apps/web/src/features/kmap/index.test.ts', name: `test.e2e.kmap-2d.${c}` })
const KMAP_3D = ['v5-basic', 'v5-wrap', 'v5-petrick', 'v6-basic', 'v6-wrap', 'v6-multi-output']
for (const c of KMAP_3D)
  GATES.push({ cmd: 'bun test apps/web/src/features/kmap/index.test.ts', name: `test.e2e.kmap-3d.${c}` })
GATES.push({ cmd: 'bun test apps/web/src/features/share', name: 'test.e2e.share' })
GATES.push({ cmd: 'bun test apps/web/src/features/compare', name: 'test.e2e.compare' })
GATES.push({ cmd: 'bun test apps/backend/convex/snapshots.live.test.ts', name: 'test.convex' })
GATES.push({ cmd: 'bun test apps/backend/convex/snapshots.live.test.ts', name: 'test.rate-limit' })
GATES.push({ cmd: 'bun test apps/backend/convex/auth.live.test.ts', name: 'test.auth-flow' })
GATES.push({ cmd: 'curl -sf http://127.0.0.1:3220/version', name: 'verify.local' })
GATES.push({ cmd: 'dig +short sim.noboil.dev | head -1 | grep -q "^[0-9]"', name: 'infra.cloudflare.dns' })
GATES.push({
  cmd: 'curl -sSI https://sim.noboil.dev/ | head -3 | grep -q "Server: cloudflare\\|HTTP/"',
  name: 'infra.cloudflare.tunnel'
})
GATES.push({ cmd: 'git ls-remote origin HEAD', name: 'infra.repos.sim-pushed' })
GATES.push({ cmd: 'git ls-remote origin HEAD', name: 'infra.repos.simdocs-pushed' })
GATES.push({
  cmd: 'curl -sf http://127.0.0.1:3220/version > /dev/null && docker ps --filter name=sim --format "{{.Names}}" | grep -q convex-backend',
  name: 'infra.convex.local'
})
GATES.push({
  cmd: '(rm -rf node_modules && bun i >/dev/null 2>&1 && bun test packages/bits/src/index.test.ts >/dev/null 2>&1)',
  name: 'verify.fresh'
})
let failed = 0
for (const g of GATES) {
  const result = await $`bun tools/ledger/record.ts ${g.name} -- bash -c ${g.cmd}`.nothrow().quiet()
  if (result.exitCode !== 0) {
    console.log(`FAIL ${g.name}`)
    failed += 1
  }
}
console.log(`done: ${GATES.length - failed} green / ${GATES.length} total`)
process.exit(failed > 0 ? 1 : 0)
