'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.default = function () {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$forwardHost = _ref.forwardHost,
      forwardHost = _ref$forwardHost === undefined ? null : _ref$forwardHost,
      _ref$forwardPort = _ref.forwardPort,
      forwardPort = _ref$forwardPort === undefined ? null : _ref$forwardPort,
      _ref$server = _ref.server,
      server = _ref$server === undefined ? _http2.default.createServer() : _ref$server,
      _ref$redirect = _ref.redirect,
      redirect = _ref$redirect === undefined ? function (url) {
    return url;
  } : _ref$redirect,
      _ref$route = _ref.route,
      route = _ref$route === undefined ? function (path) {
    return path;
  } : _ref$route,
      _ref$localPort = _ref.localPort,
      localPort = _ref$localPort === undefined ? 7000 : _ref$localPort,
      _ref$changeOrigin = _ref.changeOrigin,
      changeOrigin = _ref$changeOrigin === undefined ? false : _ref$changeOrigin;

  server.on('request', function (req, res) {
    var url = req.url,
        method = req.method,
        headers = req.headers;

    var _Url$parse = _url2.default.parse(redirect(url) || url),
        hostname = _Url$parse.hostname,
        port = _Url$parse.port,
        path = _Url$parse.path;

    var opts = {
      protocol: 'http:',
      host: forwardHost || hostname || 'localhost',
      port: forwardPort || port || 80,
      path: route(path) || path,
      method: method,
      headers: headers
    };

    if (changeOrigin) {
      opts.headers.host = opts.host + (opts.port == 80 ? '' : ':' + opts.port);
    }

    req.pipe(_http2.default.request(opts, function (response) {
      var statusCode = response.statusCode,
          headers = response.headers;

      res.writeHead(statusCode, headers);
      response.pipe(res);
    }).on('error', function (err) {
      res.writeHead(500, err.message, {
        'Content-Type': 'text/plain'
      });
      res.end();
    }));
  });

  return new _promise2.default(function (resolve) {
    if (localPort) {
      server.listen(localPort, function () {
        resolve(server);
      });
    } else {
      resolve(server);
    }
  });
};

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }