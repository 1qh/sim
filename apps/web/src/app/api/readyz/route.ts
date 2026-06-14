const GET = (): Response => {
  const checks = { app: true }
  const ok = Object.values(checks).every(Boolean)
  return Response.json(checks, { headers: { 'cache-control': 'no-store' }, status: ok ? 200 : 503 })
}
export { GET }
