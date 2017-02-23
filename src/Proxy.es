import http from 'http'
import net from 'net'
import Url from 'url'
import Path from 'path'

const server_symbol = Symbol('server')

export class Proxy {
  constructor(props={}) {
    const {
      forwardHost=null,
      forwardPort=null,
      localServer=null,
      localPort=null,
      routeFile=null,
      debug=false,
    } = props

    this.forwardHost = forwardHost
    this.forwardPort = forwardPort
    this.routeMap = routeFile && require(Path.resolve(process.cwd(), routeFile))

    const server = this[server_symbol] = localServer || http.createServer()

    server.on('request', (req, res) => {
      const {url, method, headers} = req
      const {hostname, port, path} = Url.parse(url)
      
      debug && console.log('[%s] %s', method, url)
      
      const opts = {
        protocol: 'http:',
        host: this.forwardHost || hostname || 'localhost',
        port: this.forwardPort || port || 80,
        path,
        method,
      }

      if (this.routeMap) {
        for (let route in this.routeMap) {
          if (path.indexOf(route) === 0 || url.indexOf(route) === 0) {
            let url1 = Url.parse(route)
            let url2 = Url.parse(this.routeMap[route])

            if (url2.protocol) {
              opts.host = url2.hostname
              opts.port = url2.port || 80 
            }
            if (url2.pathname) {
              opts.path = opts.path.replace(url1.pathname, url2.pathname)
            }
            break
          }
        }        
      }

      opts.headers = {
        ...headers,
        host: opts.host + (opts.port == 80 ? '' : `:${opts.port}`),
      }

      req.pipe(http.request(opts, response => {
        const {statusCode, headers} = response
        res.writeHead(statusCode, headers)
        response.pipe(res)
        debug && console.log('[%s] %s', statusCode, Url.format({
          protocol: opts.protocol,
          hostname: opts.host,
          port: opts.port,
          pathname: opts.path,
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
