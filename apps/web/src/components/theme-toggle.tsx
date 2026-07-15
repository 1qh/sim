'use client'
import { SidebarMenuButton } from '@a/ui/sidebar'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const ThemeToggle = (): React.JSX.Element => {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    // eslint-disable-next-line @eslint-react/set-state-in-effect
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
