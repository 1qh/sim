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
/** biome-ignore-all lint/correctness/useUniqueElementIds: static svg marker ids */
/** biome-ignore-all lint/a11y/useSemanticElements: svg g, real a11y via DatapathA11yProxies */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: svg g, real a11y via DatapathA11yProxies */
/* oxlint-disable unicorn/no-array-reduce, unicorn/no-immediate-mutation, unicorn/number-literal-case, unicorn/no-process-exit, import/no-duplicates, promise/param-names, @eslint-react/naming-convention/component-name, complexity, jsx-a11y/prefer-tag-over-role */
'use client'
import { useEffect, useMemo, useState } from 'react'
import type { Step } from '@/features/datapath/generated/stepTraces'
import type { ControlSignals } from '@/features/mips/types'
import { activePaths, componentsForPaths } from '@/features/datapath/generated/stepTraces'
import { COMPONENTS, PATHS } from '@/features/datapath/generated/topology'

const ACCENT = '#22d3ee'
const CRITICAL = '#f97316'
const SELECTED = '#a855f7'
const KIND_COLOR: Record<string, string> = { alu: '#ef4444', gate: '#eab308', mem: '#3b82f6', mux: '#22c55e' }
const RE_GATE = /And$|Gate$|^Zero$/u
const kindOf = (id: string): 'alu' | 'gate' | 'mem' | 'mux' => {
  if (id.endsWith('Mux')) return 'mux'
  if (id === 'ALU') return 'alu'
  if (RE_GATE.test(id)) return 'gate'
  return 'mem'
}
const RE_IMM = /IMM|SIGN|imm/u
const RE_REG = /_RS_|_RT_|_RD_|SHAMT/u
const widthOf = (id: string): number => {
  if (RE_IMM.test(id)) return 16
  if (RE_REG.test(id)) return 5
  return 32
}
const contrastOf = (hex: string): string => {
  const h = hex.replace('#', '')
  const r = Number.parseInt(h.slice(0, 2), 16)
  const g = Number.parseInt(h.slice(2, 4), 16)
  const b = Number.parseInt(h.slice(4, 6), 16)
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#0b0f14' : '#f8fafc'
}
const S = 36
const PAD = 60
const xs = COMPONENTS.flatMap(c => [c.pos[0] - c.size[0] / 2, c.pos[0] + c.size[0] / 2])
const ys = COMPONENTS.flatMap(c => [c.pos[1] - c.size[1] / 2, c.pos[1] + c.size[1] / 2])
const MINX = Math.min(...xs)
const MAXX = Math.max(...xs)
const MINY = Math.min(...ys)
const MAXY = Math.max(...ys)
const VW = (MAXX - MINX) * S + PAD * 2
const VH = (MAXY - MINY) * S + PAD * 2
const px = (x: number): number => (x - MINX) * S + PAD
const py = (y: number): number => (MAXY - y) * S + PAD
const CENTER = new Map(COMPONENTS.map(c => [c.id, { x: px(c.pos[0]), y: py(c.pos[1]) }]))
const usePrefersReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(true)
  useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)')
    // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
    setReduced(m.matches)
    const onChange = (): void => setReduced(m.matches)
    m.addEventListener('change', onChange)
    return () => m.removeEventListener('change', onChange)
  }, [])
  return reduced
}
const Datapath2D = ({
  control,
  critical,
  step,
  showCritical,
  selected,
  values,
  onSelect
}: {
  control: ControlSignals
  critical: readonly string[]
  onSelect: (id: string) => void
  selected: string | undefined
  showCritical: boolean
  step: Step
  values: Record<string, string>
}): React.JSX.Element => {
  const reduced = usePrefersReducedMotion()
  const criticalSet = useMemo(() => new Set(critical), [critical])
  const activeP = useMemo(() => new Set(activePaths(control, step)), [control, step])
  const activeC = useMemo(() => new Set(componentsForPaths([...activeP])), [activeP])
  return (
    <div className='size-full overflow-hidden' data-testid='datapath-canvas'>
      <svg className='size-full' role='img' viewBox={`0 0 ${VW} ${VH}`}>
        <title>MIPS single-cycle datapath</title>
        <defs>
          <marker id='ah' markerHeight='6' markerWidth='6' orient='auto' refX='5' refY='3'>
            <path d='M0,0 L6,3 L0,6 Z' fill={ACCENT} />
          </marker>
          <marker id='ahd' markerHeight='5' markerWidth='5' orient='auto' refX='4' refY='2.5'>
            <path className='fill-muted-foreground' d='M0,0 L5,2.5 L0,5 Z' />
          </marker>
        </defs>
        {PATHS.map(p => {
          const a = CENTER.get(p.from)
          const b = CENTER.get(p.to)
          if (a === undefined || b === undefined) return null
          const on = activeP.has(p.id)
          const midX = (a.x + b.x) / 2
          const d = `M ${a.x} ${a.y} L ${midX} ${a.y} L ${midX} ${b.y} L ${b.x} ${b.y}`
          return (
            <g key={p.id}>
              <path
                d={d}
                fill='none'
                markerEnd={on ? 'url(#ah)' : 'url(#ahd)'}
                stroke={on ? ACCENT : 'currentColor'}
                strokeDasharray={on ? '8 5' : undefined}
                strokeWidth={on ? 2.4 : 1}
                {...(on ? {} : { className: 'text-muted-foreground/40' })}>
                {on && !reduced ? (
                  <animate attributeName='stroke-dashoffset' dur='0.6s' from='13' repeatCount='indefinite' to='0' />
                ) : undefined}
              </path>
              {on ? (
                <text className='fill-muted-foreground' fontSize='9' x={midX + 3} y={(a.y + b.y) / 2 - 3}>
                  {widthOf(p.id)}
                </text>
              ) : undefined}
            </g>
          )
        })}
        {COMPONENTS.map(c => {
          const cx = px(c.pos[0])
          const cy = py(c.pos[1])
          const w = c.size[0] * S
          const h = c.size[1] * S
          const isCritical = showCritical && criticalSet.has(c.id)
          const isActive = activeC.has(c.id)
          const isSelected = selected === c.id
          const fill = isSelected ? SELECTED : isCritical ? CRITICAL : (KIND_COLOR[kindOf(c.id)] ?? '#64748b')
          const lit = isSelected || isCritical || isActive
          const label = contrastOf(fill)
          return (
            <g
              aria-label={c.id}
              className='cursor-pointer'
              key={c.id}
              onClick={() => onSelect(c.id)}
              onKeyDown={e => {
                if (e.key === 'Enter') onSelect(c.id)
              }}
              role='button'
              tabIndex={0}>
              <rect
                fill={fill}
                fillOpacity={lit ? 1 : 0.45}
                height={h}
                rx={Math.min(w, h) * 0.18}
                stroke={lit ? fill : 'transparent'}
                strokeWidth={2}
                width={w}
                x={cx - w / 2}
                y={cy - h / 2}
                {...(lit ? { style: { filter: `drop-shadow(0 0 6px ${fill})` } } : {})}
              />
              <text
                dominantBaseline='middle'
                fill={lit ? label : 'currentColor'}
                fontSize='11'
                textAnchor='middle'
                x={cx}
                y={cy}
                {...(lit ? {} : { className: 'fill-muted-foreground' })}>
                {c.id}
              </text>
              {isActive && values[c.id] !== undefined ? (
                <text fill={ACCENT} fontSize='10' textAnchor='middle' x={cx} y={cy + h / 2 + 12}>
                  {values[c.id]}
                </text>
              ) : undefined}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
export default Datapath2D
