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
/* eslint-disable @typescript-eslint/switch-exhaustiveness-check, @typescript-eslint/naming-convention, no-bitwise */
type Expr =
  | { kind: 'and'; left: Expr; right: Expr }
  | { kind: 'const'; value: 0 | 1 }
  | { kind: 'not'; operand: Expr }
  | { kind: 'or'; left: Expr; right: Expr }
  | { kind: 'var'; name: string }
  | { kind: 'xor'; left: Expr; right: Expr }
const v = (name: string): Expr => ({ kind: 'var', name })
const c = (value: 0 | 1): Expr => ({ kind: 'const', value })
const not = (operand: Expr): Expr => ({ kind: 'not', operand })
const and = (left: Expr, right: Expr): Expr => ({ kind: 'and', left, right })
const or = (left: Expr, right: Expr): Expr => ({ kind: 'or', left, right })
const xor = (left: Expr, right: Expr): Expr => ({ kind: 'xor', left, right })
const collectVars = (e: Expr, into = new Set<string>()): Set<string> => {
  switch (e.kind) {
    case 'const':
      return into
    case 'not':
      return collectVars(e.operand, into)
    case 'var':
      into.add(e.name)
      return into
    default:
      collectVars(e.left, into)
      return collectVars(e.right, into)
  }
}
const evalExpr = (e: Expr, env: Record<string, 0 | 1>): 0 | 1 => {
  switch (e.kind) {
    case 'and':
      return evalExpr(e.left, env) === 1 && evalExpr(e.right, env) === 1 ? 1 : 0
    case 'const':
      return e.value
    case 'not':
      return evalExpr(e.operand, env) === 1 ? 0 : 1
    case 'or':
      return evalExpr(e.left, env) === 1 || evalExpr(e.right, env) === 1 ? 1 : 0
    case 'var':
      return env[e.name] ?? 0
    case 'xor':
      return evalExpr(e.left, env) === evalExpr(e.right, env) ? 0 : 1
    default:
      return 0
  }
}
const sortedVars = (e: Expr): string[] => [...collectVars(e)].toSorted((x, y) => (x < y ? -1 : x > y ? 1 : 0))
const truthTable = (e: Expr, vars: string[] = sortedVars(e)): (0 | 1)[] => {
  const rows = 2 ** vars.length
  const out: (0 | 1)[] = []
  for (let i = 0; i < rows; i += 1) {
    const env: Record<string, 0 | 1> = {}
    for (let v_ = 0; v_ < vars.length; v_ += 1) env[vars[v_]] = ((i >> (vars.length - 1 - v_)) & 1) as 0 | 1
    out.push(evalExpr(e, env))
  }
  return out
}
const minterms = (e: Expr, vars: string[] = sortedVars(e)): number[] => {
  const tt = truthTable(e, vars)
  const out: number[] = []
  for (let i = 0; i < tt.length; i += 1) if (tt[i] === 1) out.push(i)
  return out
}
const maxterms = (e: Expr, vars: string[] = sortedVars(e)): number[] => {
  const tt = truthTable(e, vars)
  const out: number[] = []
  for (let i = 0; i < tt.length; i += 1) if (tt[i] === 0) out.push(i)
  return out
}
export { and, c, collectVars, evalExpr, maxterms, minterms, not, or, sortedVars, truthTable, v, xor }
export type { Expr }
