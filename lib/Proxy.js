'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Proxy = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var server_symbol = Symbol('server');

var Proxy = exports.Proxy = function () {
  function Proxy() {
    var _this = this;

    var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Proxy);

    var _props$forwardHost = props.forwardHost,
        forwardHost = _props$forwardHost === undefined ? null : _props$forwardHost,
        _props$forwardPort = props.forwardPort,
        forwardPort = _props$forwardPort === undefined ? null : _props$forwardPort,
        _props$localServer = props.localServer,
        localServer = _props$localServer === undefined ? null : _props$localServer,
        _props$localPort = props.localPort,
        localPort = _props$localPort === undefined ? null : _props$localPort,
        _props$routeFile = props.routeFile,
        routeFile = _props$routeFile === undefined ? null : _props$routeFile,
        _props$debug = props.debug,
        debug = _props$debug === undefined ? false : _props$debug;


    this.forwardHost = forwardHost;
    this.forwardPort = forwardPort;
    this.routeMap = routeFile && require(_path2.default.resolve(process.cwd(), routeFile));

    var server = this[server_symbol] = localServer || _http2.default.createServer();

    server.on('request', function (req, res) {
      var url = req.url,
          method = req.method,
          headers = req.headers;

      var _Url$parse = _url2.default.parse(url),
          hostname = _Url$parse.hostname,
          port = _Url$parse.port,
          path = _Url$parse.path;

      debug && console.log('[%s] %s', method, url);

      var opts = {
        protocol: 'http:',
        host: _this.forwardHost || hostname || 'localhost',
        port: _this.forwardPort || port || 80,
        path: path,
        method: method
      };

      if (_this.routeMap) {
        for (var route in _this.routeMap) {
          if (path.indexOf(route) === 0 || url.indexOf(route) === 0) {
            var url1 = _url2.default.parse(route);
            var url2 = _url2.default.parse(_this.routeMap[route]);

            if (url2.protocol) {
              opts.host = url2.hostname;
              opts.port = url2.port || 80;
            }
            if (url2.pathname) {
              opts.path = opts.path.replace(url1.pathname, url2.pathname);
            }
            break;
          }
        }
      }

      opts.headers = _extends({}, headers, {
        host: opts.host + (opts.port == 80 ? '' : ':' + opts.port)
      });

      req.pipe(_http2.default.request(opts, function (response) {
        var statusCode = response.statusCode,
            headers = response.headers;

        res.writeHead(statusCode, headers);
        response.pipe(res);
        debug && console.log('[%s] %s', statusCode, _url2.default.format({
          protocol: opts.protocol,
          hostname: opts.host,
          port: opts.port,
          pathname: opts.path
        }));
      }).on('error', function (err) {
        console.error(err);
        res.writeHead(500, err.message, {
          'Content-Type': 'text/plain'
        });
        res.end();
      }));
    });

    if (localPort) {
      server.listen(localPort, function () {
        debug && console.log('Listening on %s', localPort);
      });
    }
  }

  _createClass(Proxy, [{
    key: 'server',
    get: function get() {
      return this[server_symbol];
    }
  }]);

  return Proxy;
}();

exports.default = Proxy;