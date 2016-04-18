"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var stream_1 = require('stream');
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
