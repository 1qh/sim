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
import Color from 'colorjs.io'
type ColorBlindVariant = 'deuteranopia' | 'normal' | 'protanopia' | 'tritanopia'
type Theme = 'dark' | 'high-contrast' | 'light'
interface Token {
  description: string
  oklch: [number, number, number]
  role: TokenRole
}
type TokenRole =
  | 'accent'
  | 'background'
  | 'border'
  | 'destructive'
  | 'emissive'
  | 'foreground'
  | 'highlight'
  | 'muted'
  | 'muted-foreground'
  | 'shadow'
  | 'success'
  | 'surface'
  | 'warning'
const dark: Record<TokenRole, Token> = {
  accent: { description: 'interactive accent', oklch: [0.78, 0.16, 230], role: 'accent' },
  background: { description: 'page background near-black', oklch: [0.12, 0.005, 240], role: 'background' },
  border: { description: 'subtle separator', oklch: [0.3, 0.01, 240], role: 'border' },
  destructive: { description: 'error / destructive action', oklch: [0.62, 0.22, 25], role: 'destructive' },
  emissive: { description: 'signal-pulse glow', oklch: [0.92, 0.18, 195], role: 'emissive' },
  foreground: { description: 'primary text', oklch: [0.95, 0.008, 240], role: 'foreground' },
  highlight: { description: 'selection / focus ring', oklch: [0.7, 0.18, 80], role: 'highlight' },
  muted: { description: 'low-emphasis surface', oklch: [0.22, 0.008, 240], role: 'muted' },
  'muted-foreground': { description: 'low-emphasis text', oklch: [0.7, 0.008, 240], role: 'muted-foreground' },
  shadow: { description: 'cast shadow', oklch: [0.06, 0.003, 240], role: 'shadow' },
  success: { description: 'success / confirm', oklch: [0.7, 0.18, 145], role: 'success' },
  surface: { description: 'panel surface', oklch: [0.18, 0.006, 240], role: 'surface' },
  warning: { description: 'caution', oklch: [0.78, 0.16, 75], role: 'warning' }
}
const light: Record<TokenRole, Token> = {
  accent: { description: 'interactive accent', oklch: [0.55, 0.18, 230], role: 'accent' },
  background: { description: 'page background near-white', oklch: [0.98, 0.003, 240], role: 'background' },
  border: { description: 'subtle separator', oklch: [0.85, 0.008, 240], role: 'border' },
  destructive: { description: 'error / destructive action', oklch: [0.52, 0.22, 25], role: 'destructive' },
  emissive: { description: 'signal-pulse glow', oklch: [0.65, 0.2, 195], role: 'emissive' },
  foreground: { description: 'primary text', oklch: [0.18, 0.008, 240], role: 'foreground' },
  highlight: { description: 'selection / focus ring', oklch: [0.55, 0.18, 80], role: 'highlight' },
  muted: { description: 'low-emphasis surface', oklch: [0.94, 0.005, 240], role: 'muted' },
  'muted-foreground': { description: 'low-emphasis text', oklch: [0.45, 0.008, 240], role: 'muted-foreground' },
  shadow: { description: 'cast shadow', oklch: [0.85, 0.003, 240], role: 'shadow' },
  success: { description: 'success / confirm', oklch: [0.5, 0.2, 145], role: 'success' },
  surface: { description: 'panel surface', oklch: [0.96, 0.005, 240], role: 'surface' },
  warning: { description: 'caution', oklch: [0.55, 0.18, 75], role: 'warning' }
}
const highContrast: Record<TokenRole, Token> = {
  accent: { description: 'interactive accent', oklch: [0.92, 0.22, 230], role: 'accent' },
  background: { description: 'pure black', oklch: [0, 0, 0], role: 'background' },
  border: { description: 'high-contrast separator', oklch: [1, 0, 0], role: 'border' },
  destructive: { description: 'error', oklch: [0.7, 0.3, 25], role: 'destructive' },
  emissive: { description: 'signal glow', oklch: [1, 0.2, 195], role: 'emissive' },
  foreground: { description: 'pure white', oklch: [1, 0, 0], role: 'foreground' },
  highlight: { description: 'high-vis focus ring', oklch: [0.85, 0.25, 80], role: 'highlight' },
  muted: { description: 'panel', oklch: [0.15, 0, 0], role: 'muted' },
  'muted-foreground': { description: 'softened text', oklch: [0.85, 0, 0], role: 'muted-foreground' },
  shadow: { description: 'cast shadow', oklch: [0, 0, 0], role: 'shadow' },
  success: { description: 'success', oklch: [0.85, 0.25, 145], role: 'success' },
  surface: { description: 'panel', oklch: [0.1, 0, 0], role: 'surface' },
  warning: { description: 'caution', oklch: [0.92, 0.2, 75], role: 'warning' }
}
const themes: Record<Theme, Record<TokenRole, Token>> = { dark, 'high-contrast': highContrast, light }
const HUE_SHIFT: Record<ColorBlindVariant, (h: number) => number> = {
  deuteranopia: h => (h + 35) % 360,
  normal: h => h,
  protanopia: h => (h + 50) % 360,
  tritanopia: h => (h + 180) % 360
}
const toCssOklch = (token: Token): string => `oklch(${token.oklch[0]} ${token.oklch[1]} ${token.oklch[2]})`
const toCssHex = (token: Token): string => {
  const c = new Color('oklch', [...token.oklch])
  return c.to('srgb').toString({ format: 'hex' })
}
const shiftHue = (token: Token, variant: ColorBlindVariant): Token => ({
  ...token,
  oklch: [token.oklch[0], token.oklch[1], HUE_SHIFT[variant](token.oklch[2])]
})
const getTheme = (theme: Theme, variant: ColorBlindVariant = 'normal'): Record<TokenRole, Token> => {
  const base = themes[theme]
  if (variant === 'normal') return base
  const out = {} as Record<TokenRole, Token>
  for (const role of Object.keys(base) as TokenRole[]) out[role] = shiftHue(base[role], variant)
  return out
}
const cssVarName = (role: TokenRole): string => `--color-${role}`
const renderCssVars = (theme: Theme, variant: ColorBlindVariant = 'normal'): string => {
  const tokens = getTheme(theme, variant)
  const lines: string[] = []
  for (const role of Object.keys(tokens) as TokenRole[]) lines.push(`${cssVarName(role)}: ${toCssOklch(tokens[role])};`)
  return lines.join('\n')
}
const contrastRatio = (fg: Token, bg: Token): number => {
  const a = new Color('oklch', [...fg.oklch])
  const b = new Color('oklch', [...bg.oklch])
  return Math.abs(a.contrast(b, 'WCAG21'))
}
export { contrastRatio, cssVarName, getTheme, HUE_SHIFT, renderCssVars, shiftHue, themes, toCssHex, toCssOklch }
export type { ColorBlindVariant, Theme, Token, TokenRole }
