/* oxlint-disable unicorn/number-literal-case */
import type { ControlSignals, Instruction, RegisterNumber } from '@/features/mips/types'
import { kmap } from '@/features/kmap'
import { controlFor } from '@/features/mips'
import { analyzePipeline } from '@/features/pipeline'
import KmapInteractive from './kmap-interactive'

const FUNCT: Record<string, number> = { add: 0x20, and: 0x24, nor: 0x27, or: 0x25, slt: 0x2a, sub: 0x22 }
const buildInstruction = (name: string): Instruction => {
  if (name in FUNCT)
    return {
      funct: FUNCT[name] ?? 0x20,
      name: name as Instruction['name'],
      rd: 3 as RegisterNumber,
      rs: 1 as RegisterNumber,
      rt: 2 as RegisterNumber,
      shamt: 0,
      type: 'R'
    }
  if (name === 'beq' || name === 'bne')
    return {
      imm: 2,
      name,
      opcode: name === 'beq' ? 0x04 : 0x05,
      rs: 1 as RegisterNumber,
      rt: 2 as RegisterNumber,
      type: 'I'
    }
  return {
    imm: 4,
    name: name as Instruction['name'],
    opcode: name === 'lw' ? 0x23 : name === 'sw' ? 0x2b : 0x08,
    rs: 1 as RegisterNumber,
    rt: 2 as RegisterNumber,
    type: 'I'
  }
}
const DatapathView = ({ instruction }: { instruction: string }): React.JSX.Element => {
  const c = controlFor(buildInstruction(instruction))
  return (
    <dl
      aria-label={`control signals for ${instruction}`}
      className='my-4 grid grid-cols-3 gap-x-4 gap-y-1 rounded-lg border p-4 font-mono text-sm sm:grid-cols-5'>
      {(Object.keys(c) as (keyof ControlSignals)[]).map(k => (
        <div key={k}>
          <dt className='text-muted-foreground'>{k}</dt>
          <dd>{c[k]}</dd>
        </div>
      ))}
    </dl>
  )
}
const Signal = ({ instruction, name }: { instruction: string; name: keyof ControlSignals }): React.JSX.Element => {
  const c = controlFor(buildInstruction(instruction))
  return (
    <span className='inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-xs'>
      {name}={c[name]}
    </span>
  )
}
const KmapView = ({ minterms, vars }: { minterms: number[]; vars: number }): React.JSX.Element => {
  const r = kmap({ minterms, width: vars })
  return (
    <section aria-label={`k-map ${vars} variables`} className='my-4 space-y-1 rounded-lg border p-4 font-mono text-sm'>
      <div>geometry: {r.geometry}</div>
      <div>minimal SOP: {r.minimalSop}</div>
      <div>minimal POS: {r.minimalPos}</div>
      <div>prime implicants: {r.primeImplicants.length}</div>
      <div>essential PIs: {r.essentialPrimeImplicants.length}</div>
    </section>
  )
}
const TruthTable = ({ headers, rows }: { headers: string[]; rows: (0 | 1)[][] }): React.JSX.Element => (
  <table
    aria-label='truth table'
    className='my-4 border-collapse font-mono text-sm [&_td]:border [&_td]:px-2 [&_th]:border [&_th]:px-2'>
    <thead>
      <tr>
        {headers.map(h => (
          <th key={h}>{h}</th>
        ))}
      </tr>
    </thead>
    <tbody>
      {rows.map(row => (
        <tr key={row.join('')}>
          {row.map((v, i) => (
            <td key={`${row.join('')}-${headers[i] ?? i}`}>{v}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
)
const DatapathStep = ({ instruction, step }: { instruction: string; step?: string }): React.JSX.Element => {
  const c = controlFor(buildInstruction(instruction))
  const active = (Object.keys(c) as (keyof ControlSignals)[]).filter(k => c[k] !== 0)
  return (
    <section
      aria-label={`datapath step ${step ?? 'EX'} for ${instruction}`}
      className='my-4 rounded-lg border p-4 font-mono text-sm'>
      <div className='text-muted-foreground'>
        {instruction} · step {step ?? 'EX'}
      </div>
      <div>active signals: {active.length === 0 ? 'none' : active.join(', ')}</div>
    </section>
  )
}
const PipelineDiagram = ({ program }: { program: string }): React.JSX.Element => {
  const report = analyzePipeline([buildInstruction('add'), buildInstruction('lw'), buildInstruction('sub')], {})
  return (
    <section aria-label={`pipeline ${program}`} className='my-4 rounded-lg border p-4 font-mono text-sm'>
      <div>cycles: {report.cycleCount}</div>
      <div>CPI: {report.cpi.toFixed(2)}</div>
      <div>hazards: {report.hazards.map(h => h.kind).join(', ') || 'none'}</div>
    </section>
  )
}
const RegisterValue = ({ name }: { name: string }): React.JSX.Element => (
  <span className='inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-xs'>{name}=0x0</span>
)
export { DatapathStep, DatapathView, KmapInteractive, KmapView, PipelineDiagram, RegisterValue, Signal, TruthTable }
