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
import { SidebarMenuButton } from '@a/ui/sidebar'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

const ThemeToggle = (): React.JSX.Element => {
  const { resolvedTheme, setTheme } = useTheme()
  const dark = resolvedTheme === 'dark'
  return (
    <SidebarMenuButton onClick={() => setTheme(dark ? 'light' : 'dark')} tooltip={dark ? 'Light mode' : 'Dark mode'}>
      {dark ? <Sun /> : <Moon />}
      <span>{dark ? 'Light mode' : 'Dark mode'}</span>
    </SidebarMenuButton>
  )
}
export default ThemeToggle
