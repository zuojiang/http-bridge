#!/usr/bin/env node

var program = require("commander");
var pkg = require('../package.json');
var Server = require('../lib/Server').Server;
var Client = require('../lib/Client').Client;
var Proxy = require('../lib/Proxy').Proxy;

program.version(pkg.version)
  .option('--output', 'Output log info.')
  .option('-S, --server', 'Server mode.')
  .option('-C, --client', 'Client mode.')
  .option('-P, --proxy', 'Proxy mode.')

  .option('--max-pool-size <n>', 'Set max pool size.')
  .option('--http-port <port>', 'Set port of the http server.')
  .option('--net-port <port>', 'Set port of the net server.')
  
  .option('--remote-host <hostname>', 'Set host of the remote server.')
  .option('--remote-port <port>', 'Set port of the remote server.')
  .option('--pool-size <n>', 'Set pool size.')

  .option('--forward-host <hostname>', 'Set host of the destination server.')
  .option('--forward-port <port>', 'Set port of the destination server.')
  .option('--local-port <port>', 'Set port of the proxy server.')
  .option('--route-file <json>', 'A route file.')

  .parse(process.argv);

if (program.server) {
  new Server({
    httpPort: program.httpPort,
    netPort: program.netPort,
    maxPoolSize: program.maxPoolSize,
    debug: program.output
  })
} else if (program.client) {
  new Client({
    remoteHost: program.remoteHost,
    remotePort: program.remotePort,
    forwardHost: program.forwardHost,
    forwardPort: program.forwardPort,
    routeFile: program.routeFile,
    poolSize: program.poolSize,
    debug: program.output
  })
} else if (program.proxy) {
  new Proxy({
    forwardHost: program.forwardHost,
    forwardPort: program.forwardPort,
    localPort: program.localPort,
    routeFile: program.routeFile,
    debug: program.output
  })
} else {
  program.outputHelp()
}
