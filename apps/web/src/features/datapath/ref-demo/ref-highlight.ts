/* eslint-disable @typescript-eslint/max-params, @typescript-eslint/no-unnecessary-condition */
import type { ControlSignalId, DatapathValueId, RuntimeControlSignals } from '@/features/datapath/ref-demo/ref-types'

interface DatapathHighlightState {
  controls: Partial<Record<ControlSignalId, HighlightRole>>
  values: Partial<Record<DatapathValueId, HighlightRole>>
}
type DatapathStep = 'EX' | 'ID' | 'IF' | 'MEM' | 'WB'
interface ExecutionContext {
  branchTaken?: boolean
}
type HighlightRole = 'control' | 'input' | 'modified' | 'normal' | 'output'
interface StepValueHighlights {
  controls: ControlSignalId[]
  inputs: DatapathValueId[]
  outputs: DatapathValueId[]
}
const getHighlightSvgFill = (role: HighlightRole): string => {
  if (role === 'input') return '#2563eb'
  if (role === 'output') return '#16a34a'
  if (role === 'control') return '#dc2626'
  if (role === 'modified') return '#ea580c'
  return 'black'
}
const ifHighlights = (): StepValueHighlights => ({
  controls: [],
  inputs: ['PC'],
  outputs: ['IM_ADDRESS', 'IM_INSTRUCTION', 'ADD4']
})
const idHighlights = (signals: RuntimeControlSignals): StepValueHighlights => ({
  controls: ['RegDst'],
  inputs: [
    'IR_OPCODE',
    'IR_RS',
    'IR_RT',
    ...(signals.RegDst === 1 ? (['IR_RD'] as DatapathValueId[]) : []),
    'IR_IMMEDIATE'
  ],
  outputs: [
    'RF_RR1',
    'RF_RR2',
    ...(signals.RegDst === 'X' ? [] : (['RF_WR'] as DatapathValueId[])),
    'RF_RD1',
    'RF_RD2',
    'SIGN_EXTEND'
  ]
})
const exHighlights = (signals: RuntimeControlSignals): StepValueHighlights => ({
  controls: ['ALUSrc', 'ALUOp'],
  inputs: [
    'RF_RD1',
    ...(signals.ALUSrc === 1 || signals.Branch === 1 || signals.BranchNE === 1
      ? (['SIGN_EXTEND'] as DatapathValueId[])
      : []),
    ...(signals.ALUSrc === 0 ? (['RF_RD2'] as DatapathValueId[]) : []),
    ...(signals.Branch === 1 || signals.BranchNE === 1 ? (['ADD4'] as DatapathValueId[]) : [])
  ],
  outputs: [
    'ALU_OP1',
    'ALU_OP2',
    'ALU_RESULT',
    'ALU_ZERO',
    ...(signals.Branch === 1 || signals.BranchNE === 1 ? (['LEFT_SHIFT_2', 'BRANCH_ADDER'] as DatapathValueId[]) : [])
  ]
})
const memBranchInputs = (context: ExecutionContext): DatapathValueId[] => {
  if (context.branchTaken === undefined) return []
  return context.branchTaken ? ['BRANCH_ADDER'] : ['ADD4']
}
const memHighlights = (signals: RuntimeControlSignals, context: ExecutionContext): StepValueHighlights => ({
  controls: ['MemRead', 'MemWrite', 'Branch', 'BranchNE', 'PCSrc'],
  inputs: [
    'ALU_RESULT',
    'RF_RD2',
    ...memBranchInputs(context),
    ...(signals.Branch === 1 || signals.BranchNE === 1 ? (['ALU_ZERO'] as DatapathValueId[]) : [])
  ],
  outputs: ['DM_ADDRESS', ...(signals.MemRead === 1 ? (['DM_READ_DATA'] as DatapathValueId[]) : []), 'DM_WRITE_DATA', 'PC']
})
const wbInputs = (signals: RuntimeControlSignals): DatapathValueId[] => {
  if (signals.MemToReg === 'X') return []
  return signals.MemToReg === 1 ? ['DM_READ_DATA'] : ['ALU_RESULT']
}
const wbHighlights = (signals: RuntimeControlSignals): StepValueHighlights => ({
  controls: ['MemToReg', 'RegWrite'],
  inputs: wbInputs(signals),
  outputs: signals.MemToReg === 'X' ? [] : (['RF_WD'] as DatapathValueId[])
})
const stepValueHighlights = (
  step: DatapathStep,
  signals: RuntimeControlSignals,
  context: ExecutionContext
): StepValueHighlights => {
  if (step === 'IF') return ifHighlights()
  if (step === 'ID') return idHighlights(signals)
  if (step === 'EX') return exHighlights(signals)
  if (step === 'MEM') return memHighlights(signals, context)
  if (step === 'WB') return wbHighlights(signals)
  return { controls: [], inputs: [], outputs: [] }
}
const getDatapathHighlightState = (
  step: DatapathStep,
  signals: RuntimeControlSignals,
  defaultSignals: RuntimeControlSignals,
  context: ExecutionContext
): DatapathHighlightState => {
  const state: DatapathHighlightState = { controls: {}, values: {} }
  const h = stepValueHighlights(step, signals, context)
  for (const id of h.inputs) state.values[id] = 'input'
  for (const id of h.outputs) state.values[id] = 'output'
  for (const s of h.controls) state.controls[s] = signals[s] === defaultSignals[s] ? 'control' : 'modified'
  return state
}
export { getDatapathHighlightState, getHighlightSvgFill }
export type { DatapathHighlightState, DatapathStep, ExecutionContext }
