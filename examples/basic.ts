import * as tcp from '../tcp';

tcp.createServer(8080).start().api.add({
    echo: (msg, callback) => { callback(msg); },
});

tcp.createClient(8080).start().router.emit('echo', 'Hello world', (msg) => {
    console.log(msg);
});
