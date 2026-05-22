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
