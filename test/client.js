import Client from '../src/Client'

const client = new Client({
  remoteHost: '127.0.0.1',
  remotePort: '11011',
  forwardHost: '127.0.0.1',
  forwardPort: '3000',
  debug: true,
})
