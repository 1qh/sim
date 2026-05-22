const GET = (): Response =>
  new Response('ok', { headers: { 'cache-control': 'no-store', 'content-type': 'text/plain' }, status: 200 })
export { GET }
