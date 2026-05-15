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
/* eslint-disable no-namespace */
import { describe, expect, test } from 'bun:test'
import {
  contrastRatio,
  cssVarName,
  getTheme,
  HUE_SHIFT,
  renderCssVars,
  shiftHue,
  themes,
  toCssHex,
  toCssOklch
} from './index'
describe('themes shape', () => {
  test('every theme defines every role', () => {
    const roles = Object.keys(themes.dark)
    expect(Object.keys(themes.light).toSorted()).toEqual(roles.toSorted())
    expect(Object.keys(themes['high-contrast']).toSorted()).toEqual(roles.toSorted())
  })
})
describe('hue shift', () => {
  test('normal is identity', () => {
    const t = themes.dark.accent
    expect(shiftHue(t, 'normal').oklch[2]).toBe(t.oklch[2])
  })
  test('protanopia shifts hue by 50', () => {
    expect(HUE_SHIFT.protanopia(230)).toBe(280)
    expect(HUE_SHIFT.protanopia(330)).toBe(20)
  })
  test('tritanopia shifts hue by 180', () => {
    expect(HUE_SHIFT.tritanopia(0)).toBe(180)
    expect(HUE_SHIFT.tritanopia(200)).toBe(20)
  })
})
describe('contrast', () => {
  test('dark foreground vs dark background passes WCAG AA for body text', () => {
    const ratio = contrastRatio(themes.dark.foreground, themes.dark.background)
    expect(ratio).toBeGreaterThanOrEqual(4.5)
  })
  test('light foreground vs light background passes WCAG AA for body text', () => {
    const ratio = contrastRatio(themes.light.foreground, themes.light.background)
    expect(ratio).toBeGreaterThanOrEqual(4.5)
  })
  test('high-contrast theme exceeds 7:1', () => {
    const ratio = contrastRatio(themes['high-contrast'].foreground, themes['high-contrast'].background)
    expect(ratio).toBeGreaterThanOrEqual(7)
  })
})
describe('css emit', () => {
  test('cssVarName uses --color- prefix', () => {
    expect(cssVarName('accent')).toBe('--color-accent')
    expect(cssVarName('muted-foreground')).toBe('--color-muted-foreground')
  })
  test('toCssOklch emits oklch(L C H) format', () => {
    expect(toCssOklch(themes.dark.accent)).toMatch(/^oklch\(0?\.78 0?\.16 230\)$/u)
  })
  test('toCssHex emits #rrggbb sRGB', () => {
    expect(toCssHex(themes.dark.accent)).toMatch(/^#[0-9a-f]{6}$/iu)
  })
  test('renderCssVars contains every role', () => {
    const css = renderCssVars('dark')
    for (const role of Object.keys(themes.dark)) expect(css).toContain(`--color-${role}`)
  })
})
describe('getTheme variant fan-out', () => {
  test('protanopia variant differs from normal on hue but matches on L,C', () => {
    const normal = getTheme('dark', 'normal').accent
    const pro = getTheme('dark', 'protanopia').accent
    expect(pro.oklch[0]).toBe(normal.oklch[0])
    expect(pro.oklch[1]).toBe(normal.oklch[1])
    expect(pro.oklch[2]).not.toBe(normal.oklch[2])
  })
})
