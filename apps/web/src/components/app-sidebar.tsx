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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@a/ui/collapsible'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail
} from '@a/ui/sidebar'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { NavSection } from '@/lib/nav'
import { NAV } from '@/lib/nav'
import ThemeToggle from './theme-toggle'

const onSection = (pathname: string, href: string): boolean =>
  href === '/' ? pathname === '/' : pathname.startsWith(href)
const Section = ({ section, pathname }: { pathname: string; section: NavSection }): React.JSX.Element => {
  if (section.items === undefined)
    return (
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={onSection(pathname, section.href)}
          render={<Link href={section.href} />}
          tooltip={section.title}>
          <section.icon />
          <span>{section.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  return (
    <Collapsible
      className='group/collapsible'
      defaultOpen={onSection(pathname, section.href)}
      render={<SidebarMenuItem />}>
      <CollapsibleTrigger
        render={<SidebarMenuButton isActive={onSection(pathname, section.href)} tooltip={section.title} />}>
        <section.icon />
        <span>{section.title}</span>
        <ChevronRight className='ml-auto transition-transform group-data-[open]/collapsible:rotate-90' />
      </CollapsibleTrigger>
      <CollapsibleContent>
        <SidebarMenuSub>
          {section.items.map(item => (
            <SidebarMenuSubItem key={item.href}>
              <SidebarMenuSubButton isActive={pathname === item.href} render={<Link href={item.href} />}>
                <span>{item.title}</span>
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      </CollapsibleContent>
    </Collapsible>
  )
}
const AppSidebar = (): React.JSX.Element => {
  const pathname = usePathname()
  return (
    <Sidebar collapsible='icon'>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV.filter(section => section.href !== '/').map(section => (
                <Section key={section.href} pathname={pathname} section={section} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <ThemeToggle />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
export default AppSidebar
