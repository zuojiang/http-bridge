import http from 'http'
import net from 'net'

export default function({
  httpPort = 80,
  netPort = 10000,
  maxPoolSize = 100,
  filter = socket => true,
} = {}){
  const sockets = []

  const netServer = net.createServer()
  netServer.on('connection', socket => {
    if (!filter(socket)) {
      socket.end()
      return
    }

    socket.on('error', console.error)

    if (sockets.length < maxPoolSize) {
      socket.on('end', () => {
        for (let i=0; i<sockets.length; i++) {
          if (sockets[i] === socket) {
            sockets.splice(i, 1)
            break
          }
        }
      })
      sockets.push(socket)
    } else {
      socket.end()
    }
  })

  const httpServer = http.createServer()
  httpServer.on('connection', socket => {
    socket.on('error', console.error)

    if (sockets.length == 0) {
      socket.end()
      return
    }

    let { _socket_ } = socket
    if (!_socket_) {
      _socket_ = socket._socket_ = sockets.shift()
    }

    if (_socket_) {
      socket.pipe(_socket_).pipe(socket)
    } else {
      socket.end()
    }

  })

  return Promise.all([
    new Promise(resolve => {
      httpServer.listen(httpPort, () => {
        resolve(httpServer)
      })
    }),
    new Promise(resolve => {
      netServer.listen(netPort, () => {
        resolve(netServer)
      })
    }),
  ])
}
