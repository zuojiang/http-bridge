'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Client = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _Proxy = require('./Proxy');

var _Proxy2 = _interopRequireDefault(_Proxy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var remote_host_symbol = Symbol('remoteHost');
var remote_port_symbol = Symbol('remotePort');
var proxy_symbol = Symbol('proxy');

var Client = exports.Client = function () {
  function Client() {
    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Client);

    var _props$remoteHost = props.remoteHost,
        remoteHost = _props$remoteHost === undefined ? '127.0.0.1' : _props$remoteHost,
        _props$remotePort = props.remotePort,
        remotePort = _props$remotePort === undefined ? 10000 : _props$remotePort,
        _props$forwardHost = props.forwardHost,
        forwardHost = _props$forwardHost === undefined ? '127.0.0.1' : _props$forwardHost,
        _props$forwardPort = props.forwardPort,
        forwardPort = _props$forwardPort === undefined ? 80 : _props$forwardPort,
        _props$routeFile = props.routeFile,
        routeFile = _props$routeFile === undefined ? null : _props$routeFile,
        _props$poolSize = props.poolSize,
        poolSize = _props$poolSize === undefined ? 20 : _props$poolSize,
        _props$localServer = props.localServer,
        localServer = _props$localServer === undefined ? null : _props$localServer,
        _props$debug = props.debug,
        debug = _props$debug === undefined ? false : _props$debug;


    this[remote_host_symbol] = remoteHost;
    this[remote_port_symbol] = remotePort;
    var proxy = this[proxy_symbol] = new _Proxy2.default({
      localServer: localServer,
      forwardHost: forwardHost,
      forwardPort: forwardPort,
      routeFile: routeFile,
      debug: debug
    });

    for (var i = 0; i < poolSize; i++) {
      this.connect();
    }

    debug && console.log('Connect to %s:%d, forward to %s:%d', remoteHost, remotePort, forwardHost, forwardPort);
  }

  _createClass(Client, [{
    key: 'connect',
    value: function connect() {
      var _this = this;

      var socket = _net2.default.connect(this.remotePort, this.remoteHost, function () {
        _this[proxy_symbol].server.emit('connection', socket);
      });
      socket.on('close', function () {
        _this.connect();
      });
      socket.on('error', function (err) {
        console.error(err);
      });
    }
  }, {
    key: 'remoteHost',
    get: function get() {
      return this[remote_host_symbol];
    }
  }, {
    key: 'remotePort',
    get: function get() {
      return this[remote_port_symbol];
    }
  }, {
    key: 'forwardHost',
    get: function get() {
      return this[proxy_symbol].forwardHost;
    },
    set: function set(host) {
      this[proxy_symbol].forwardHost = host;
    }
  }, {
    key: 'forwardPort',
    get: function get() {
      return this[proxy_symbol].forwardPort;
    },
    set: function set(port) {
      this[proxy_symbol].forwardPort = port;
    }
  }]);

  return Client;
}();

exports.default = Client;