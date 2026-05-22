#!/usr/bin/env bun
/* eslint-disable no-console */
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
