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
interface LearnPage {
  next: string | undefined
  prev: string | undefined
  slug: string
  title: string
}
const ORDER: { slug: string; title: string }[] = [
  { slug: 'intro-what-is-a-datapath', title: 'What is a datapath' },
  { slug: 'intro-instruction-anatomy', title: 'Instruction anatomy' },
  { slug: 'intro-control-signals', title: 'Control signals' },
  { slug: 'datapath-r-type-walkthrough', title: 'R-type walkthrough' },
  { slug: 'datapath-i-type-walkthrough', title: 'I-type walkthrough' },
  { slug: 'datapath-load-store-anatomy', title: 'Load/store anatomy' },
  { slug: 'datapath-branch-resolution', title: 'Branch resolution' },
  { slug: 'datapath-critical-path', title: 'Critical path' },
  { slug: 'pipeline-stages', title: 'Pipeline stages' },
  { slug: 'pipeline-hazards', title: 'Pipeline hazards' },
  { slug: 'pipeline-forwarding', title: 'Forwarding' },
  { slug: 'kmap-truth-tables', title: 'Truth tables' },
  { slug: 'kmap-grouping-rules', title: 'Grouping rules' },
  { slug: 'kmap-prime-implicants', title: 'Prime implicants' },
  { slug: 'kmap-five-six-var-toroid', title: 'Five and six variable toroid' },
  { slug: 'kmap-hazard-analysis', title: 'Hazard analysis' },
  { slug: 'cross-link-derive-control-in-kmap', title: 'Derive Control in K-map' }
]
const LEARN_PAGES: readonly LearnPage[] = ORDER.map((p, i) => ({
  next: ORDER[i + 1]?.slug,
  prev: ORDER[i - 1]?.slug,
  slug: p.slug,
  title: p.title
}))
const LEARN_SLUGS: readonly string[] = ORDER.map(p => p.slug)
const MIPS_EXAMPLES: readonly string[] = [
  'hello',
  'sum-1-n',
  'array-sum',
  'gcd',
  'factorial',
  'fibonacci',
  'string-length',
  'bubble-sort',
  'power-of-two',
  'memory-copy',
  'branch-heavy',
  'load-use-hazard',
  'forwarding-resolvable',
  'critical-path-worst',
  'slow-alu-experiment',
  'all-r-type',
  'all-i-type',
  'all-branch',
  'pseudo-zoo',
  'alu-only'
]
const KMAP_EXAMPLES: readonly string[] = [
  '2var-xor',
  '2var-and',
  '3var-majority',
  '3var-xor',
  '4var-bcd-7seg-a',
  '4var-bcd-7seg-g',
  '4var-full-adder-carry',
  '4var-full-adder-sum',
  '4var-mux-selector',
  '4var-dont-cares',
  '4var-hazard',
  '5var-parity',
  '5var-majority',
  '6var-demo',
  'multi-bcd-7seg',
  'multi-2bit-comparator',
  'multi-half-adder',
  'multi-full-adder',
  'cross-link-regdst',
  'cross-link-alusrc'
]
export { KMAP_EXAMPLES, LEARN_PAGES, LEARN_SLUGS, MIPS_EXAMPLES }
export type { LearnPage }
