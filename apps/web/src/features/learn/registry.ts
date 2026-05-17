/** biome-ignore-all lint/nursery/noUndeclaredEnvVars: noise */
/** biome-ignore-all lint/performance/noNamespaceImport: noise */
/* oxlint-disable import/no-duplicates */
import type { FC } from 'react'
import L16 from '@content/learn/cross-link-derive-control-in-kmap.mdx'
import L6 from '@content/learn/datapath-branch-resolution.mdx'
import L7 from '@content/learn/datapath-critical-path.mdx'
import L4 from '@content/learn/datapath-i-type-walkthrough.mdx'
import L5 from '@content/learn/datapath-load-store-anatomy.mdx'
import L3 from '@content/learn/datapath-r-type-walkthrough.mdx'
import L2 from '@content/learn/intro-control-signals.mdx'
import L1 from '@content/learn/intro-instruction-anatomy.mdx'
import L0 from '@content/learn/intro-what-is-a-datapath.mdx'
import L14 from '@content/learn/kmap-five-six-var-toroid.mdx'
import L12 from '@content/learn/kmap-grouping-rules.mdx'
import L15 from '@content/learn/kmap-hazard-analysis.mdx'
import L13 from '@content/learn/kmap-prime-implicants.mdx'
import L11 from '@content/learn/kmap-truth-tables.mdx'
import L10 from '@content/learn/pipeline-forwarding.mdx'
import L9 from '@content/learn/pipeline-hazards.mdx'
import L8 from '@content/learn/pipeline-stages.mdx'
const LEARN_REGISTRY: Record<string, FC> = {
  'cross-link-derive-control-in-kmap': L16,
  'datapath-branch-resolution': L6,
  'datapath-critical-path': L7,
  'datapath-i-type-walkthrough': L4,
  'datapath-load-store-anatomy': L5,
  'datapath-r-type-walkthrough': L3,
  'intro-control-signals': L2,
  'intro-instruction-anatomy': L1,
  'intro-what-is-a-datapath': L0,
  'kmap-five-six-var-toroid': L14,
  'kmap-grouping-rules': L12,
  'kmap-hazard-analysis': L15,
  'kmap-prime-implicants': L13,
  'kmap-truth-tables': L11,
  'pipeline-forwarding': L10,
  'pipeline-hazards': L9,
  'pipeline-stages': L8
}
export { LEARN_REGISTRY }
