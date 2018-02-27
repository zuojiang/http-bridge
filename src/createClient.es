import net from 'net'

import createProxy from './createProxy'

export default async function ({
  remotePort = 10000,
  remoteHost = 'localhost',
  poolSize = 20,
  confirmDelay = 200,
  forwardHost,
  forwardPort,
  localPort,
  route,
  changeOrigin,
} = {}) {

  const server = await createProxy({
    forwardHost,
    forwardPort,
    localPort,
    route,
    changeOrigin,
  })

  function connect () {
    let status = 0
    return new Promise((resolve, reject) => {
      const socket = net.connect(remotePort, remoteHost, () => {
        status = 1
        setTimeout(() => {
          if (status == 1) {
            server.emit('connection', socket)
            socket.on('close', () => {
              connect()
            })
            resolve()
          } else {
            process.exit()
          }
        }, parseInt(confirmDelay))
      })

      socket.on('error', err => {
        if (err.code == 'ECONNREFUSED') {
          console.error(err);
          process.exit()
        } else {
          reject(err)
        }
      })

      socket.once('close', () => {
        status = 2
      })

    })
  }

  for(let i=0; i<poolSize; i++) {
    await connect()
  }

  return server
}
