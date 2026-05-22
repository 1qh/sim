/** biome-ignore-all lint/suspicious/noArrayIndexKey: pipeline grid identity IS program-order index (row) + cycle number (col) */
/* eslint-disable react/no-array-index-key, @eslint-react/no-array-index-key */
import { cn } from '@a/ui'
import type { PipelineReport, Stage } from './types'

const STAGE_TONE: Record<Stage, string> = {
  EX: 'bg-primary/30',
  ID: 'bg-primary/20',
  IF: 'bg-primary/10',
  MEM: 'bg-primary/40',
  WB: 'bg-primary/60'
}
const StageMatrix = ({ report }: { report: PipelineReport }): React.JSX.Element => {
  const cycles = report.cycleCount
  return (
    <section aria-label='pipeline stage-time diagram' className='flex flex-col gap-4'>
      <div className='overflow-x-auto rounded-lg border'>
        <table aria-label='stage-time matrix' className='w-full border-collapse font-mono text-xs'>
          <thead>
            <tr className='[&>th]:border [&>th]:px-2 [&>th]:py-1'>
              <th className='text-left'>instruction</th>
              {Array.from({ length: cycles }, (_, c) => (
                <th key={`c${c}`}>c{c + 1}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {report.rows.map((row, i) => (
              <tr className='[&>td]:border [&>td]:px-2 [&>td]:py-1' key={`i${i}`}>
                <td className='whitespace-nowrap text-left'>
                  {i}: {row.instruction.name}
                </td>
                {Array.from({ length: cycles }, (_, c) => {
                  const cell = row.cellByCycle[c]
                  const label =
                    cell === undefined
                      ? `instruction ${i}, cycle ${c + 1}, idle`
                      : `instruction ${i}, cycle ${c + 1}, stage ${cell}`
                  return (
                    <td
                      aria-label={label}
                      className={cn(
                        'text-center',
                        cell === 'bubble' && 'bg-muted text-muted-foreground',
                        cell !== undefined && cell !== 'bubble' && STAGE_TONE[cell]
                      )}
                      key={`i${i}c${c}`}>
                      {cell === 'bubble' ? '~~' : (cell ?? '')}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <dl className='grid grid-cols-2 gap-x-6 gap-y-1 rounded-lg border p-4 font-mono text-sm sm:grid-cols-3'>
        <dt>cycles</dt>
        <dd>{report.cycleCount}</dd>
        <dt>instructions</dt>
        <dd>{report.instructionCount}</dd>
        <dt>CPI</dt>
        <dd>{report.cpi.toFixed(2)}</dd>
        <dt>IPC</dt>
        <dd>{(1 / report.cpi).toFixed(2)}</dd>
        <dt>stalls</dt>
        <dd>{report.stalls}</dd>
        <dt>forwarded</dt>
        <dd>{report.forwarding.length}</dd>
      </dl>
      <ul
        aria-label='detected hazards'
        className='flex flex-col gap-1 text-sm [&>li]:rounded [&>li]:border [&>li]:px-3 [&>li]:py-1'>
        {report.hazards.length === 0 ? (
          <li className='text-muted-foreground'>no hazards</li>
        ) : (
          report.hazards.map(h => (
            <li key={`h${h.consumerIndex}-${h.consumerCycle}-${h.kind}`}>
              {h.kind} hazard — instr {h.producerIndex ?? '?'} → instr {h.consumerIndex} (cycle {h.consumerCycle})
            </li>
          ))
        )}
      </ul>
    </section>
  )
}
export default StageMatrix
