/* oxlint-disable unicorn/no-array-reduce */
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
