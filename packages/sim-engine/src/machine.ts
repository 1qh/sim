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
/* eslint-disable @typescript-eslint/no-unnecessary-condition, no-continue */
import type { Patch } from './codec'
import { applyDiff, diff, encode, hashValue } from './codec'
interface MachineConfig<S, E> {
  initial: S
  reducer: (state: S, event: E) => S
  seed?: number
}
interface Trace<S, E> {
  events: E[]
  hashes: string[]
  patches: Patch[]
  states: S[]
}
const run = <S, E>(config: MachineConfig<S, E>, events: E[]): Trace<S, E> => {
  const states: S[] = [config.initial]
  const patches: Patch[] = []
  const hashes: string[] = [hashValue(config.initial)]
  for (const event of events) {
    const previous = states.at(-1) as S
    const nextState = config.reducer(previous, event)
    patches.push(diff(previous, nextState))
    states.push(nextState)
    hashes.push(hashValue(nextState))
  }
  return { events: [...events], hashes, patches, states }
}
const replay = <S, E>(config: MachineConfig<S, E>, events: E[]): Trace<S, E> => run(config, events)
const scrub = <S, E>(trace: Trace<S, E>, step: number): S => {
  if (step < 0 || step >= trace.states.length)
    throw new Error(`scrub: step ${step} out of range [0, ${trace.states.length})`)
  return trace.states[step]
}
const verifyTrace = <S, E>(trace: Trace<S, E>): boolean => {
  for (let i = 0; i < trace.states.length; i += 1) if (hashValue(trace.states[i]) !== trace.hashes[i]) return false
  for (let i = 0; i < trace.patches.length; i += 1) {
    const patch = trace.patches[i]
    if (patch === undefined) continue
    const rebuilt = applyDiff(trace.states[i], patch)
    if (hashValue(rebuilt) !== trace.hashes[i + 1]) return false
  }
  return true
}
const snapshotTrace = <S, E>(trace: Trace<S, E>) =>
  encode({ events: trace.events, hashes: trace.hashes, initial: trace.states[0] })
export { replay, run, scrub, snapshotTrace, verifyTrace }
export type { MachineConfig, Trace }
