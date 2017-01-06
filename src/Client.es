import http from 'http'
import net from 'net'
import Url from 'url'

import Proxy from './Proxy'

const remote_host_symbol = Symbol('remoteHost')
const remote_port_symbol = Symbol('remotePort')
const proxy_symbol = Symbol('proxy')

export class Client {
  constructor(props={}) {
    let {
      remoteHost='127.0.0.1',
      remotePort=10000,
      forwardHost='127.0.0.1',
      forwardPort=80,
      poolSize=20,
      localServer=null,
      debug=false,
    } = props

    this[remote_host_symbol] = remoteHost
    this[remote_port_symbol] = remotePort
    const proxy = this[proxy_symbol] = new Proxy({
      localServer,
      forwardHost,
      forwardPort,
      debug,
    })

    for(let i=0; i<poolSize; i++) {
      this.connect()
    }

    debug && console.log('Connect to %s:%d, forward to %s:%d', remoteHost, remotePort, forwardHost, forwardPort)
  }

  get remoteHost () {
    return this[remote_host_symbol]
  }

  get remotePort () {
    return this[remote_port_symbol]
  }

  get forwardHost () {
    return this[proxy_symbol].forwardHost
  }

  set forwardHost (host) {
    this[proxy_symbol].forwardHost = host
  }

  get forwardPort () {
    return this[proxy_symbol].forwardPort
  }

  set forwardPort (port) {
    this[proxy_symbol].forwardPort = port
  }

  connect () {
    const socket = net.connect(this.remotePort, this.remoteHost, () => {
      this[proxy_symbol].server.emit('connection', socket)
    })
    socket.on('close', () => {
      this.connect()
    })
    socket.on('error', err => {
      console.error(err)
    })
  }

}

export default Client