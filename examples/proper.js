"use strict";
var tcp = require('../tcp');
// Create `nmsg-tcp` server.
var server = tcp.createServer({
    host: '0.0.0.0',
    port: 8080
});
// Server managment.
server.onerror = function (err) { console.log('Server error:', err); };
server.onstop = function () { console.log('Server stopped.'); };
server.onstart = function () { console.log('Server started.'); };
// Define your server's API.
server.api.add({
    echo: function (msg, callback) { callback(msg); },
    // You can send arbitrary amount of callbacks, even nested in responses.
    add: function (a, b, cb, cb2) {
        var res = a + b;
        cb(res);
        cb2(function (a, b, cb) {
            cb(a - b);
        });
    }
});
// Deal with each connected socket individually.
server.onsocket = function (socket) {
    // Define callbacks for each socket individually.
    // (P.S. on server, better use `server.api.add`).
    socket.router.on('hello', function () {
        console.log('Hello world');
    });
    // Push messages to the client.
    socket.router.emit('update', { isTroll: 'yes' });
};
// Start the server.
server.start();
// Create `nmsg-tcp` client.
var client = tcp.createClient({
    host: '127.0.0.1',
    port: 8080
});
// Client managment.
client.onerror = function (err) { console.log('Client error:', err); };
client.onstop = function () { console.log('Client stopped.'); };
client.onstart = function () {
    console.log('Client started.');
    // Send messages to server, after we connected.
    client.router.emit('echo', 'are u mad?', function (res) {
        console.log(res);
    });
};
// You can even send messages before we connected,
// the server will still receive them.
client.router
    .emit('hello')
    .emit('add', 1, 2, function (result) {
    console.log(result);
}, function (substract) {
    substract(8, 3, function (result) {
        console.log(result);
    });
});
// Receive messages from server.
client.router.on('update', function (data) {
    console.log('Received update:', data);
});
// Start the client.
client.start();
setTimeout(function () {
    // Stop server and client.
    server.stop();
    client.stop();
}, 1000);
