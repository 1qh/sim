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
/* oxlint-disable unicorn/no-array-reduce, unicorn/no-immediate-mutation, unicorn/number-literal-case, unicorn/no-process-exit, import/no-duplicates, promise/param-names, @eslint-react/naming-convention/component-name, complexity */
/* eslint-disable complexity */
import { PATHS } from '@/features/datapath/generated/topology'

interface Node {
  h: number
  id: string
  kind: 'alu' | 'const' | 'gate' | 'mem' | 'mux'
  label: string
  w: number
  x: number
  y: number
}
const VW = 1100
const VH = 640
const NODES: Node[] = [
  { h: 90, id: 'PCSrcMux', kind: 'mux', label: 'PCSrc', w: 26, x: 48, y: 300 },
  { h: 64, id: 'PC', kind: 'mem', label: 'PC', w: 40, x: 120, y: 300 },
  { h: 88, id: 'IM', kind: 'mem', label: 'Instr\nMem', w: 86, x: 250, y: 300 },
  { h: 120, id: 'IR', kind: 'mem', label: 'IR', w: 40, x: 372, y: 300 },
  { h: 50, id: 'Add4', kind: 'mem', label: 'Add', w: 58, x: 250, y: 96 },
  { h: 26, id: 'CONST4', kind: 'const', label: '4', w: 24, x: 168, y: 150 },
  { h: 66, id: 'Control', kind: 'mem', label: 'Control', w: 92, x: 452, y: 90 },
  { h: 124, id: 'RF', kind: 'mem', label: 'Registers', w: 96, x: 512, y: 300 },
  { h: 76, id: 'RegDstMux', kind: 'mux', label: 'RegDst', w: 26, x: 452, y: 440 },
  { h: 64, id: 'SE', kind: 'mem', label: 'Sign\nExtend', w: 62, x: 512, y: 488 },
  { h: 36, id: 'LS2', kind: 'mem', label: '<<2', w: 50, x: 446, y: 186 },
  { h: 58, id: 'BranchAdder', kind: 'mem', label: 'Add', w: 58, x: 656, y: 132 },
  { h: 88, id: 'ALUSrcMux', kind: 'mux', label: 'ALUSrc', w: 26, x: 624, y: 320 },
  { h: 100, id: 'ALU', kind: 'alu', label: 'ALU', w: 74, x: 716, y: 300 },
  { h: 48, id: 'ALUControl', kind: 'mem', label: 'ALU\nCtrl', w: 76, x: 686, y: 470 },
  { h: 28, id: 'Zero', kind: 'gate', label: 'Zero', w: 38, x: 812, y: 150 },
  { h: 30, id: 'NotGate', kind: 'gate', label: 'NOT', w: 34, x: 812, y: 96 },
  { h: 34, id: 'BeqAnd', kind: 'gate', label: 'AND', w: 38, x: 888, y: 174 },
  { h: 34, id: 'BneAnd', kind: 'gate', label: 'AND', w: 38, x: 888, y: 96 },
  { h: 34, id: 'OrGate', kind: 'gate', label: 'OR', w: 36, x: 958, y: 134 },
  { h: 86, id: 'DM', kind: 'mem', label: 'Data\nMem', w: 84, x: 852, y: 336 },
  { h: 88, id: 'MemToRegMux', kind: 'mux', label: 'MemToReg', w: 26, x: 956, y: 336 },
  { h: 60, id: 'WB', kind: 'mem', label: 'WB', w: 30, x: 1036, y: 336 }
]
const JUNCTIONS: Record<string, { x: number; y: number }> = {
  ADD4_JUNCTION: { x: 320, y: 96 },
  ALU_JUMP: { x: 792, y: 372 },
  ALU_JUNCTION: { x: 792, y: 300 },
  MEMTOREG_MUX_JUMP: { x: 996, y: 300 },
  PC_JUNCTION: { x: 184, y: 300 },
  RD2_JUMP: { x: 580, y: 372 },
  RD2_JUNCTION: { x: 580, y: 340 },
  RT_JUNCTION: { x: 424, y: 344 },
  SE_JUMP1: { x: 576, y: 556 },
  SE_JUMP2: { x: 420, y: 556 },
  SE_JUNCTION: { x: 576, y: 488 }
}
const PATH_SEGMENTS: Record<string, string[]> = {
  ADD4_TO_BRANCH_ADDER0: ['ADD4_TO_ADD4_JUNCTION', 'ADD4_JUNCTION', 'ADD4_JUNCTION_TO_BRANCH_ADDER0'],
  ADD4_TO_PCSRC_MUX0: ['ADD4_TO_ADD4_JUNCTION', 'ADD4_JUNCTION', 'ADD4_JUNCTION_TO_PCSRC_MUX0'],
  ALU_TO_DM_ADDR: ['ALU_TO_ALU_JUNCTION', 'ALU_JUNCTION', 'ALU_JUNCTION_TO_DM_ADDR'],
  ALU_TO_MEMTOREG_MUX0: [
    'ALU_TO_ALU_JUNCTION',
    'ALU_JUNCTION',
    'ALU_JUNCTION_ALU_JUMP',
    'ALU_JUMP',
    'ALU_JUMP_TO_MEMTOREG_MUX0'
  ],
  CONST4_TO_ADD4: ['CONST4_TO_ADD4'],
  DM_RD_TO_MEMTOREG_MUX1: ['DM_RD_TO_MEMTOREG_MUX1'],
  IM_TO_IR: ['IM_TO_IR'],
  IR_IMM_TO_SIGN_EXTEND: ['IR_IMM_TO_SIGN_EXTEND'],
  IR_RD_TO_REGDST_MUX1: ['IR_RD_TO_REGDST_MUX1'],
  IR_RS_TO_RF_RR1: ['IR_RS_TO_RF_RR1'],
  IR_RT_TO_REGDST_MUX0: ['IR_RT_TO_RT_JUNCTION', 'RT_JUNCTION', 'RT_JUNCTION_TO_REGDST_MUX0'],
  IR_RT_TO_RF_RR2: ['IR_RT_TO_RT_JUNCTION', 'RT_JUNCTION', 'RT_JUNCTION_TO_RF_RR2'],
  LEFT_SHIFT_2_TO_BRANCH_ADDER1: ['LEFT_SHIFT_2_TO_BRANCH_ADDER1'],
  MEMTOREG_MUX_TO_RF_WD: ['MEMTOREG_MUX_TO_MEMTOREG_MUX_JUMP', 'MEMTOREG_MUX_JUMP', 'MEMTOREG_MUX_JUMP_TO_RF_WD'],
  PCSRC_MUX_TO_PC: ['PCSRC_MUX_TO_PC'],
  PC_TO_ADD4: ['PC_TO_PC_JUNCTION', 'PC_JUNCTION', 'PC_JUNCTION_TO_ADD4'],
  PC_TO_IM: ['PC_TO_PC_JUNCTION', 'PC_JUNCTION', 'PC_JUNCTION_TO_IM'],
  REGDST_MUX_TO_RF_WR: ['REGDST_MUX_TO_RF_WR'],
  RF_RD1_TO_ALU1: ['RF_RD1_TO_ALU1'],
  RF_RD2_TO_ALUSRC_MUX0: ['RF_RD2_TO_RD2_JUNCTION', 'RD2_JUNCTION', 'RD2_JUNCTION_TO_ALUSRC_MUX0'],
  RF_RD2_TO_DM_WD: ['RF_RD2_TO_RD2_JUNCTION', 'RD2_JUNCTION', 'RD2_JUNCTION_TO_RD2_JUMP', 'RD2_JUMP', 'RD2_JUMP_TO_DM_WD'],
  SIGN_EXTEND_TO_ALUSRC_MUX1: ['SIGN_EXTEND_TO_SE_JUNCTION', 'SE_JUNCTION', 'SE_JUNCTION_TO_ALUSRC_MUX1'],
  SIGN_EXTEND_TO_LEFT_SHIFT_2: [
    'SIGN_EXTEND_TO_SE_JUNCTION',
    'SE_JUNCTION',
    'SE_JUNCTION_TO_SE_JUMP1',
    'SE_JUMP1',
    'SE_JUMP1_TO_SE_JUMP2',
    'SE_JUMP2',
    'SE_JUMP2_TO_LEFT_SHIFT_2'
  ]
}
const NODE_POS = new Map(NODES.map(n => [n.id, { x: n.x, y: n.y }]))
const PATH_FT = new Map(PATHS.map(p => [p.id, { from: p.from, to: p.to }]))
const RE_CONTROL = /^CONTROL_|_TO_CONTROL$|^ALUOP_|_TO_ALU_CONTROL$|^IR_OPCODE_/u
const isControlPath = (id: string): boolean => RE_CONTROL.test(id)
const resolveNode = (token: string): string => {
  if (token in JUNCTIONS) return token
  if (token.startsWith('PCSRC_MUX')) return 'PCSrcMux'
  if (token.startsWith('REGDST_MUX')) return 'RegDstMux'
  if (token.startsWith('ALUSRC_MUX')) return 'ALUSrcMux'
  if (token.startsWith('MEMTOREG_MUX')) return 'MemToRegMux'
  if (token.startsWith('ALU_CONTROL')) return 'ALUControl'
  if (token.startsWith('ALU_ZERO')) return 'Zero'
  if (token.startsWith('NOT_GATE')) return 'NotGate'
  if (token.startsWith('BEQ_AND_GATE')) return 'BeqAnd'
  if (token.startsWith('BNE_AND_GATE')) return 'BneAnd'
  if (token.startsWith('OR_GATE')) return 'OrGate'
  if (token.startsWith('ALU')) return 'ALU'
  if (token.startsWith('SIGN_EXTEND')) return 'SE'
  if (token.startsWith('LEFT_SHIFT_2')) return 'LS2'
  if (token.startsWith('BRANCH_ADDER')) return 'BranchAdder'
  if (token.startsWith('ADD4')) return 'Add4'
  if (token.startsWith('CONST4')) return 'CONST4'
  if (token.startsWith('IM')) return 'IM'
  if (token.startsWith('IR')) return 'IR'
  if (token.startsWith('RF')) return 'RF'
  if (token.startsWith('DM')) return 'DM'
  if (token.startsWith('CONTROL')) return 'Control'
  if (token.startsWith('PC')) return 'PC'
  return token
}
const posOf = (id: string): { x: number; y: number } => NODE_POS.get(id) ?? JUNCTIONS[id] ?? { x: 0, y: 0 }
const pathPoints = (id: string): { x: number; y: number }[] => {
  const segs = PATH_SEGMENTS[id]
  if (segs === undefined) {
    const ft = PATH_FT.get(id)
    if (ft === undefined) return []
    return [posOf(ft.from), posOf(ft.to)]
  }
  const ids: string[] = []
  for (const seg of segs) {
    const parts = seg.split('_TO_')
    for (const part of parts) {
      const n = resolveNode(part)
      if (ids.at(-1) !== n) ids.push(n)
    }
  }
  return ids.map(posOf)
}
export { isControlPath, JUNCTIONS, NODES, pathPoints, VH, VW }
export type { Node }
