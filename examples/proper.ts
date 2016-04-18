import * as tcp from '../tcp';


// Create `nmsg-tcp` server.
var server = tcp.createServer({
    host: '0.0.0.0', // Listen to all incoming IPs.
    port: 8080,
});

// Server managment.
server.onerror  = (err) => { console.log('Server error:', err); };
server.onstop   = ()    => { console.log('Server stopped.') };
server.onstart  = ()    => { console.log('Server started.') };

// Define your server's API.
server.api.add({
    echo: (msg, callback) => { callback(msg); },
    // You can send arbitrary amount of callbacks, even nested in responses.
    add: (a, b, cb, cb2) => {
        var res = a + b;
        cb(res);
        cb2((a, b, cb) => {
            cb(a - b);
        });
    },
});

// Deal with each connected socket individually.
server.onsocket = (socket) => {

    // Define callbacks for each socket individually.
    // (P.S. on server, better use `server.api.add`).
    socket.router.on('hello', () => {
        console.log('Hello world');
    });

    // Push messages to the client.
    socket.router.emit('update', {isTroll: 'yes'});

};

// Start the server.
server.start();


// Create `nmsg-tcp` client.
var client = tcp.createClient({
    host: '127.0.0.1', // Connect to localhost.
    port: 8080,
});

// Client managment.
client.onerror  = (err) => { console.log('Client error:', err); };
client.onstop   = ()    => { console.log('Client stopped.') };
client.onstart  = ()    => {
    console.log('Client started.');

    // Send messages to server, after we connected.
    client.router.emit('echo', 'are u mad?', (res) => {
        console.log(res);
    });
};

// You can even send messages before we connected,
// the server will still receive them.
client.router
    .emit('hello')
    .emit('add', 1, 2, (result) => {
        console.log(result);
    }, (substract) => {
        substract(8, 3, (result) => {
            console.log(result);
        })
    });

// Receive messages from server.
client.router.on('update', (data) => {
    console.log('Received update:', data);
});

// Start the client.
client.start();


setTimeout(() => {
    // Stop server and client.
    server.stop();
    client.stop();
}, 1000);