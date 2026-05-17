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
interface TelemetryRow {
  label: string
  value: string
}
const formatTelemetry = (rows: readonly TelemetryRow[]): string => {
  const w = rows.reduce((m, r) => Math.max(m, r.label.length), 0)
  return rows.map(r => `${r.label.padEnd(w)}  ${r.value}`).join('\n')
}
const buildBreadcrumb = (segments: readonly string[], maxDepth = 4): string => {
  if (segments.length <= maxDepth) return segments.join(' / ')
  return `… / ${segments.slice(segments.length - maxDepth).join(' / ')}`
}
interface DockSpec {
  edge: 'bottom' | 'left' | 'right' | 'top'
  margin?: number
  size: { height: number; width: number }
  viewport: { height: number; width: number }
}
interface PanelRect {
  height: number
  width: number
  x: number
  y: number
}
const dockPanel = ({ edge, viewport, size, margin = 16 }: DockSpec): PanelRect => {
  if (edge === 'right')
    return { height: size.height, width: size.width, x: viewport.width - size.width - margin, y: margin }
  if (edge === 'bottom')
    return { height: size.height, width: size.width, x: margin, y: viewport.height - size.height - margin }
  return { height: size.height, width: size.width, x: margin, y: margin }
}
const coalesceAnnouncements = (messages: readonly string[]): string => messages.join(' ')
export { buildBreadcrumb, coalesceAnnouncements, dockPanel, formatTelemetry }
export type { DockSpec, PanelRect, TelemetryRow }
