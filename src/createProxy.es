import http from 'http'
import net from 'net'
import Url from 'url'

export default function ({
  forwardHost = null,
  forwardPort = null,
  server = http.createServer(),
  route = path => path,
  localPort = 7000,
  changeOrigin = false,
} = {}) {

  server.on('request', (req, res) => {
    const {url, method, headers} = req
    const {hostname, port, path} = Url.parse(url)

    const opts = {
      protocol: 'http:',
      host: forwardHost || hostname || 'localhost',
      port: forwardPort || port || 80,
      path: route(path) || path,
      method,
      headers,
    }

    if (changeOrigin) {
      opts.headers.host = opts.host + (opts.port == 80 ? '' : `:${opts.port}`)
    }

    req.pipe(http.request(opts, response => {
      const {statusCode, headers} = response
      res.writeHead(statusCode, headers)
      response.pipe(res)
    }).on('error', err => {
      res.writeHead(500, err.message, {
        'Content-Type': 'text/plain',
      })
      res.end()
    }))
  })

  return new Promise(resolve => {
    if (localPort) {
      server.listen(localPort, () => {
          resolve(server)
      })
    } else {
      resolve(server)
    }
  })
}
