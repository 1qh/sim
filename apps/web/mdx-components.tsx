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
import type { MDXComponents } from 'mdx/types'
import {
  DatapathStep,
  DatapathView,
  KmapInteractive,
  KmapView,
  PipelineDiagram,
  RegisterValue,
  Signal,
  TruthTable
} from '@/features/learn/islands'
const useMDXComponents = (components: MDXComponents): MDXComponents => ({
  DatapathStep,
  DatapathView,
  KmapInteractive,
  KmapView,
  PipelineDiagram,
  RegisterValue,
  Signal,
  TruthTable,
  h1: ({ children, ...p }: React.ComponentPropsWithoutRef<'h1'>) => (
    <h1 className='text-3xl font-bold' {...p}>
      {children}
    </h1>
  ),
  h2: ({ children, ...p }: React.ComponentPropsWithoutRef<'h2'>) => (
    <h2 className='mt-6 text-xl font-semibold' {...p}>
      {children}
    </h2>
  ),
  p: ({ children, ...p }: React.ComponentPropsWithoutRef<'p'>) => (
    <p className='leading-relaxed text-muted-foreground' {...p}>
      {children}
    </p>
  ),
  ...components
})
export { useMDXComponents }
