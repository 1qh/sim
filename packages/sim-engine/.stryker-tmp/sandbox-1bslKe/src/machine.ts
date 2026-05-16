/** biome-ignore-all lint/nursery/noUndeclaredEnvVars: noise */
// @ts-nocheck
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
/* eslint-disable @typescript-eslint/no-unnecessary-condition
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import type { Patch } from './codec';
import { applyDiff, diff, encode, hashValue } from './codec';
interface MachineConfig<S, E> {
  initial: S;
  reducer: (state: S, event: E) => S;
  seed?: number;
}
interface Trace<S, E> {
  events: E[];
  hashes: string[];
  patches: Patch[];
  states: S[];
}
const run = <S, E>(config: MachineConfig<S, E>, events: E[]): Trace<S, E> => {
  if (stryMutAct_9fa48("23")) {
    {}
  } else {
    stryCov_9fa48("23");
    const states: S[] = stryMutAct_9fa48("24") ? [] : (stryCov_9fa48("24"), [config.initial]);
    const patches: Patch[] = stryMutAct_9fa48("25") ? ["Stryker was here"] : (stryCov_9fa48("25"), []);
    const hashes: string[] = stryMutAct_9fa48("26") ? [] : (stryCov_9fa48("26"), [hashValue(config.initial)]);
    for (const event of events) {
      if (stryMutAct_9fa48("27")) {
        {}
      } else {
        stryCov_9fa48("27");
        const previous = states.at(-1) as S;
        const nextState = config.reducer(previous, event);
        patches.push(diff(previous, nextState));
        states.push(nextState);
        hashes.push(hashValue(nextState));
      }
    }
    return stryMutAct_9fa48("28") ? {} : (stryCov_9fa48("28"), {
      events: stryMutAct_9fa48("29") ? [] : (stryCov_9fa48("29"), [...events]),
      hashes,
      patches,
      states
    });
  }
};
const replay = stryMutAct_9fa48("30") ? () => undefined : (stryCov_9fa48("30"), (() => {
  const replay = <S, E>(config: MachineConfig<S, E>, events: E[]): Trace<S, E> => run(config, events);
  return replay;
})());
const scrub = <S, E>(trace: Trace<S, E>, step: number): S => {
  if (stryMutAct_9fa48("31")) {
    {}
  } else {
    stryCov_9fa48("31");
    if (stryMutAct_9fa48("34") ? step < 0 && step >= trace.states.length : stryMutAct_9fa48("33") ? false : stryMutAct_9fa48("32") ? true : (stryCov_9fa48("32", "33", "34"), (stryMutAct_9fa48("37") ? step >= 0 : stryMutAct_9fa48("36") ? step <= 0 : stryMutAct_9fa48("35") ? false : (stryCov_9fa48("35", "36", "37"), step < 0)) || (stryMutAct_9fa48("40") ? step < trace.states.length : stryMutAct_9fa48("39") ? step > trace.states.length : stryMutAct_9fa48("38") ? false : (stryCov_9fa48("38", "39", "40"), step >= trace.states.length)))) throw new Error(stryMutAct_9fa48("41") ? `` : (stryCov_9fa48("41"), `scrub: step ${step} out of range [0, ${trace.states.length})`));
    return trace.states[step];
  }
};
const verifyTrace = <S, E>(trace: Trace<S, E>): boolean => {
  if (stryMutAct_9fa48("42")) {
    {}
  } else {
    stryCov_9fa48("42");
    for (let i = 0; stryMutAct_9fa48("45") ? i >= trace.states.length : stryMutAct_9fa48("44") ? i <= trace.states.length : stryMutAct_9fa48("43") ? false : (stryCov_9fa48("43", "44", "45"), i < trace.states.length); stryMutAct_9fa48("46") ? i -= 1 : (stryCov_9fa48("46"), i += 1)) if (stryMutAct_9fa48("49") ? hashValue(trace.states[i]) === trace.hashes[i] : stryMutAct_9fa48("48") ? false : stryMutAct_9fa48("47") ? true : (stryCov_9fa48("47", "48", "49"), hashValue(trace.states[i]) !== trace.hashes[i])) return stryMutAct_9fa48("50") ? true : (stryCov_9fa48("50"), false);
    for (let i = 0; stryMutAct_9fa48("53") ? i >= trace.patches.length : stryMutAct_9fa48("52") ? i <= trace.patches.length : stryMutAct_9fa48("51") ? false : (stryCov_9fa48("51", "52", "53"), i < trace.patches.length); stryMutAct_9fa48("54") ? i -= 1 : (stryCov_9fa48("54"), i += 1)) {
      if (stryMutAct_9fa48("55")) {
        {}
      } else {
        stryCov_9fa48("55");
        const patch = trace.patches[i];
        if (stryMutAct_9fa48("58") ? patch !== undefined : stryMutAct_9fa48("57") ? false : stryMutAct_9fa48("56") ? true : (stryCov_9fa48("56", "57", "58"), patch === undefined)) continue;
        const rebuilt = applyDiff(trace.states[i], patch);
        if (stryMutAct_9fa48("61") ? hashValue(rebuilt) === trace.hashes[i + 1] : stryMutAct_9fa48("60") ? false : stryMutAct_9fa48("59") ? true : (stryCov_9fa48("59", "60", "61"), hashValue(rebuilt) !== trace.hashes[stryMutAct_9fa48("62") ? i - 1 : (stryCov_9fa48("62"), i + 1)])) return stryMutAct_9fa48("63") ? true : (stryCov_9fa48("63"), false);
      }
    }
    return stryMutAct_9fa48("64") ? false : (stryCov_9fa48("64"), true);
  }
};
const snapshotTrace = stryMutAct_9fa48("65") ? () => undefined : (stryCov_9fa48("65"), (() => {
  const snapshotTrace = <S, E>(trace: Trace<S, E>) => encode(stryMutAct_9fa48("66") ? {} : (stryCov_9fa48("66"), {
    events: trace.events,
    hashes: trace.hashes,
    initial: trace.states[0]
  }));
  return snapshotTrace;
})());
export { replay, run, scrub, snapshotTrace, verifyTrace };
export type { MachineConfig, Trace };
