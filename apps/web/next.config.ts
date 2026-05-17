import type { NextConfig } from 'next'
import createMDX from '@next/mdx'
const config: NextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  reactStrictMode: true
}
const withMDX = createMDX({ options: { rehypePlugins: [], remarkPlugins: [] } })
export default withMDX(config)
