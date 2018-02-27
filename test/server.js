import createServer from '../src/createServer'

createServer({
  httpPort: 8080,
  // filter: () => false,
}).then(([httpServer, netServer]) => {
  httpServer.on('request', req => {
    console.log('[Server][%s] %s', req.method, req.url)
  })
}, console.error)
