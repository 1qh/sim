/** biome-ignore-all lint/suspicious/noBitwiseOperators: noise */
/* eslint-disable no-bitwise */
import type { Implicant, SolveResult } from '@sim/boolean'
import { solve } from '@sim/boolean'
type Geometry = '2d' | '3d-toroidal'
interface KmapGrid {
  cells: ((0 | 1) | undefined)[]
  geometry: Geometry
  rows: number
  vars: string[]
  width: number
}
interface KmapResult extends SolveResult {
  geometry: Geometry
  grid: KmapGrid
  userGroupings: UserGrouping[]
  validationErrors: string[]
}
interface UserGrouping {
  cells: number[]
  label?: string
}
const GRAY_CODE = (n: number): number[] => {
  const out: number[] = []
  for (let i = 0; i < 1 << n; i += 1) out.push(i ^ (i >>> 1))
  return out
}
const orderForGeometry = (vars: number, geometry: Geometry): number[] => {
  if (vars <= 4 && geometry === '2d') return Array.from({ length: 1 << vars }, (_, i) => i)
  if (vars >= 5) return Array.from({ length: 1 << vars }, (_, i) => i)
  return Array.from({ length: 1 << vars }, (_, i) => i)
}
const buildGrid = (vars: string[], truthTable: (0 | 1)[], geometry: Geometry): KmapGrid => {
  const width = vars.length
  const cells = orderForGeometry(width, geometry).map(i => truthTable[i] ?? 0)
  return { cells, geometry, rows: 2 ** Math.ceil(width / 2), vars, width }
}
const validateGrouping = (group: UserGrouping, totalCells: number): string[] => {
  const errors: string[] = []
  if (group.cells.length === 0) errors.push('grouping is empty')
  const power = Math.log2(group.cells.length)
  if (!Number.isInteger(power)) errors.push(`grouping size ${group.cells.length} not a power of 2`)
  for (const c of group.cells) if (c < 0 || c >= totalCells) errors.push(`cell ${c} out of range`)
  return errors
}
const kmap = (input: {
  dontCares?: number[]
  expression?: string
  geometry?: Geometry
  maxterms?: number[]
  minterms?: number[]
  userGroupings?: UserGrouping[]
  vars?: string[]
  width?: number
}): KmapResult => {
  const explicitWidth = input.width ?? input.vars?.length
  if (explicitWidth !== undefined && explicitWidth > 6)
    throw new Error('kmap: width > 6 not supported (use Espresso heuristic instead)')
  const solveResult = solve({
    dontCares: input.dontCares,
    expression: input.expression,
    maxterms: input.maxterms,
    minterms: input.minterms,
    vars: input.vars,
    width: explicitWidth
  })
  const { width } = solveResult
  if (width > 6) throw new Error('kmap: width > 6 not supported (use Espresso heuristic instead)')
  const geometry: Geometry = input.geometry ?? (width <= 4 ? '2d' : '3d-toroidal')
  const grid = buildGrid(solveResult.vars, solveResult.truthTable, geometry)
  const userGroupings = input.userGroupings ?? []
  const validationErrors: string[] = []
  const totalCells = 2 ** width
  for (const g of userGroupings) validationErrors.push(...validateGrouping(g, totalCells))
  return { ...solveResult, geometry, grid, userGroupings, validationErrors }
}
const isUserCoverComplete = (impl: Implicant[], minterms: number[]): boolean => {
  const covered = new Set<number>()
  for (const i of impl) for (const c of i.covers) covered.add(c)
  return minterms.every(m => covered.has(m))
}
export { buildGrid, GRAY_CODE, isUserCoverComplete, kmap, validateGrouping }
export type { Geometry, KmapGrid, KmapResult, UserGrouping }
