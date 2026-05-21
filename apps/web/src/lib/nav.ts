import type { LucideIcon } from 'lucide-react'
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
import { BookOpen, Columns2, Cpu, Grid3x3, House, ScrollText } from 'lucide-react'
import { LEARN_PAGES } from '@/features/learn/manifest'

const MIPS_NAMES = [
  'add',
  'addi',
  'and',
  'andi',
  'beq',
  'bne',
  'j',
  'lui',
  'lw',
  'nor',
  'or',
  'ori',
  'sll',
  'slt',
  'srl',
  'sub',
  'sw'
] as const
const KMAP_CASES = ['v2', 'v3', 'v4', 'v4-pos', 'v5', 'v5-wrap', 'v6', 'v6-wrap'] as const
const PIPELINE_PROGRAMS = ['raw', 'waw', 'war', 'control', 'forwarding', 'stall'] as const
interface NavItem {
  href: string
  title: string
}
interface NavSection {
  href: string
  icon: LucideIcon
  items?: NavItem[]
  title: string
}
const NAV: NavSection[] = [
  { href: '/', icon: House, title: 'Home' },
  {
    href: '/mips',
    icon: Cpu,
    items: [{ href: '/mips/assembly', title: 'assembly' }, ...MIPS_NAMES.map(n => ({ href: `/mips/${n}`, title: n }))],
    title: 'MIPS datapath'
  },
  {
    href: '/kmap',
    icon: Grid3x3,
    items: KMAP_CASES.map(c => ({ href: `/kmap/${c}`, title: c })),
    title: 'Karnaugh map'
  },
  {
    href: '/pipeline',
    icon: ScrollText,
    items: PIPELINE_PROGRAMS.map(p => ({ href: `/pipeline/${p}`, title: p })),
    title: 'Pipeline'
  },
  { href: '/compare', icon: Columns2, title: 'Compare' },
  {
    href: '/learn',
    icon: BookOpen,
    items: LEARN_PAGES.map(p => ({ href: `/learn/${p.slug}`, title: p.title })),
    title: 'Learn'
  }
]
export { KMAP_CASES, MIPS_NAMES, NAV, PIPELINE_PROGRAMS }
export type { NavItem, NavSection }
