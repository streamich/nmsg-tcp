import * as serialize from '../nmsg-core/serialize';


export class Msgpack implements serialize.ISerializer {
    pack(data: serialize.TUnpacked): serialize.TPacked {
        var msgpack = require('msgpack-lite');
        return msgpack.encode(data);
    }

    unpack(data: serialize.TPacked): serialize.TUnpacked {
        var msgpack = require('msgpack-lite');
        return msgpack.decode(data);
    }
}
