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
'use client'
import type { ReactNode } from 'react'
import { Toaster } from '@a/ui/components/sonner'
import { TooltipProvider } from '@a/ui/components/tooltip'
import { ThemeProvider } from 'next-themes'
const Providers = ({ children }: { children: ReactNode }) => (
  <ThemeProvider attribute='class' defaultTheme='dark' disableTransitionOnChange enableSystem={false}>
    <TooltipProvider>
      {children}
      <Toaster />
    </TooltipProvider>
  </ThemeProvider>
)
export { Providers }
