import app from './index'

const port = Number(process.env.PORT ?? 3000)

const server = Bun.serve({
  port,
  fetch: app.fetch,
})

console.log(`Sanda LT landing server listening on http://localhost:${server.port}`)
