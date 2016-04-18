import {extend} from '../nmsg-core/util';
import * as transport from '../nmsg-core/transport';
import * as backoff from '../nmsg-core/backoff';
import * as stream from './stream';
import * as net from 'net';
import {Server, IServerOpts} from '../nmsg-core/server';
import {ISerializer} from '../nmsg-core/serialize';
import {Msgpack as Serializer} from './serialize';
import {BackoffExponential as Backoff, IBackoff} from '../nmsg-core/backoff';


export class ConnectionTcp extends transport.Connection {
    protected 'in': stream.LPDecoderStream;
    protected out:  stream.LPEncoderStream;

    setSocket(socket: net.Socket) {
        this.out = new stream.LPEncoderStream(socket);
        this.in = new stream.LPDecoderStream(socket);
        this.in.on('data', (buf: Buffer) => {
            var message = this.transport.unserialize(buf);
            this.onmessage(message);
        });
    }
    
    send(message) {
        var data = this.transport.serialize(message);
        this.out.write(data);
    }
}


export interface ITransportTcpOpts extends transport.ITransportOpts {
    host?: string;
    port?: number;
}


export class TransportTcp extends transport.Transport {

    static defaults: ITransportTcpOpts = {
        host: '127.0.0.1',
        port: 8080,
        serializer: new Serializer,
    };

    protected server: net.Server;

    ClassConnection = ConnectionTcp;

    opts: ITransportTcpOpts;

    constructor(opts: ITransportTcpOpts) {
        super(extend<any>({}, TransportTcp.defaults, opts));
    }

    start(success: backoff.TcallbackSuccess, error: backoff.TcallbackError) {
        this.server = net.createServer();

        this.server.on('connection', (socket: net.Socket) => {
            var conn = this.createConncetion() as ConnectionTcp;
            conn.setSocket(socket);
            this.onconnection(conn);
        });

        this.server.on('error', (err) => {
            this.onerror(err);
            this.server.close();
            error();
        });
        this.server.on('close', () => { this.onstop(); });

        this.server.listen({
            host: this.opts.host,
            port: this.opts.port,
        }, () => {
            this.onstart();
            success();
        });
    }

    stop() {
        this.server.close();
    }
}


export interface IcreateServerOpts {
    host?: string,
    port?: number,
    serializer?: ISerializer;
    backoff?: IBackoff;
}

export function createServer(opts: IcreateServerOpts = {}): Server {
    var myopts: IcreateServerOpts = ((typeof opts === 'number') ? {port: opts} : opts) as IcreateServerOpts;

    // Transport options.
    var topts: ITransportTcpOpts = {
        host: myopts.host || '0.0.0.0',
        port: myopts.port || 8080,
        serializer: myopts.serializer || new Serializer,
    };

    // Server options.
    var sopts: IServerOpts = {
        transport: new TransportTcp(topts),
        backoff: opts.backoff || new Backoff,
    };
    return new Server(sopts);
}
