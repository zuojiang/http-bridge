import http from 'http'
import createClient from '../src/createClient'

createClient({
  changeOrigin: true,
  // forwardHost: '',
}).then(server => {
  server.on('request', (req, res) => {
    console.log('[Client][%s] %s', req.method, req.url)
  })

  const req = http.request({
    port: 8080,
  }, res => {
    console.log('[Node][%s] %s', res.statusCode, res.statusMessage)
  })
  req.on('error', console.error)
  req.end()
}).catch(console.error)
