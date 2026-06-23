#!/usr/bin/env bun
/** biome-ignore-all lint/style/noProcessEnv: reads harness-passed LEDGER_TREE for cache key */
/** biome-ignore-all lint/performance/noAwaitInLoops: noise */
/* oxlint-disable promise/param-names */
/* eslint-disable no-await-in-loop, no-console */
import { $, file, gzipSync, write } from 'bun'
import { access, mkdir } from 'node:fs/promises'
import process from 'node:process'

const dirExists = async (p: string): Promise<boolean> => {
  const ok = await access(p)
    .then(() => true)
    .catch(() => false)
  return ok
}
const SHARED_FIRST_LOAD_GZ_LIMIT = 200 * 1024
const RE_HEAVY = /monaco|three/iu
const envTree = process.env.LEDGER_TREE
const key = envTree ?? 'manual'
const resultFile = `/tmp/size-limit-${key}.json`
const lockDir = `/tmp/size-limit-${key}.lock`
const cachedCode = async (): Promise<number | undefined> =>
  (await file(resultFile).exists()) ? ((await file(resultFile).json()) as { code: number }).code : undefined
const measure = async (): Promise<number> => {
  if (!(await file('.next/build-manifest.json').exists())) {
    const b = await $`bunx next build`.nothrow().quiet()
    if (b.exitCode !== 0) {
      console.error('size-limit: next build failed')
      return 1
    }
  }
  const manifest = (await file('.next/build-manifest.json').json()) as {
    polyfillFiles?: string[]
    rootMainFiles?: string[]
  }
  const shared = [...(manifest.rootMainFiles ?? []), ...(manifest.polyfillFiles ?? [])]
  let gz = 0
  for (const f of shared) {
    const bf = file(`.next/${f}`)
    if (await bf.exists()) {
      const bytes = await bf.bytes()
      // oxlint-disable-next-line node/no-sync -- gzip/gunzip is CPU work, not blocking I/O
      gz += gzipSync(bytes).length
    }
  }
  const heavyInShared = shared.some(f => RE_HEAVY.test(f))
  const ok = gz <= SHARED_FIRST_LOAD_GZ_LIMIT && !heavyInShared
  console.log(
    `size-limit: shared first-load ${(gz / 1024).toFixed(0)}KB gz (limit ${SHARED_FIRST_LOAD_GZ_LIMIT / 1024}KB), heavy-deps-lazy ${!heavyInShared} => ${ok ? 'ok' : 'FAIL'}`
  )
  return ok ? 0 : 1
}
const pre = await cachedCode()
if (pre !== undefined) process.exit(pre)
let acquired = false
try {
  await mkdir(lockDir)
  acquired = true
} catch {
  while ((await dirExists(lockDir)) && !(await file(resultFile).exists()))
    await new Promise(res => {
      setTimeout(res, 1000)
    })
  const c = await cachedCode()
  if (c !== undefined) process.exit(c)
}
const code = await measure()
if (code === 0) await write(resultFile, JSON.stringify({ code }))
if (acquired) await $`rmdir ${lockDir}`.nothrow().quiet()
process.exit(code)
