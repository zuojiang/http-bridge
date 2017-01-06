import http from 'http'
import net from 'net'
import Url from 'url'

const server_symbol = Symbol('server')

export class Proxy {
  constructor(props={}) {
    const {
      forwardHost=null,
      forwardPort=null,
      localServer=null,
      localPort=null,
      debug=false,
    } = props

    this.forwardHost = forwardHost
    this.forwardPort = forwardPort

    const server = this[server_symbol] = localServer || http.createServer()

    server.on('request', (req, res) => {
      const {url, method, headers} = req
      const {hostname, port, path, pathname, search} = Url.parse(url)
      
      debug && console.log('[%s] %s', method, url)
      
      const opts = {
        protocol: 'http:',
        host: this.forwardHost || hostname || 'localhost',
        port: this.forwardPort || port || 80,
        path,
        method,
        headers,
      }
      req.pipe(http.request(opts, response => {
        const {statusCode, headers} = response
        res.writeHead(statusCode, headers)
        response.pipe(res)
        debug && console.log('[%s] %s', statusCode, Url.format({
         protocol: opts.protocol,
         hostname: opts.host,
         port: opts.port,
         pathname,
         search, 
        }))
      }).on('error', err => {
        console.error(err)
        res.writeHead(500, err.message, {
          'Content-Type': 'text/plain',
        })
        res.end()
      }))
    })

    if (localPort) {
      server.listen(localPort, () => {
        debug && console.log('Listening on %s', localPort)
      })
    }
  }

  get server () {
    return this[server_symbol]
  }
}

export default Proxy