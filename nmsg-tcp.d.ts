declare module 'nmsg-tcp/stream' {
	import { Readable, Writable, Duplex, Transform } from 'stream';
	export interface IMessageEncoder {
	    encode(packet: Buffer): Buffer;
	}
	export interface IMessageDecoder {
	    add(data: Buffer): this;
	    shift(): Buffer;
	}
	export class LPEncoder implements IMessageEncoder {
	    encode(buf: Buffer): Buffer;
	}
	export class LPDecoder implements IMessageDecoder {
	    buf: Buffer;
	    add(buf: Buffer): this;
	    shift(): Buffer;
	}
	export class LPEncoderStream extends Transform {
	    encoder: LPEncoder;
	    constructor(destination?: Writable | Duplex | Transform);
	    _transform(chunk: Buffer | string, encoding: string, callback: (err?, data?) => void): void;
	}
	export class LPDecoderStream extends Transform {
	    decoder: LPDecoder;
	    constructor(source?: Readable | Duplex | Transform);
	    _transform(chunk: Buffer | string, encoding: string, callback: (err?, data?) => void): void;
	}
	export class Buffered extends Transform {
	    constructor();
	    _transform(chunk: Buffer | string, encoding: string, callback: (err?, data?) => void): void;
	}

}
declare module 'nmsg-tcp/serialize' {
	import * as serialize from 'nmsg-core/serialize';
	export class Msgpack implements serialize.ISerializer {
	    pack(data: serialize.TUnpacked): serialize.TPacked;
	    unpack(data: serialize.TPacked): serialize.TUnpacked;
	}

}
declare module 'nmsg-tcp/client' {
	import { TMessage } from 'nmsg-core/server';
	import * as transport from 'nmsg-core/transport';
	import * as backoff from 'nmsg-core/backoff';
	import * as stream from 'nmsg-tcp/stream';
	import * as net from 'net';
	import { Client } from 'nmsg-core/client';
	import { ISerializer } from 'nmsg-core/serialize';
	import { IBackoff } from 'nmsg-core/backoff';
	export interface IClientTransportTcpOpts extends transport.ITransportOpts {
	    host?: string;
	    port?: number;
	}
	export class ClientTransportTcp extends transport.ClientTransport {
	    static defaults: IClientTransportTcpOpts;
	    protected socket: net.Socket;
	    protected out: stream.LPEncoderStream;
	    protected 'in': stream.LPDecoderStream;
	    opts: IClientTransportTcpOpts;
	    constructor(opts?: IClientTransportTcpOpts);
	    protected createStreams(): void;
	    start(success: backoff.TcallbackSuccess, error: backoff.TcallbackError): void;
	    stop(): void;
	    protected onMessage(buf: Buffer): void;
	    send(message: TMessage): void;
	}
	export interface IcreateClientOpts {
	    host?: string;
	    port?: number;
	    serializer?: ISerializer;
	    backoff?: IBackoff;
	    queue?: number;
	}
	export function createClient(opts?: number | IcreateClientOpts): Client;

}
declare module 'nmsg-tcp/server' {
	import * as transport from 'nmsg-core/transport';
	import * as backoff from 'nmsg-core/backoff';
	import * as stream from 'nmsg-tcp/stream';
	import * as net from 'net';
	import { Server } from 'nmsg-core/server';
	import { ISerializer } from 'nmsg-core/serialize';
	import { IBackoff } from 'nmsg-core/backoff';
	export class ConnectionTcp extends transport.Connection {
	    protected 'in': stream.LPDecoderStream;
	    protected out: stream.LPEncoderStream;
	    setSocket(socket: net.Socket): void;
	    send(message: any): void;
	}
	export interface ITransportTcpOpts extends transport.ITransportOpts {
	    host?: string;
	    port?: number;
	}
	export class TransportTcp extends transport.Transport {
	    static defaults: ITransportTcpOpts;
	    protected server: net.Server;
	    ClassConnection: typeof ConnectionTcp;
	    opts: ITransportTcpOpts;
	    constructor(opts: ITransportTcpOpts);
	    start(success: backoff.TcallbackSuccess, error: backoff.TcallbackError): void;
	    stop(): void;
	}
	export interface IcreateServerOpts {
	    host?: string;
	    port?: number;
	    serializer?: ISerializer;
	    backoff?: IBackoff;
	}
	export function createServer(opts?: IcreateServerOpts): Server;

}
declare module 'nmsg-tcp/tcp' {
	export { createServer, IcreateServerOpts } from 'nmsg-tcp/server';
	export { createClient, IcreateClientOpts } from 'nmsg-tcp/client';

}
/// <reference path="../typings/node.d.ts" />
