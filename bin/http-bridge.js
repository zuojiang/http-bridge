#!/usr/bin/env node

var Path = require('path')
var program = require('commander');
var logUpdate = require('log-update')
var pkg = require('../package.json');
var createServer = require('../lib/createServer').default;
var createClient = require('../lib/createClient').default;
var createProxy = require('../lib/createProxy').default;

program.version(pkg.version)
  .option('--verbose', 'Output log info.')

  .option('-S, --server', 'Server mode.')
  .option('-C, --client', 'Client mode.')
  .option('-P, --proxy', 'Proxy mode.')

  .option('--max-pool-size <n>', 'Set max pool size.(Default: 100)')
  .option('--http-port <port>', 'Set port of the http server.(Default: 80)')
  .option('--net-port <port>', 'Set port of the net server.(Default: 10000)')
  .option('--ip-list-file <json>', 'To list accessible ip address.')

  .option('--remote-host <hostname>', 'Set host of the remote server.(Default: localhost)')
  .option('--remote-port <port>', 'Set port of the remote server.(Default: 10000)')
  .option('--pool-size <n>', 'Set pool size.(Default: 20)')
  .option('--confirm-delay <ms>', 'Delay to confirm connection each time.(Default: 200)')

  .option('--forward-host <hostname>', 'Set host of the destination server.')
  .option('--forward-port <port>', 'Set port of the destination server.')
  .option('--local-port <port>', 'Set port of the proxy server.(Default: 7000)')
  .option('--change-origin', 'To change the origin of the host header to the target URL.')
  .option('--route-file <json>', 'A route file.')

  .parse(process.argv);

if (program.server) {
  createServer({
    httpPort: program.httpPort,
    netPort: program.netPort,
    maxPoolSize: program.maxPoolSize,
    filter: filter,
  }).then(([httpServer, netServer]) => {
    if (program.verbose) {
      console.log('Listening on %s(http) and %s(net)', httpServer.address().port, netServer.address().port);
      httpServer.on('request', req => {
        console.log('[Server][%s] %s', req.method, req.url)
      })
    }
  }, console.error)
} else if (program.client) {
  if (program.verbose) {
    logUpdate('connecting...')
  }
  createClient({
    remoteHost: program.remoteHost,
    remotePort: program.remotePort,
    forwardHost: program.forwardHost,
    forwardPort: program.forwardPort,
    poolSize: program.poolSize,
    changeOrigin: program.changeOrigin,
    confirmDelay: program.confirmDelay,
    route: route,
  }).then(server => {
    if (program.verbose) {
      logUpdate('Listening on '+ server.address().port)
      server.on('request', (req, res) => {
        console.log('[Client][%s] %s', req.method, req.url)
      })
    }
  }, console.error)
} else if (program.proxy) {
  createProxy({
    forwardHost: program.forwardHost,
    forwardPort: program.forwardPort,
    localPort: program.localPort,
    changeOrigin: program.changeOrigin,
    route: route,
  }).then(server => {
    if (program.verbose) {
      console.log('Listening on %s', server.address().port)
      server.on('request', (req, res) => {
        console.log('[Proxy][%s] %s', req.method, req.url)
      })
    }
  })
} else {
  program.outputHelp()
}

function readJSON (path) {
  return require(Path.resolve(process.cwd(), path))
}

function route(path) {
  if (program.routeFile) {
    var data = readJSON(program.routeFile)
    for (var originPath in data) {
      var targetPath = data[originPath]
      if (path.indexOf(originPath) == 0) {
        return targetPath + path.substr(originPath.length)
      }
    }
  }
  return path
}

function filter (socket) {
  var value = true
  if (program.ipListFile) {
    value = false
    var list = readJSON(program.ipListFile)
    for (var i in list) {
      if (list[i] === socket.remoteAddress) {
        value = true
        break
      }
    }
  }
  if (value && program.verbose) {
    console.log('[Server][%s] %s:%s', socket.remoteFamily, socket.remoteAddress, socket.remotePort)
  }
  return value
}
