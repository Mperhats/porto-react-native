const aasaUrl = new URL('./apple-app-site-association', import.meta.url)
const assetLinksUrl = new URL('./assetlinks.json', import.meta.url)

const server = Bun.serve({
  port: Number(Bun.env.PORT ?? 8787),
  development: Bun.env.NODE_ENV !== 'production',
  routes: {
    '/': () => new Response('ok'),

    '/.well-known/apple-app-site-association': {
      async GET(request, server) {
        const ipAddress = server.requestIP(request)
        console.info(`Request from ${ipAddress?.address}`)

        return Response.json(await Bun.file(aasaUrl).json())
      },
    },
    '/.well-known/assetlinks.json': {
      GET: async (request, server) => {
        const ipAddress = server.requestIP(request)
        console.info(`Request from ${ipAddress?.address}`)

        return Response.json(await Bun.file(assetLinksUrl).json())
      },
    },
  },
  error: (error) => {
    console.error(`Error in bun server:`, error)

    return new Response('Internal Server Error', { status: 500 })
  },
})

const stopAndExit = () => [server.stop(), process.exit(0)]

process.on('SIGINT', () => stopAndExit())
process.on('SIGTERM', () => stopAndExit())
process.on('SIGQUIT', () => stopAndExit())

if (Bun.env.ENVIRONMENT === 'development')
  console.info(`Server is running on http://localhost:${server.port}`)
else console.info(`Server is running on port ${server.port}`)
