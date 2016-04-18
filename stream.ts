import {Readable, Writable, Duplex, Transform} from 'stream';


// Encode data into messages, which will be put in stream and later decoded into messages back.
export interface IMessageEncoder {
    encode(packet: Buffer): Buffer;
}


export interface IMessageDecoder {
    // Add data to packet decoder.
    add(data: Buffer): this;

    // Extract one packet from data, if any, otherwise null.
    shift(): Buffer;
}


// Lenght-prefixed encoder, where each message gets prepended a 4-byte length value.
export class LPEncoder implements IMessageEncoder {
    encode(buf: Buffer): Buffer {
        var prefix = new Buffer(4);
        prefix.writeInt32BE(buf.length, 0);
        return Buffer.concat([prefix, buf]);
    }
}


export class LPDecoder implements IMessageDecoder {

    // Binary data stream with each packed prefixed by its length.
    buf: Buffer = new Buffer('');

    add(buf: Buffer): this {
        this.buf = Buffer.concat([this.buf, buf]);
        return this;
    }

    // Extract a packet if any.
    shift(): Buffer {
        if(this.buf.length < 5) return null;

        var length = this.buf.readInt32BE(0);
        if(this.buf.length > length) {
            var packet = this.buf.slice(4, length + 4);
            this.buf = this.buf.slice(length + 4);
            return packet;
        } else return null;
    }
}


export class LPEncoderStream extends Transform {

    encoder: LPEncoder = new LPEncoder;

    constructor(destination?: Writable | Duplex | Transform) {
        super();
        if(destination) this.pipe(destination);
    }

    _transform(chunk: Buffer|string, encoding: string, callback: (err?, data?) => void) {
        var buf = chunk as Buffer;
        if(typeof chunk === 'string') buf = new Buffer(chunk, encoding);

        var msg = this.encoder.encode(buf);
        callback(null, msg);
    }
}


// Splits stream into messages, which are prefixed by 4-byte length value.
export class LPDecoderStream extends Transform {

    decoder: LPDecoder = new LPDecoder;

    constructor(source?: Readable | Duplex | Transform) {
        super();
        if(source) source.pipe(this);
    }

    _transform(chunk: Buffer|string, encoding: string, callback: (err?, data?) => void) {
        var buf = chunk as Buffer;
        if(typeof chunk === 'string') buf = new Buffer(chunk, encoding);

        this.decoder.add(buf);

        var msg;
        while(msg = this.decoder.shift()) this.push(msg);

        callback();
    }
}


export class Buffered extends Transform {

    constructor() {
        super();
    }

    _transform(chunk: Buffer|string, encoding: string, callback: (err?, data?) => void) {
        callback();
    }

}
