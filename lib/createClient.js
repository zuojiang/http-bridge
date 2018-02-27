'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _createProxy = require('./createProxy');

var _createProxy2 = _interopRequireDefault(_createProxy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
    var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
        _ref2$remotePort = _ref2.remotePort,
        remotePort = _ref2$remotePort === undefined ? 10000 : _ref2$remotePort,
        _ref2$remoteHost = _ref2.remoteHost,
        remoteHost = _ref2$remoteHost === undefined ? 'localhost' : _ref2$remoteHost,
        _ref2$poolSize = _ref2.poolSize,
        poolSize = _ref2$poolSize === undefined ? 20 : _ref2$poolSize,
        _ref2$confirmDelay = _ref2.confirmDelay,
        confirmDelay = _ref2$confirmDelay === undefined ? 200 : _ref2$confirmDelay,
        forwardHost = _ref2.forwardHost,
        forwardPort = _ref2.forwardPort,
        localPort = _ref2.localPort,
        route = _ref2.route,
        changeOrigin = _ref2.changeOrigin;

    var server, connect, i;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            connect = function connect() {
              var status = 0;
              return new _promise2.default(function (resolve, reject) {
                var socket = _net2.default.connect(remotePort, remoteHost, function () {
                  status = 1;
                  setTimeout(function () {
                    if (status == 1) {
                      server.emit('connection', socket);
                      socket.on('close', function () {
                        connect();
                      });
                      resolve();
                    } else {
                      process.exit();
                    }
                  }, parseInt(confirmDelay));
                });

                socket.on('error', function (err) {
                  if (err.code == 'ECONNREFUSED') {
                    console.error(err);
                    process.exit();
                  } else {
                    reject(err);
                  }
                });

                socket.once('close', function () {
                  status = 2;
                });
              });
            };

            _context.next = 3;
            return (0, _createProxy2.default)({
              forwardHost: forwardHost,
              forwardPort: forwardPort,
              localPort: localPort,
              route: route,
              changeOrigin: changeOrigin
            });

          case 3:
            server = _context.sent;
            i = 0;

          case 5:
            if (!(i < poolSize)) {
              _context.next = 11;
              break;
            }

            _context.next = 8;
            return connect();

          case 8:
            i++;
            _context.next = 5;
            break;

          case 11:
            return _context.abrupt('return', server);

          case 12:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function () {
    return _ref.apply(this, arguments);
  };
}();