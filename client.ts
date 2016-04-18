import {extend} from '../nmsg-core/util';
import {TMessage} from '../nmsg-core/server';
import * as transport from '../nmsg-core/transport';
import * as backoff from '../nmsg-core/backoff';
import * as stream from './stream';
import * as net from 'net';
import {Client, IClientOpts} from '../nmsg-core/client';
import {ISerializer} from '../nmsg-core/serialize';
import {Msgpack as Serializer} from './serialize';
import {BackoffExponential as Backoff, IBackoff} from '../nmsg-core/backoff';


export interface IClientTransportTcpOpts extends transport.ITransportOpts {
    host?: string;
    port?: number;
}

export class ClientTransportTcp extends transport.ClientTransport {

    static defaults: IClientTransportTcpOpts = {
        host: '127.0.0.1',
        port: 8080,
        serializer: null,
    };

    protected socket: net.Socket;
    protected out: stream.LPEncoderStream;
    protected 'in': stream.LPDecoderStream;

    opts: IClientTransportTcpOpts;
    
    constructor(opts: IClientTransportTcpOpts = {}) {
        super(extend<any>({}, ClientTransportTcp.defaults, opts));
    }

    protected createStreams() {
        this.socket = new net.Socket;
        this.out = new stream.LPEncoderStream;
        this.in = new stream.LPDecoderStream;
        this.out.on('error', (err) => { this.onerror(err); });
        this.in.on('error', (err) => { this.onerror(err); });
    }

    start(success: backoff.TcallbackSuccess, error: backoff.TcallbackError) {
        this.createStreams();

        this.out.pipe(this.socket);
        this.socket.pipe(this.in);

        this.in.on('data', this.onMessage.bind(this));
        this.socket
            .on('error', (err) => {
                this.onerror(err);
                error();
            })
            .on('close', () => {
                this.onstop();
            })
            .connect(this.opts.port, this.opts.host, () => {
                this.onstart();
                success();
            });
    }

    stop() {
        this.socket.end();
    }

    protected onMessage(buf: Buffer) {
        var message = this.unserialize(buf);
        this.onmessage(message);
    }

    send(message: TMessage) {
        var data = this.serialize(message);
        try {
            this.out.write(data);
        } catch(err) {
            this.onerror(err);
        }
    }
}


export interface IcreateClientOpts {
    host?: string,
    port?: number,
    serializer?: ISerializer;
    backoff?: IBackoff;
    queue?: number;
}

export function createClient(opts: number|IcreateClientOpts = {}): Client {
    var myopts: IcreateClientOpts = ((typeof opts === 'number') ? {port: opts} : opts) as IcreateClientOpts;

    // Transport options.
    var topts: IClientTransportTcpOpts = {
        host: myopts.host || '127.0.0.1',
        port: myopts.port || 8080,
        serializer: myopts.serializer || new Serializer,
    };

    // Client options.
    var copts: IClientOpts = {
        transport: new ClientTransportTcp(topts),
        backoff: myopts.backoff || new Backoff,
        queue: myopts.queue || 1000,
    };
    return new Client(copts);
}