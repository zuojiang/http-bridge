## http-bridge

### Description

`http-bridge` is a simple Node.js application,
to expose a local server behind a firewall to the internet by an internet server.

![deployment](https://raw.githubusercontent.com/zuojiang/http-bridge/master/screenshots/deployment-2.0.0.png)

### Installation

```sh
npm install http-bridge -g
```

### Usage

```sh
# Server mode, internet server
$ http-bridge -S --http-port 8080

# Client mode, local server
$ http-bridge -C --remote-host xxx.xxx.xxx.xxx --forward-port 3000

# more...
$ http-bridge -h
```

### License

MIT
