'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.default = function () {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$httpPort = _ref.httpPort,
      httpPort = _ref$httpPort === undefined ? 80 : _ref$httpPort,
      _ref$netPort = _ref.netPort,
      netPort = _ref$netPort === undefined ? 10000 : _ref$netPort,
      _ref$maxPoolSize = _ref.maxPoolSize,
      maxPoolSize = _ref$maxPoolSize === undefined ? 100 : _ref$maxPoolSize,
      _ref$filter = _ref.filter,
      filter = _ref$filter === undefined ? function (socket) {
    return true;
  } : _ref$filter;

  var sockets = [];

  var netServer = _net2.default.createServer();
  netServer.on('connection', function (socket) {
    if (!filter(socket)) {
      socket.end();
      return;
    }

    socket.on('error', console.error);

    if (sockets.length < maxPoolSize) {
      socket.on('end', function () {
        for (var i = 0; i < sockets.length; i++) {
          if (sockets[i] === socket) {
            sockets.splice(i, 1);
            break;
          }
        }
      });
      sockets.push(socket);
    } else {
      socket.end();
    }
  });

  var httpServer = _http2.default.createServer();
  httpServer.on('connection', function (socket) {
    socket.on('error', console.error);

    if (sockets.length == 0) {
      socket.end();
      return;
    }

    var _socket_ = socket._socket_;

    if (!_socket_) {
      _socket_ = socket._socket_ = sockets.shift();
    }

    if (_socket_) {
      socket.pipe(_socket_).pipe(socket);
    } else {
      socket.end();
    }
  });

  return _promise2.default.all([new _promise2.default(function (resolve) {
    httpServer.listen(httpPort, function () {
      resolve(httpServer);
    });
  }), new _promise2.default(function (resolve) {
    netServer.listen(netPort, function () {
      resolve(netServer);
    });
  })]);
};

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }