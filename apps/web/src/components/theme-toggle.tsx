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
import { useEffect, useState } from 'react'

const ThemeToggle = (): React.JSX.Element => {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
    setMounted(true)
  }, [])
  const dark = mounted && resolvedTheme === 'dark'
  const label = mounted ? (dark ? 'Light mode' : 'Dark mode') : 'Theme'
  return (
    <SidebarMenuButton onClick={() => setTheme(dark ? 'light' : 'dark')} suppressHydrationWarning tooltip={label}>
      {dark ? <Sun /> : <Moon />}
      <span suppressHydrationWarning>{label}</span>
    </SidebarMenuButton>
  )
}
export default ThemeToggle
