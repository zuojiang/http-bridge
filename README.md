## http-bridge

### Description

`http-bridge` is a simple Node.js application,
to expose a local server behind a firewall to the internet by an internet server.

### Installation

```
npm install http-bridge -g
```

### Usage

#### CLI

```sh
http-bridge -S --http-port 8080 --net-port 8081 # Server mode, internet server

http-bridge -C --remote-host xxx.xxx.xxx.xxx --remote-port 8081 --forward-port 3000 # Client mode, local server

http-bridge -P --local-port 7000 --route-file route.json # Proxy mode, local proxy server

http-bridge -h # more...
```

#### route.js

```js
module.exports = {
  "/t1/": "/test1/",
  // http://localhost:8080/t1/admin -> http://localhost:8080/test1/admin

  "/t2/": "http://www.test2.com:8080/",
  // http://localhost:8080/t2/admin -> http://www.test2.com:8080/admin

  "/t3/": "http://www.test.com:8080/3/",
  // http://localhost:8080/t3/admin -> http://www.test.com:8080/3/admin

  "http://127.0.0.1:8080/t4/": "/test4/"
  // http://127.0.0.1:8080/t4/admin -> http://127.0.0.1:8080/test4/admin
  // http://localhost:8080/t4/admin -> http:/localhost:8080/t4/admin
}
```

### License

MIT
