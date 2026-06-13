/** biome-ignore-all lint/performance/noAwaitInLoops: noise */
/* eslint-disable no-console, no-await-in-loop */
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
const RE_CHROME_HEAVY =
  /^visual\.|^a11y\.(?:axe|keyboard)|^perf\.(?:lighthouse|frame-budget|heap-leak|bundle-size)|^test\.e2e\./u
const isChromeHeavy = (name: string): boolean => RE_CHROME_HEAVY.test(name)
const runPool = async (gates: Gate[]): Promise<number> => {
  let failed = 0
  const first = gates.find(g => g.name === 'format')
  const terminal = gates.find(g => g.name === LAST)
  const middle = gates.filter(g => g.name !== 'format' && g.name !== LAST)
  const chromeHeavy = middle.filter(g => isChromeHeavy(g.name))
  const rest = middle.filter(g => !isChromeHeavy(g.name))
  if (first !== undefined && !(await runOne(first))) failed += 1
  let idx = 0
  const worker = async (): Promise<void> => {
    while (idx < rest.length) {
      const g = rest[idx]
      idx += 1
      if (g !== undefined && !(await runOne(g))) failed += 1
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, rest.length) }, async () => worker()))
  for (const g of chromeHeavy) if (!(await runOne(g))) failed += 1
  if (terminal !== undefined && !(await runOne(terminal))) failed += 1
  return failed
}
export { ledgerEnv, runPool }
