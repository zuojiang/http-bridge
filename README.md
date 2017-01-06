# http-bridge

## Description

`http-bridge` is a simple Node.js application,
to expose a local server behind a firewall to the internet by an internet server.

## Installation

```
npm install http-bridge -g
```

## Usage

```sh
http-bridge -S --http-port 8080 --net-port 8081 # Server mode, internet server

http-bridge -C --remote-host xxx.xxx.xxx.xxx --remote-port 8081 # Client mode, local server

http-bridge -h # more...
```

## License

MIT