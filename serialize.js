"use strict";
var Msgpack = (function () {
    function Msgpack() {
    }
    Msgpack.prototype.pack = function (data) {
        var msgpack = require('msgpack-lite');
        return msgpack.encode(data);
    };
    Msgpack.prototype.unpack = function (data) {
        var msgpack = require('msgpack-lite');
        return msgpack.decode(data);
    };
    return Msgpack;
}());
exports.Msgpack = Msgpack;
