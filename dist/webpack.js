/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var server_1 = __webpack_require__(1);
	exports.createServer = server_1.createServer;
	var client_1 = __webpack_require__(13);
	exports.createClient = client_1.createClient;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var util_1 = __webpack_require__(2);
	var transport = __webpack_require__(3);
	var stream = __webpack_require__(4);
	var net = __webpack_require__(6);
	var server_1 = __webpack_require__(7);
	var serialize_1 = __webpack_require__(10);
	var backoff_1 = __webpack_require__(12);
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


/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	function extend(obj1, obj2) {
	    var objs = [];
	    for (var _i = 2; _i < arguments.length; _i++) {
	        objs[_i - 2] = arguments[_i];
	    }
	    if (typeof obj2 === 'object')
	        for (var i in obj2)
	            obj1[i] = obj2[i];
	    if (objs.length)
	        return extend.apply(null, [obj1].concat(objs));
	    else
	        return obj1;
	}
	exports.extend = extend;
	function noop() { }
	exports.noop = noop;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var util_1 = __webpack_require__(2);
	var Connection = (function () {
	    function Connection() {
	        this.onmessage = util_1.noop;
	    }
	    return Connection;
	}());
	exports.Connection = Connection;
	var Transport = (function () {
	    function Transport(opts) {
	        this.opts = {
	            serializer: null
	        };
	        this.onconnection = util_1.noop;
	        this.onstart = util_1.noop;
	        this.onstop = util_1.noop;
	        this.onerror = util_1.noop;
	        this.opts = util_1.extend(this.opts, opts);
	    }
	    Transport.prototype.createConncetion = function () {
	        var connection = new this.ClassConnection;
	        connection.transport = this;
	        connection.serializer = this.opts.serializer;
	        return connection;
	    };
	    Transport.prototype.serialize = function (message) {
	        return this.opts.serializer.pack(message);
	    };
	    Transport.prototype.unserialize = function (data) {
	        return this.opts.serializer.unpack(data);
	    };
	    return Transport;
	}());
	exports.Transport = Transport;
	var ClientTransport = (function (_super) {
	    __extends(ClientTransport, _super);
	    function ClientTransport() {
	        _super.apply(this, arguments);
	        this.onmessage = util_1.noop;
	    }
	    return ClientTransport;
	}(Transport));
	exports.ClientTransport = ClientTransport;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var stream_1 = __webpack_require__(5);
	// Lenght-prefixed encoder, where each message gets prepended a 4-byte length value.
	var LPEncoder = (function () {
	    function LPEncoder() {
	    }
	    LPEncoder.prototype.encode = function (buf) {
	        var prefix = new Buffer(4);
	        prefix.writeInt32BE(buf.length, 0);
	        return Buffer.concat([prefix, buf]);
	    };
	    return LPEncoder;
	}());
	exports.LPEncoder = LPEncoder;
	var LPDecoder = (function () {
	    function LPDecoder() {
	        // Binary data stream with each packed prefixed by its length.
	        this.buf = new Buffer('');
	    }
	    LPDecoder.prototype.add = function (buf) {
	        this.buf = Buffer.concat([this.buf, buf]);
	        return this;
	    };
	    // Extract a packet if any.
	    LPDecoder.prototype.shift = function () {
	        if (this.buf.length < 5)
	            return null;
	        var length = this.buf.readInt32BE(0);
	        if (this.buf.length > length) {
	            var packet = this.buf.slice(4, length + 4);
	            this.buf = this.buf.slice(length + 4);
	            return packet;
	        }
	        else
	            return null;
	    };
	    return LPDecoder;
	}());
	exports.LPDecoder = LPDecoder;
	var LPEncoderStream = (function (_super) {
	    __extends(LPEncoderStream, _super);
	    function LPEncoderStream(destination) {
	        _super.call(this);
	        this.encoder = new LPEncoder;
	        if (destination)
	            this.pipe(destination);
	    }
	    LPEncoderStream.prototype._transform = function (chunk, encoding, callback) {
	        var buf = chunk;
	        if (typeof chunk === 'string')
	            buf = new Buffer(chunk, encoding);
	        var msg = this.encoder.encode(buf);
	        callback(null, msg);
	    };
	    return LPEncoderStream;
	}(stream_1.Transform));
	exports.LPEncoderStream = LPEncoderStream;
	// Splits stream into messages, which are prefixed by 4-byte length value.
	var LPDecoderStream = (function (_super) {
	    __extends(LPDecoderStream, _super);
	    function LPDecoderStream(source) {
	        _super.call(this);
	        this.decoder = new LPDecoder;
	        if (source)
	            source.pipe(this);
	    }
	    LPDecoderStream.prototype._transform = function (chunk, encoding, callback) {
	        var buf = chunk;
	        if (typeof chunk === 'string')
	            buf = new Buffer(chunk, encoding);
	        this.decoder.add(buf);
	        var msg;
	        while (msg = this.decoder.shift())
	            this.push(msg);
	        callback();
	    };
	    return LPDecoderStream;
	}(stream_1.Transform));
	exports.LPDecoderStream = LPDecoderStream;
	var Buffered = (function (_super) {
	    __extends(Buffered, _super);
	    function Buffered() {
	        _super.call(this);
	    }
	    Buffered.prototype._transform = function (chunk, encoding, callback) {
	        callback();
	    };
	    return Buffered;
	}(stream_1.Transform));
	exports.Buffered = Buffered;


/***/ },
/* 5 */
/***/ function(module, exports) {

	module.exports = require("stream");

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = require("net");

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var util_1 = __webpack_require__(2);
	var rpc = __webpack_require__(8);
	var Socket = (function () {
	    function Socket(connection) {
	        var _this = this;
	        this.router = new rpc.Router;
	        this.onmessage = util_1.noop;
	        this.connection = connection;
	        this.connection.onmessage = function (msg) {
	            _this.onmessage(msg, _this);
	            _this.router.onmessage(msg);
	        };
	        this.router.send = this.send.bind(this);
	    }
	    Socket.prototype.send = function (message) {
	        this.connection.send(message);
	        return this;
	    };
	    return Socket;
	}());
	exports.Socket = Socket;
	var Server = (function () {
	    function Server(opts) {
	        if (opts === void 0) { opts = {}; }
	        this.opts = {};
	        this.isStarted = false;
	        this.api = new rpc.Api;
	        this.onsocket = util_1.noop;
	        this.onstart = util_1.noop;
	        this.onstop = util_1.noop;
	        this.onerror = util_1.noop;
	        this.opts = util_1.extend(this.opts, opts);
	    }
	    Server.prototype.createSocket = function (connection) {
	        var socket = new Socket(connection);
	        socket.router.setApi(this.api);
	        return socket;
	    };
	    Server.prototype.onStart = function () {
	        this.isStarted = true;
	        this.onstart();
	    };
	    Server.prototype.onStop = function () {
	        this.isStarted = false;
	        this.onstop();
	    };
	    Server.prototype.onError = function (err) {
	        // TODO: handle various types of errors, start/stop/ reconnect logic, queue drain etc...
	        this.onerror(err);
	    };
	    Server.prototype.onConnection = function (connection) {
	        this.onsocket(this.createSocket(connection));
	    };
	    Server.prototype.tryStart = function (success, error) {
	        var transport = this.opts.transport;
	        transport.onconnection = this.onConnection.bind(this);
	        transport.onstart = this.onStart.bind(this);
	        transport.onstop = this.onStop.bind(this);
	        transport.onerror = this.onError.bind(this);
	        transport.start(success, error);
	    };
	    Server.prototype.start = function () {
	        this.opts.backoff.attempt(this.tryStart.bind(this));
	        return this;
	    };
	    Server.prototype.stop = function () {
	        this.opts.transport.stop();
	        return this;
	    };
	    return Server;
	}());
	exports.Server = Server;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var util_1 = __webpack_require__(9);
	// export interface IFrameDataBuffered {
	// b: FrameList; // B for bulk.
	// [i: number]: FrameList;
	// }
	var Frame = (function () {
	    function Frame() {
	        this.data = null;
	        this.id = 0;
	        this.event = '';
	        this.args = [];
	        this.callbacks = [];
	        this.rid = 0; // Response ID.
	        this.func = 0; // Response callback position.
	        this.timeout = Frame.timeout; // Timeout in seconds for how long to wait for callbacks.
	    }
	    Frame.getNextId = function () {
	        return Frame.id = (Frame.id % 1000000000) + 1; // Always greater than 0.
	    };
	    Frame.prototype.hasCallbacks = function () {
	        for (var _i = 0, _a = this.args; _i < _a.length; _i++) {
	            var arg = _a[_i];
	            if (typeof arg === 'function')
	                return true;
	        }
	        return false;
	    };
	    Frame.prototype.isResponse = function () {
	        return !!this.rid;
	    };
	    Frame.id = 0;
	    Frame.timeout = 5000; // Default timeout (in milliseconds), so that we don't send timeout value with every request.
	    return Frame;
	}());
	exports.Frame = Frame;
	var FrameOutgoing = (function (_super) {
	    __extends(FrameOutgoing, _super);
	    function FrameOutgoing(args, event) {
	        if (args === void 0) { args = []; }
	        if (event === void 0) { event = ''; }
	        _super.call(this);
	        this.id = Frame.getNextId();
	        this.event = event;
	        this.args = args;
	    }
	    FrameOutgoing.createResponse = function (request, cb_pos, args) {
	        var response = new FrameOutgoing(args);
	        response.rid = request.id;
	        response.func = cb_pos;
	        return response;
	    };
	    // When a response to some callback is received.
	    FrameOutgoing.prototype.processResponse = function (response) {
	        var pos = response.func;
	        var callback = this.args[pos];
	        if (typeof callback !== 'function')
	            return; // Invalid response or function already called.
	        this.args[pos] = null; // Remove the function as, we will call it now.
	        callback.apply(null, response.args);
	    };
	    FrameOutgoing.prototype.serialize = function () {
	        var data = {
	            i: this.id,
	            e: this.event
	        };
	        if (this.args.length) {
	            data.a = [];
	            var cbs = [];
	            for (var i = 0; i < this.args.length; i++) {
	                var arg = this.args[i];
	                if (typeof arg === 'function') {
	                    // data.args.push(0);  // Just fill function spots with 0, they will be ignored anyways.
	                    cbs.push(i);
	                    this.callbacks.push(arg);
	                }
	                else {
	                    data.a.push(arg);
	                    if (Frame.timeout != this.timeout)
	                        data.t = this.timeout / 1000;
	                }
	            }
	            if (cbs.length) {
	                data.c = cbs;
	            }
	        }
	        // IFrameDataResponse
	        if (this.rid) {
	            data.r = this.rid;
	            data.f = this.func;
	        }
	        this.data = data;
	        return this.data;
	    };
	    return FrameOutgoing;
	}(Frame));
	exports.FrameOutgoing = FrameOutgoing;
	var FrameIncoming = (function (_super) {
	    __extends(FrameIncoming, _super);
	    function FrameIncoming() {
	        _super.apply(this, arguments);
	    }
	    FrameIncoming.prototype.unserialize = function (data, onCallback) {
	        this.data = data;
	        // IFrameData
	        if (typeof data.i === 'number')
	            this.id = data.i;
	        else
	            throw Error('Error parsing id');
	        if (data.t) {
	            if (typeof data.t == 'number')
	                this.timeout = data.t;
	            else
	                throw Error('Error parsing timeout');
	        }
	        else
	            this.timeout = Frame.timeout;
	        this.args = [];
	        if (data.a) {
	            if (data.a instanceof Array) {
	                for (var _i = 0, _a = data.a; _i < _a.length; _i++) {
	                    var arg = _a[_i];
	                    this.args.push(arg);
	                }
	            }
	            else
	                throw Error('Error parsing arguments');
	        }
	        else
	            data.a = [];
	        this.callbacks = [];
	        if (data.c) {
	            if (!(data.c instanceof Array))
	                throw Error('Error parsing callbacks');
	            for (var _b = 0, _c = data.c; _b < _c.length; _b++) {
	                var pos = _c[_b];
	                var callback = onCallback(this, pos);
	                this.callbacks.push(callback);
	                this.args.splice(pos, 0, callback);
	            }
	        }
	        this.event = '';
	        this.rid = 0;
	        this.func = 0;
	        if (data.e) {
	            // IFrameDataInitiation
	            if (typeof data.e === 'string')
	                this.event = data.e;
	            else
	                throw Error('Error parsing event');
	        }
	        else if (data.r) {
	            // IFrameDataResponse
	            if (typeof data.r === 'number')
	                this.rid = data.r;
	            else
	                throw Error('Error parsing resposne id');
	            if (typeof data.f === 'number')
	                this.func = data.f;
	            else
	                throw Error('Error parsing reponse position');
	        }
	    };
	    return FrameIncoming;
	}(Frame));
	exports.FrameIncoming = FrameIncoming;
	var Router = (function () {
	    function Router() {
	        this.latency = 500; // Client to server latency in milliseconds, expected.
	        // List of frames (by ID) which had callbacks, we keep track of them to send back responses to callbacks, if received.
	        this.frame = {};
	        this.timer = {};
	        this.onerror = function () { };
	        this.api = null;
	        // List of subscriber functions .on()
	        // TODO:
	        // TODO:
	        // TODO:
	        // TODO: This actually cannot be a list, only one callback per event!
	        this.subs = {};
	    }
	    Router.prototype.genCallack = function (frame, pos) {
	        var _this = this;
	        var called = false;
	        return function () {
	            var args = [];
	            for (var _i = 0; _i < arguments.length; _i++) {
	                args[_i - 0] = arguments[_i];
	            }
	            if (!called) {
	                called = true;
	                _this.dispatch(FrameOutgoing.createResponse(frame, pos, args));
	            }
	            else
	                throw Error("Already called: .on(\"" + frame.event + "\") " + pos + "th arg");
	        };
	    };
	    // protected getSubList(event: string): TeventCallbackList {
	    //     if(!this.subs[event]) this.subs[event] = [];
	    //     return this.subs[event];
	    // }
	    Router.prototype.pub = function (frame) {
	        var event = frame.event, args = frame.args;
	        if (!event)
	            return;
	        if (this.onevent)
	            this.onevent(event, args);
	        var method;
	        if (this.api)
	            method = this.api.get(event);
	        if (method) {
	            method.apply(this, args); // Set this to this Router, in case it has not been bound, so method could use `this.emit(...);`
	        }
	        else {
	            // var list = this.getSubList(event);
	            // for(var sub of list) sub.apply(null, args);
	            var func = this.subs[event];
	            if (func)
	                func.apply(null, args);
	            // list = this.getSubList('*');
	            // for(var sub of list) sub.apply(null, [event, ...args]);
	            func = this.subs['*'];
	            if (func)
	                func.apply(null, [event].concat(args));
	        }
	    };
	    Router.prototype.sendData = function (data) {
	        this.send(data);
	    };
	    Router.prototype.dispatch = function (frame) {
	        var _this = this;
	        if (frame.hasCallbacks()) {
	            this.frame[frame.id] = frame;
	            // Remove this frame after some timeout, if callbacks not called.
	            this.timer[frame.id] = setTimeout(function () { delete _this.frame[frame.id]; }, frame.timeout + this.latency);
	        }
	        var data = frame.serialize();
	        // console.log('dispatch', data);
	        this.sendData(data);
	    };
	    Router.prototype.processResponse = function (frame) {
	        var request = this.frame[frame.rid];
	        if (!request)
	            return; // Cannot find the original request.
	        request.processResponse(frame);
	        // Remove the original request frame, if all callbacks processed.
	        if (!request.hasCallbacks()) {
	            // console.log(this.frame, this.timer);
	            var id = request.id;
	            delete this.frame[id];
	            var timer = this.timer[id];
	            if (timer)
	                clearTimeout(timer);
	            delete this.timer[id];
	        }
	    };
	    Router.prototype.setApi = function (api) {
	        this.api = api;
	        return this;
	    };
	    // This function is called by user.
	    Router.prototype.onmessage = function (msg) {
	        var frame = new FrameIncoming;
	        try {
	            frame.unserialize(msg, this.genCallack.bind(this));
	        }
	        catch (e) {
	            this.onerror(e);
	            return;
	        }
	        if (frame.isResponse())
	            this.processResponse(frame);
	        else
	            this.pub(frame);
	    };
	    Router.prototype.on = function (event, callback) {
	        // var list: TeventCallbackList = this.getSubList(event);
	        // list.push(callback);
	        this.subs[event] = callback;
	        return this;
	    };
	    Router.prototype.emit = function (event) {
	        var args = [];
	        for (var _i = 1; _i < arguments.length; _i++) {
	            args[_i - 1] = arguments[_i];
	        }
	        var frame = new FrameOutgoing(args, event);
	        this.dispatch(frame);
	        return this;
	    };
	    return Router;
	}());
	exports.Router = Router;
	// Same as `Router`, but buffers all frames for 5 milliseconds and then sends a list of all frames at once.
	var RouterBuffered = (function (_super) {
	    __extends(RouterBuffered, _super);
	    function RouterBuffered() {
	        _super.apply(this, arguments);
	        this.cycle = 10; // Milliseconds for how long to buffer requests.
	        this.timer = 0;
	        this.buffer = [];
	    }
	    RouterBuffered.prototype.flush = function () {
	        // var data: IFrameDataBuffered = {b: this.buffer};
	        this.send(this.buffer);
	        this.buffer = [];
	    };
	    RouterBuffered.prototype.sendData = function (data) {
	        this.buffer.push(data);
	        this.startTimer();
	    };
	    RouterBuffered.prototype.startTimer = function () {
	        var _this = this;
	        if (!this.timer) {
	            this.timer = setTimeout(function () {
	                _this.timer = 0;
	                _this.flush();
	            }, this.cycle);
	        }
	    };
	    RouterBuffered.prototype.onmessage = function (msg) {
	        // console.log('msg', msg);
	        if (typeof msg != 'object')
	            return;
	        if (msg instanceof Array) {
	            // if(!(msg.b instanceof Array)) return;
	            // for(var fmsg of msg.b) super.onmessage(fmsg);
	            for (var _i = 0, msg_1 = msg; _i < msg_1.length; _i++) {
	                var fmsg = msg_1[_i];
	                _super.prototype.onmessage.call(this, fmsg);
	            }
	        }
	        else
	            _super.prototype.onmessage.call(this, msg);
	    };
	    return RouterBuffered;
	}(Router));
	exports.RouterBuffered = RouterBuffered;
	// A collection of API functions.
	var Api = (function () {
	    function Api() {
	        this.methods = {};
	    }
	    Api.prototype.add = function (list) {
	        this.methods = util_1.extend(this.methods, list);
	        return this;
	    };
	    Api.prototype.get = function (method) {
	        return this.methods[method];
	    };
	    return Api;
	}());
	exports.Api = Api;


/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";
	function extend(obj1, obj2) {
	    var objs = [];
	    for (var _i = 2; _i < arguments.length; _i++) {
	        objs[_i - 2] = arguments[_i];
	    }
	    if (typeof obj2 === 'object')
	        for (var i in obj2)
	            obj1[i] = obj2[i];
	    if (objs.length)
	        return extend.apply(null, [obj1].concat(objs));
	    else
	        return obj1;
	}
	exports.extend = extend;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var Msgpack = (function () {
	    function Msgpack() {
	    }
	    Msgpack.prototype.pack = function (data) {
	        var msgpack = __webpack_require__(11);
	        return msgpack.encode(data);
	    };
	    Msgpack.prototype.unpack = function (data) {
	        var msgpack = __webpack_require__(11);
	        return msgpack.decode(data);
	    };
	    return Msgpack;
	}());
	exports.Msgpack = Msgpack;


/***/ },
/* 11 */
/***/ function(module, exports) {

	module.exports = require("msgpack-lite");

/***/ },
/* 12 */
/***/ function(module, exports) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var Backoff = (function () {
	    function Backoff() {
	        this.retryCount = 0;
	    }
	    Backoff.prototype.onSuccess = function () {
	        this.retryCount = 0;
	    };
	    Backoff.prototype.retry = function () {
	        this.retryCount++;
	        this.operation(this.onSuccess.bind(this), this.onError.bind(this));
	    };
	    Backoff.prototype.attempt = function (operation) {
	        this.operation = operation;
	        this.retry();
	    };
	    return Backoff;
	}());
	exports.Backoff = Backoff;
	var BackoffRetry = (function (_super) {
	    __extends(BackoffRetry, _super);
	    function BackoffRetry(max_retries) {
	        if (max_retries === void 0) { max_retries = 3; }
	        _super.call(this);
	        this.maxRetries = 3;
	        this.maxRetries = max_retries;
	    }
	    BackoffRetry.prototype.onError = function (err) {
	        if (this.retryCount < this.maxRetries)
	            this.retry();
	    };
	    return BackoffRetry;
	}(Backoff));
	exports.BackoffRetry = BackoffRetry;
	var BackoffExponential = (function (_super) {
	    __extends(BackoffExponential, _super);
	    function BackoffExponential() {
	        _super.apply(this, arguments);
	        this.minTimeout = 1000;
	        this.base = 2;
	        this.maxTimeout = 1000 * 60 * 60;
	    }
	    BackoffExponential.prototype.onError = function (err) {
	        var ms = this.minTimeout * (Math.pow(this.base, (this.retryCount - 1)));
	        if (ms < this.maxTimeout)
	            setTimeout(this.retry.bind(this), ms);
	    };
	    return BackoffExponential;
	}(Backoff));
	exports.BackoffExponential = BackoffExponential;


/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var util_1 = __webpack_require__(2);
	var transport = __webpack_require__(3);
	var stream = __webpack_require__(4);
	var net = __webpack_require__(6);
	var client_1 = __webpack_require__(14);
	var serialize_1 = __webpack_require__(10);
	var backoff_1 = __webpack_require__(12);
	var ClientTransportTcp = (function (_super) {
	    __extends(ClientTransportTcp, _super);
	    function ClientTransportTcp(opts) {
	        if (opts === void 0) { opts = {}; }
	        _super.call(this, util_1.extend({}, ClientTransportTcp.defaults, opts));
	    }
	    ClientTransportTcp.prototype.createStreams = function () {
	        var _this = this;
	        this.socket = new net.Socket;
	        this.out = new stream.LPEncoderStream;
	        this.in = new stream.LPDecoderStream;
	        this.out.on('error', function (err) { _this.onerror(err); });
	        this.in.on('error', function (err) { _this.onerror(err); });
	    };
	    ClientTransportTcp.prototype.start = function (success, error) {
	        var _this = this;
	        this.createStreams();
	        this.out.pipe(this.socket);
	        this.socket.pipe(this.in);
	        this.in.on('data', this.onMessage.bind(this));
	        this.socket
	            .on('error', function (err) {
	            _this.onerror(err);
	            error();
	        })
	            .on('close', function () {
	            _this.onstop();
	        })
	            .connect(this.opts.port, this.opts.host, function () {
	            _this.onstart();
	            success();
	        });
	    };
	    ClientTransportTcp.prototype.stop = function () {
	        this.socket.end();
	    };
	    ClientTransportTcp.prototype.onMessage = function (buf) {
	        var message = this.unserialize(buf);
	        this.onmessage(message);
	    };
	    ClientTransportTcp.prototype.send = function (message) {
	        var data = this.serialize(message);
	        try {
	            this.out.write(data);
	        }
	        catch (err) {
	            this.onerror(err);
	        }
	    };
	    ClientTransportTcp.defaults = {
	        host: '127.0.0.1',
	        port: 8080,
	        serializer: null
	    };
	    return ClientTransportTcp;
	}(transport.ClientTransport));
	exports.ClientTransportTcp = ClientTransportTcp;
	function createClient(opts) {
	    if (opts === void 0) { opts = {}; }
	    var myopts = ((typeof opts === 'number') ? { port: opts } : opts);
	    // Transport options.
	    var topts = {
	        host: myopts.host || '127.0.0.1',
	        port: myopts.port || 8080,
	        serializer: myopts.serializer || new serialize_1.Msgpack
	    };
	    // Client options.
	    var copts = {
	        transport: new ClientTransportTcp(topts),
	        backoff: myopts.backoff || new backoff_1.BackoffExponential,
	        queue: myopts.queue || 1000
	    };
	    return new client_1.Client(copts);
	}
	exports.createClient = createClient;


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var __extends = (this && this.__extends) || function (d, b) {
	    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
	    function __() { this.constructor = d; }
	    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
	};
	var util_1 = __webpack_require__(2);
	var server = __webpack_require__(7);
	var rpc = __webpack_require__(8);
	var queue_1 = __webpack_require__(15);
	var Client = (function (_super) {
	    __extends(Client, _super);
	    function Client(opts) {
	        var _this = this;
	        if (opts === void 0) { opts = {}; }
	        _super.call(this, opts);
	        this.router = new rpc.Router;
	        this.onmessage = util_1.noop;
	        this.queue = new queue_1.Queue(opts.queue);
	        this.opts.transport.onmessage = function (msg) {
	            _this.onmessage(msg);
	            _this.router.onmessage(msg);
	        };
	        this.router.send = this.send.bind(this);
	    }
	    Client.prototype.onStart = function () {
	        _super.prototype.onStart.call(this);
	        this.drainQueue();
	    };
	    Client.prototype.drainQueue = function () {
	        var msg;
	        var transport = this.opts.transport;
	        while (msg = this.queue.shift())
	            transport.send(msg);
	    };
	    Client.prototype.send = function (message) {
	        if (this.isStarted)
	            this.opts.transport.send(message);
	        else
	            this.queue.add(message);
	        return this;
	    };
	    return Client;
	}(server.Server));
	exports.Client = Client;


/***/ },
/* 15 */
/***/ function(module, exports) {

	"use strict";
	// Allows to queue outgoing messages, while transports are connecting.
	var Queue = (function () {
	    function Queue(max) {
	        if (max === void 0) { max = 1000; }
	        this.data = [];
	        this.max = max;
	    }
	    Queue.prototype.add = function (obj) {
	        this.data.push(obj);
	        if (this.data.length > this.max)
	            this.shift();
	    };
	    Queue.prototype.shift = function () {
	        return this.data.shift();
	    };
	    return Queue;
	}());
	exports.Queue = Queue;


/***/ }
/******/ ]);