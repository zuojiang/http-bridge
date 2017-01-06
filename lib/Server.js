'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Server = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var http_port_symbol = Symbol('httpPort');
var net_port_symbol = Symbol('netPort');

var Server = exports.Server = function () {
  function Server() {
    var _this = this;

    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Server);

    var _props$httpPort = props.httpPort,
        httpPort = _props$httpPort === undefined ? 80 : _props$httpPort,
        _props$netPort = props.netPort,
        netPort = _props$netPort === undefined ? 10000 : _props$netPort,
        _props$maxPoolSize = props.maxPoolSize,
        maxPoolSize = _props$maxPoolSize === undefined ? 100 : _props$maxPoolSize,
        _props$debug = props.debug,
        debug = _props$debug === undefined ? false : _props$debug;


    this[http_port_symbol] = httpPort;
    this[net_port_symbol] = netPort;
    this.maxPoolSize = maxPoolSize;

    var httpServer = _http2.default.createServer();
    var netServer = _net2.default.createServer();

    var sockets = [];

    netServer.on('connection', function (socket) {
      socket.on('error', function (err) {
        console.error(err);
      });

      if (sockets.length < _this.maxPoolSize) {
        socket._used = false;
        socket.on('end', function () {
          if (!socket._used) {
            for (var i = 0; i < sockets.length; i++) {
              if (sockets[i] === socket) {
                sockets.splice(i, 1);
                break;
              }
            }
          }
        });
        sockets.push(socket);
      } else {
        socket.end();
      }
    });

    httpServer.on('connection', function (socket) {
      socket.on('error', function (err) {
        console.error(err);
      });

      if (sockets.length === 0) {
        socket.end();
        return;
      }

      var _socket = socket._socket;

      if (!_socket) {
        _socket = socket._socket = sockets.shift();
        if (_socket) {
          _socket._used = true;
          socket.pipe(_socket).pipe(socket);
        }
      }

      if (!_socket) {
        socket.end();
      }
    });

    httpServer.listen(httpPort);
    netServer.listen(netPort);

    debug && console.log('Listening on %s (http) and %s (net)', httpPort, netPort);
  }

  _createClass(Server, [{
    key: 'httpPort',
    get: function get() {
      return this[http_port_symbol];
    }
  }, {
    key: 'netPort',
    get: function get() {
      return this[net_port_symbol];
    }
  }]);

  return Server;
}();

exports.default = Server;