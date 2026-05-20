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
/* eslint-disable no-console, no-await-in-loop, no-continue */
import { $ } from 'bun'
import { createHash } from 'node:crypto'
import type { Gate } from './record-all-gates'

const TREE_PATHSPEC = [':!apps/backend/convex/_generated/*', ':!tools/ledger/*']
const ledgerEnv = async (): Promise<Record<string, string>> => {
  const repoRoot = (await $`git rev-parse --show-toplevel`.text()).trim()
  const commit = (await $`git rev-parse HEAD`.text()).trim()
  const treeRaw = (await $`git ls-files -s -- ${TREE_PATHSPEC}`.text()) + (await $`git diff -- ${TREE_PATHSPEC}`.text())
  const tree = createHash('sha256').update(treeRaw).digest('hex').slice(0, 16)
  return { LEDGER_COMMIT: commit, LEDGER_REPO_ROOT: repoRoot, LEDGER_TREE: tree }
}
const CONCURRENCY = 4
const runOne = async (g: Gate): Promise<boolean> => {
  const result = await $`bun tools/ledger/record.ts ${g.name} -- bash -c ${g.cmd}`.nothrow().quiet()
  if (result.exitCode !== 0) {
    console.log(`FAIL ${g.name}`)
    return false
  }
  return true
}
const LAST = 'infra.ledger.stale-empty'
const runPool = async (gates: Gate[]): Promise<number> => {
  let failed = 0
  const first = gates.find(g => g.name === 'format')
  const terminal = gates.find(g => g.name === LAST)
  const rest = gates.filter(g => g.name !== 'format' && g.name !== LAST)
  if (first !== undefined && !(await runOne(first))) failed += 1
  let idx = 0
  const worker = async (): Promise<void> => {
    while (idx < rest.length) {
      const g = rest[idx]
      idx += 1
      if (g === undefined) continue
      if (!(await runOne(g))) failed += 1
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, rest.length) }, async () => worker()))
  if (terminal !== undefined && !(await runOne(terminal))) failed += 1
  return failed
}
export { ledgerEnv, runPool }
