"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var util_1 = require('../nmsg-core/util');
var transport = require('../nmsg-core/transport');
var stream = require('./stream');
var net = require('net');
var server_1 = require('../nmsg-core/server');
var serialize_1 = require('./serialize');
var backoff_1 = require('../nmsg-core/backoff');
var ConnectionTcp = (function (_super) {
    __extends(ConnectionTcp, _super);
    function ConnectionTcp() {
        _super.apply(this, arguments);
    }
    ConnectionTcp.prototype.setSocket = function (socket) {
        var _this = this;
        this.out = new stream.LPEncoderStream(socket);
        this.in = new stream.LPDecoderStream(socket);
        this.in.on('data', function (buf) {
            var message = _this.transport.unserialize(buf);
            _this.onmessage(message);
        });
    };
    ConnectionTcp.prototype.send = function (message) {
        var data = this.transport.serialize(message);
        this.out.write(data);
    };
    return ConnectionTcp;
}(transport.Connection));
exports.ConnectionTcp = ConnectionTcp;
var TransportTcp = (function (_super) {
    __extends(TransportTcp, _super);
    function TransportTcp(opts) {
        _super.call(this, util_1.extend({}, TransportTcp.defaults, opts));
        this.ClassConnection = ConnectionTcp;
    }
    TransportTcp.prototype.start = function (success, error) {
        var _this = this;
        this.server = net.createServer();
        this.server.on('connection', function (socket) {
            var conn = _this.createConncetion();
            conn.setSocket(socket);
            _this.onconnection(conn);
        });
        this.server.on('error', function (err) {
            _this.onerror(err);
            _this.server.close();
            error();
        });
        this.server.on('close', function () { _this.onstop(); });
        this.server.listen({
            host: this.opts.host,
            port: this.opts.port
        }, function () {
            _this.onstart();
            success();
        });
    };
    TransportTcp.prototype.stop = function () {
        this.server.close();
    };
    TransportTcp.defaults = {
        host: '127.0.0.1',
        port: 8080,
        serializer: new serialize_1.Msgpack
    };
    return TransportTcp;
}(transport.Transport));
exports.TransportTcp = TransportTcp;
function createServer(opts) {
    if (opts === void 0) { opts = {}; }
    var myopts = ((typeof opts === 'number') ? { port: opts } : opts);
    // Transport options.
    var topts = {
        host: myopts.host || '0.0.0.0',
        port: myopts.port || 8080,
        serializer: myopts.serializer || new serialize_1.Msgpack
    };
    // Server options.
    var sopts = {
        transport: new TransportTcp(topts),
        backoff: opts.backoff || new backoff_1.BackoffExponential
    };
    return new server_1.Server(sopts);
}
exports.createServer = createServer;
