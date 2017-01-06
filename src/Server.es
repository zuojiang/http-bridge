import http from 'http'
import net from 'net'

const http_port_symbol = Symbol('httpPort')
const net_port_symbol = Symbol('netPort')

export class Server {
  constructor(props={}) {
    let {
      httpPort=80,
      netPort=10000,
      maxPoolSize=100,
      debug=false,
    } = props

    this[http_port_symbol] = httpPort
    this[net_port_symbol] = netPort
    this.maxPoolSize = maxPoolSize

    const httpServer = http.createServer()
    const netServer = net.createServer()
    
    let sockets = []

    netServer.on('connection', socket => {
      socket.on('error', err => {
        console.error(err)
      })

      if (sockets.length < this.maxPoolSize) {
        socket._used = false
        socket.on('end', () => {
          if (!socket._used) {
            for (let i=0; i<sockets.length; i++) {
              if (sockets[i] === socket) {
                sockets.splice(i, 1)
                break
              }
            }
          }
        })
        sockets.push(socket)
      } else {
        socket.end()
      }
    })

    httpServer.on('connection', socket => {
      socket.on('error', err => {
        console.error(err)
      })

      if (sockets.length === 0) {
        socket.end()
        return
      }

      let _socket = socket._socket

      if (!_socket) {
        _socket = socket._socket = sockets.shift()
        if (_socket) {
          _socket._used = true
          socket.pipe(_socket).pipe(socket)
        }
      }

      if (!_socket) {
        socket.end()
      }
    })

    httpServer.listen(httpPort)
    netServer.listen(netPort)

    debug && console.log('Listening on %s (http) and %s (net)', httpPort, netPort)
  }

  get httpPort () {
    return this[http_port_symbol]
  }

  get netPort () {
    return this[net_port_symbol]
  }
}

export default Server
