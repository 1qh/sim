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
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { cn } from '@a/ui'
import CommandPalette from '@/features/command-palette/command-palette'
import { mono, sans } from './fonts'
import { Providers } from './providers'
import './global.css'

const metadata: Metadata = {
  description: 'Interactive 3D MIPS datapath and Karnaugh map visualizer.',
  title: 'MIPS datapath visualizer + Karnaugh map tool'
}
const Layout = ({ children }: { children: ReactNode }) => (
  <html className={cn('font-sans tracking-[-0.02em]', sans.variable, mono.variable)} lang='en' suppressHydrationWarning>
    <body className='min-h-screen antialiased'>
      <Providers>
        {children}
        <CommandPalette />
      </Providers>
    </body>
  </html>
)
export default Layout
export { metadata }
