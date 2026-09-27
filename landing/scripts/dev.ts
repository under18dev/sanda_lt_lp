const server = Bun.spawn(['bun', 'run', '--hot', 'src/server.ts'], {
  stdout: 'inherit',
  stderr: 'inherit',
})

const assets = Bun.spawn(['bunx', 'vite', 'build', '--watch'], {
  stdout: 'inherit',
  stderr: 'inherit',
})

const shutdown = () => {
  server.kill()
  assets.kill()
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

await Promise.race([server.exited, assets.exited])
shutdown()

export {}
