import http from 'http'
import Path from 'path'

import Proxy from '../src/Proxy'

const proxy = new Proxy({
  routeFile: Path.join(__dirname, './route.json'),
  localPort: 3001,
  debug: true,
})

http.createServer(function(req, res) {
  res.end(Path.join(`http://${req.headers.host}`, req.url))
}).listen('8080')

/*
# /etc/hosts

127.0.0.1 www.test2.com
127.0.0.1 www.test.com

*/