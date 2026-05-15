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
/* eslint-disable no-namespace, no-console */
import { contrastRatio, getTheme } from '@sim/design-tokens'
import process from 'node:process'
const variantArg = (process.argv[2] ?? 'normal') as 'deuteranopia' | 'normal' | 'protanopia' | 'tritanopia'
const themeArg = (process.argv[3] ?? 'dark') as 'dark' | 'high-contrast' | 'light'
const tokens = getTheme(themeArg, variantArg)
const bodyAa = 4.5
const aaa = 7
const ratio = contrastRatio(tokens.foreground, tokens.background)
const threshold = themeArg === 'high-contrast' ? aaa : bodyAa
if (ratio < threshold) {
  console.error(`a11y-contrast ${themeArg}/${variantArg}: ${ratio.toFixed(2)} < ${threshold}`)
  process.exit(1)
}
console.log(`ok ${themeArg}/${variantArg} contrast=${ratio.toFixed(2)} >= ${threshold}`)
process.exit(0)
