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
/** biome-ignore-all lint/performance/useTopLevelRegex: hoisted */
/** biome-ignore-all lint/a11y/useSemanticElements: svg g, real a11y via DatapathA11yProxies */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: svg g, real a11y via DatapathA11yProxies */
/* oxlint-disable unicorn/no-array-reduce, unicorn/no-immediate-mutation, unicorn/number-literal-case, unicorn/no-process-exit, import/no-duplicates, promise/param-names, @eslint-react/naming-convention/component-name, complexity, jsx-a11y/prefer-tag-over-role, eslint/no-bitwise */
/* eslint-disable complexity, no-bitwise */
'use client'
import { useEffect, useMemo, useState } from 'react'
import type { Step } from '@/features/datapath/generated/stepTraces'
import type { Node } from '@/features/datapath/scene-2d/datapath-graph'
import type { ControlSignals } from '@/features/mips/types'
import { activePaths, componentsForPaths } from '@/features/datapath/generated/stepTraces'
import { PATHS } from '@/features/datapath/generated/topology'
import {
  isControlPath,
  JUNCTIONS,
  NODE_COLOR,
  NODES,
  pathPoints,
  VH,
  VW
} from '@/features/datapath/scene-2d/datapath-graph'

const ACCENT = '#22d3ee'
const ACTIVE = '#ef4444'
const CRITICAL = '#f59e0b'
const SELECTED = '#a855f7'
const CONTROL_WIRE = '#3b82f6'
const SIGNAL_LABEL: Record<string, string> = {
  ALUOP_TO_ALU_CONTROL: 'ALUOp',
  ALU_CONTROL_TO_ALU: 'ALUctl',
  BRANCHNE_TO_BNE_AND_GATE: 'BranchNE',
  BRANCH_TO_BEQ_AND_GATE: 'Branch',
  CONTROL_TO_ALUSRC_MUX: 'ALUSrc',
  CONTROL_TO_MEMREAD: 'MemRead',
  CONTROL_TO_MEMTOREG_MUX: 'MemToReg',
  CONTROL_TO_MEMWRITE: 'MemWrite',
  CONTROL_TO_REGDST_MUX: 'RegDst',
  CONTROL_TO_REGWRITE: 'RegWrite',
  IR_FUNCT_TO_ALU_CONTROL: 'funct',
  IR_OPCODE_TO_CONTROL: 'opcode'
}
const PORTS: Record<string, { frac: number; name: string; side: 'l' | 'r' }[]> = {
  ALU: [
    { frac: 0.22, name: 'is0?', side: 'r' },
    { frac: 0.58, name: 'result', side: 'r' }
  ],
  DM: [
    { frac: 0.28, name: 'Addr', side: 'l' },
    { frac: 0.8, name: 'WrData', side: 'l' },
    { frac: 0.28, name: 'RdData', side: 'r' }
  ],
  IM: [
    { frac: 0.74, name: 'Addr', side: 'l' },
    { frac: 0.5, name: 'Instr', side: 'r' }
  ],
  RF: [
    { frac: 0.24, name: 'RR1', side: 'l' },
    { frac: 0.42, name: 'RR2', side: 'l' },
    { frac: 0.62, name: 'WR', side: 'l' },
    { frac: 0.82, name: 'WD', side: 'l' },
    { frac: 0.36, name: 'RD1', side: 'r' },
    { frac: 0.66, name: 'RD2', side: 'r' }
  ]
}
const TAP_LABEL: Record<string, string> = {
  IR_IMM_TO_SIGN_EXTEND: 'Inst[15:0]',
  IR_RD_TO_REGDST_MUX1: 'Inst[15:11]',
  IR_RS_TO_RF_RR1: 'Inst[25:21]',
  IR_RT_TO_REGDST_MUX0: 'Inst[20:16]',
  IR_RT_TO_RF_RR2: 'Inst[20:16]'
}
const RULER = [
  { hi: 31, lo: 26, name: 'opcode' },
  { hi: 25, lo: 21, name: 'rs' },
  { hi: 20, lo: 16, name: 'rt' },
  { hi: 15, lo: 11, name: 'rd' },
  { hi: 10, lo: 6, name: 'shamt' },
  { hi: 5, lo: 0, name: 'funct' }
]
const bitsOf = (word: number, hi: number, lo: number): string => {
  const n = hi - lo + 1
  return ((word >>> lo) & ((1 << n) - 1)).toString(2).padStart(n, '0')
}
const RE_IMM = /IMM|SIGN/u
const RE_REG = /_RS_|_RT_|_RD_|REGDST/u
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
const wireD = (pts: { x: number; y: number }[]): string => {
  const first = pts[0]
  if (first === undefined) return ''
  let d = `M ${first.x} ${first.y}`
  for (let i = 1; i < pts.length; i += 1) {
    const p = pts[i - 1]
    const q = pts[i]
    if (p !== undefined && q !== undefined) d += ` L ${q.x} ${p.y} L ${q.x} ${q.y}`
  }
  return d
}
const OVAL = new Set(['LS2', 'SE'])
const ADDER = new Set(['Add4', 'BranchAdder'])
const shape = (n: Node, fill: string, lit: boolean): React.JSX.Element => {
  const { x, y, w, h } = n
  const common = { fill, fillOpacity: lit ? 1 : 0.5, stroke: lit ? fill : 'transparent', strokeWidth: 2 }
  const glow = lit ? { style: { filter: `drop-shadow(0 0 5px ${fill})` } } : {}
  if (OVAL.has(n.id)) return <ellipse cx={x} cy={y} rx={w / 2} ry={h / 2} {...common} {...glow} />
  if (ADDER.has(n.id))
    return (
      <polygon
        points={`${x - w / 2},${y - h / 2} ${x + w / 2},${y - h / 4} ${x + w / 2},${y + h / 4} ${x - w / 2},${y + h / 2} ${x - w / 2},${y + h / 6} ${x - w / 2 + 10},${y} ${x - w / 2},${y - h / 6}`}
        {...common}
        {...glow}
      />
    )
  if (n.kind === 'mux')
    return (
      <polygon
        points={`${x - w / 2},${y - h / 2} ${x + w / 2},${y - h / 2 + 12} ${x + w / 2},${y + h / 2 - 12} ${x - w / 2},${y + h / 2}`}
        {...common}
        {...glow}
      />
    )
  if (n.kind === 'alu')
    return (
      <polygon
        points={`${x - w / 2},${y - h / 2} ${x + w / 2},${y - h / 4} ${x + w / 2},${y + h / 4} ${x - w / 2},${y + h / 2} ${x - w / 2},${y + h / 6} ${x - w / 2 + 12},${y} ${x - w / 2},${y - h / 6}`}
        {...common}
        {...glow}
      />
    )
  if (n.kind === 'gate' || n.kind === 'const') return <ellipse cx={x} cy={y} rx={w / 2} ry={h / 2} {...common} {...glow} />
  return <rect height={h} rx={6} width={w} x={x - w / 2} y={y - h / 2} {...common} {...glow} />
}
const Datapath2D = ({
  control,
  critical,
  step,
  showCritical,
  selected,
  values,
  word,
  onSelect
}: {
  control: ControlSignals
  critical: readonly string[]
  onSelect: (id: string) => void
  selected: string | undefined
  showCritical: boolean
  step: Step
  values: Record<string, string>
  word: number
}): React.JSX.Element => {
  const reduced = usePrefersReducedMotion()
  const criticalSet = useMemo(() => new Set(critical), [critical])
  const activeP = useMemo(() => new Set(activePaths(control, step)), [control, step])
  const activeC = useMemo(() => new Set(componentsForPaths([...activeP])), [activeP])
  const activePts = useMemo(() => {
    const s = new Set<string>()
    for (const p of PATHS) if (activeP.has(p.id)) for (const pt of pathPoints(p.id)) s.add(`${pt.x},${pt.y}`)
    return s
  }, [activeP])
  return (
    <div className='size-full overflow-hidden' data-testid='datapath-canvas'>
      <svg className='size-full' role='img' viewBox={`0 0 ${VW} ${VH}`}>
        <title>MIPS single-cycle datapath</title>
        <defs>
          <marker id='ah' markerHeight='6' markerWidth='6' orient='auto' refX='5' refY='3'>
            <path d='M0,0 L6,3 L0,6 Z' fill={ACTIVE} />
          </marker>
          <marker id='ahd' markerHeight='5' markerWidth='5' orient='auto' refX='4' refY='2.5'>
            <path className='fill-muted-foreground' d='M0,0 L5,2.5 L0,5 Z' />
          </marker>
        </defs>
        <text className='fill-muted-foreground' fontSize='8' x={170} y={376}>
          instruction
        </text>
        {RULER.map((f, i) => (
          <g key={f.name}>
            <rect
              className='fill-transparent stroke-muted-foreground/40'
              height={36}
              rx={3}
              width={120}
              x={166}
              y={384 + i * 40}
            />
            <text className='fill-muted-foreground' fontSize='8' x={172} y={398 + i * 40}>
              {f.name} [{f.hi}:{f.lo}]
            </text>
            <text className='fill-foreground font-mono' fontSize='11' x={172} y={413 + i * 40}>
              {bitsOf(word, f.hi, f.lo)}
            </text>
          </g>
        ))}
        {PATHS.map(p => {
          const pts = pathPoints(p.id)
          if (pts.length === 0) return null
          const on = activeP.has(p.id)
          const ctrl = isControlPath(p.id)
          const mid = pts[Math.floor(pts.length / 2)] ?? pts[0]
          const start = pts[0]
          const stroke = on ? ACTIVE : ctrl ? CONTROL_WIRE : 'currentColor'
          const sig = SIGNAL_LABEL[p.id]
          const tap = TAP_LABEL[p.id]
          return (
            <g key={p.id}>
              {tap !== undefined && start !== undefined ? (
                <text className='fill-muted-foreground' fontSize='7.5' x={start.x + 4} y={start.y - 4}>
                  {tap}
                </text>
              ) : undefined}
              <path
                d={wireD(pts)}
                fill='none'
                markerEnd={on ? 'url(#ah)' : 'url(#ahd)'}
                stroke={stroke}
                strokeDasharray={on ? '7 5' : ctrl ? '3 3' : undefined}
                strokeOpacity={ctrl && !on ? 0.7 : 1}
                strokeWidth={on ? 2.4 : 1}
                {...(on || ctrl ? {} : { className: 'text-muted-foreground/35' })}>
                {on && !reduced ? (
                  <animate attributeName='stroke-dashoffset' dur='0.6s' from='12' repeatCount='indefinite' to='0' />
                ) : undefined}
              </path>
              {ctrl && sig !== undefined && mid !== undefined ? (
                <text fill={CONTROL_WIRE} fontSize='8' x={mid.x + 3} y={mid.y - 3}>
                  {sig}
                </text>
              ) : on && mid !== undefined ? (
                <text className='fill-muted-foreground' fontSize='9' x={mid.x + 3} y={mid.y - 4}>
                  /{widthOf(p.id)}
                </text>
              ) : undefined}
            </g>
          )
        })}
        {Object.entries(JUNCTIONS).map(([id, j]) => (
          <circle
            cx={j.x}
            cy={j.y}
            fill={activePts.has(`${j.x},${j.y}`) ? ACTIVE : 'currentColor'}
            key={id}
            r={3}
            {...(activePts.has(`${j.x},${j.y}`) ? {} : { className: 'text-muted-foreground/50' })}
          />
        ))}
        {NODES.map(n => {
          const isCritical = showCritical && criticalSet.has(n.id)
          const isActive = activeC.has(n.id)
          const isSelected = selected === n.id
          const fill = isSelected ? SELECTED : isCritical ? CRITICAL : (NODE_COLOR[n.id] ?? '#9aa3ad')
          const lit = isSelected || isCritical || isActive
          const lines = n.label.split('\n')
          return (
            <g
              aria-label={n.id}
              className='cursor-pointer'
              key={n.id}
              onClick={() => onSelect(n.id)}
              onKeyDown={e => {
                if (e.key === 'Enter') onSelect(n.id)
              }}
              role='button'
              tabIndex={0}>
              {shape(n, fill, lit)}
              {(PORTS[n.id] ?? []).map(pt => (
                <text
                  dominantBaseline='middle'
                  fill={contrastOf(fill)}
                  fillOpacity={0.75}
                  fontSize='7'
                  key={pt.name}
                  textAnchor={pt.side === 'l' ? 'start' : 'end'}
                  x={pt.side === 'l' ? n.x - n.w / 2 + 4 : n.x + n.w / 2 - 4}
                  y={n.y - n.h / 2 + pt.frac * n.h}>
                  {pt.name}
                </text>
              ))}
              <text
                dominantBaseline='middle'
                fill={lit ? contrastOf(fill) : 'currentColor'}
                fontSize={n.w < 34 ? 8 : 10}
                textAnchor='middle'
                x={n.x}
                y={n.y - (lines.length - 1) * 5}
                {...(lit ? {} : { className: 'fill-muted-foreground' })}>
                {lines.map((ln, i) => (
                  <tspan key={ln} x={n.x} {...(i === 0 ? {} : { dy: 10 })}>
                    {ln}
                  </tspan>
                ))}
              </text>
              {isActive && values[n.id] !== undefined ? (
                <text fill={ACCENT} fontSize='9' textAnchor='middle' x={n.x} y={n.y + n.h / 2 + 11}>
                  {values[n.id]}
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
