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
/* oxlint-disable unicorn/no-array-reduce, unicorn/no-immediate-mutation, unicorn/number-literal-case, unicorn/no-process-exit, import/no-duplicates, promise/param-names, @eslint-react/naming-convention/component-name, react-perf/jsx-no-jsx-as-prop */
'use client'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@a/ui/sidebar'
import { BookOpen, Columns2, Cpu, Grid3x3, House, ScrollText } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/', icon: House, label: 'Home' },
  { href: '/mips', icon: Cpu, label: 'MIPS datapath' },
  { href: '/kmap', icon: Grid3x3, label: 'Karnaugh map' },
  { href: '/pipeline', icon: ScrollText, label: 'Pipeline' },
  { href: '/compare', icon: Columns2, label: 'Compare' },
  { href: '/learn', icon: BookOpen, label: 'Learn' }
] as const
const AppSidebar = (): React.JSX.Element => {
  const pathname = usePathname()
  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href='/' />} size='lg' tooltip='sim'>
              <Cpu className='size-5' />
              <span className='font-bold'>sim</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Visualizers</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.map(item => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)}
                    render={<Link href={item.href} />}
                    tooltip={item.label}>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href='/accessibility' />} tooltip='Accessibility'>
              <BookOpen />
              <span>Accessibility</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
export default AppSidebar
