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
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@a/ui/sidebar'
import AppSidebar from './app-sidebar'

const AppShell = ({ children }: { children: ReactNode }): React.JSX.Element => (
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header className='flex h-12 items-center gap-2 border-b px-4'>
        <SidebarTrigger />
        <span className='font-mono text-sm text-muted-foreground'>sim · ⌘K to search</span>
      </header>
      {children}
    </SidebarInset>
  </SidebarProvider>
)
export default AppShell
