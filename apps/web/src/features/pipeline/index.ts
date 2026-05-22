export {
  analyzePipeline,
  detectWar,
  detectWaw,
  isBranchOrJump,
  isLoad,
  readsRegisters,
  STAGES,
  writesRegister
} from './analyze'
export type { ForwardingArrow, Hazard, HazardKind, PipelineReport, PipelineRow, Stage, StageOccupancy } from './types'
