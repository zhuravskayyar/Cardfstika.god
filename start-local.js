import { createServer } from 'vite'
import open from 'open'

let server

async function start() {
  server = await createServer({})
  await server.listen()
  const config = server.config || {}
  const port = (config.server && config.server.port) || 5173
  const protocol = (config.server && config.server.https) ? 'https' : 'http'
  let host = 'localhost'
  if (config.server && typeof config.server.host !== 'undefined') {
    host = config.server.host === true ? 'localhost' : String(config.server.host)
  }
  const url = `${protocol}://${host}:${port}/`
  console.log(`Dev server running at ${url}`)

  async function shutdown() {
    try {
      if (server) {
        await server.close()
        console.log('Dev server stopped')
      }
    } catch (e) {
      console.error('Error while stopping server', e)
    } finally {
      process.exit(0)
    }
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
  process.on('uncaughtException', async (err) => {
    console.error('Uncaught exception', err)
    await shutdown()
  })

  try {
    await open(url)
    console.log('Opened browser. Press Enter to stop the server.')
    process.stdin.setEncoding('utf8')
    process.stdin.resume()
    await new Promise((resolve) => process.stdin.once('data', resolve))
  } catch (err) {
    console.error('Failed to open browser:', err)
    console.log('Press Enter to stop the server.')
    process.stdin.setEncoding('utf8')
    process.stdin.resume()
    await new Promise((resolve) => process.stdin.once('data', resolve))
  }

  await shutdown()
}

start()
