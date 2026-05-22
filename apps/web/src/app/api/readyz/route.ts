/** biome-ignore-all lint/style/noProcessEnv: Next route handler runs in Next runtime, not Bun */
import process from 'node:process'

const ping = async (url: string): Promise<boolean> => {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(2000) })
    return res.ok
  } catch {
    return false
  }
}
const GET = async (): Promise<Response> => {
  const convexUrl = process.env.CONVEX_SELF_HOSTED_URL
  const convex = convexUrl ? await ping(`${convexUrl}/version`) : false
  const checks = { app: true, convex }
  const ok = Object.values(checks).every(Boolean)
  return Response.json(checks, { headers: { 'cache-control': 'no-store' }, status: ok ? 200 : 503 })
}
export { GET }
