# TCP messenger for node.js processes

Implements `TCP` transport for [`nmsg`](http://www.npmjs.com/package/nmsg).

Features:

 - Server and client libraries to communicate over `TCP`.
 - Event based routing using `.on()`, `.emit()` mechanism.
 - Allows to to send callback functions in `.emit()`. See
[`nmsg-rpc`](http://www.npmjs.com/package/nmsg-rpc) package for details.
 - Exponential backoff for client and server reconnection.
 - Client can queue messages, if server temporarily unavailable.
 - Serializes messages using MsgPack.

## Usage

A basic *echo* example:

```js
import * as tcp from 'nmsg-tcp';

tcp.createServer(8080).start().api.add({
    echo: (msg, callback) => { callback(msg); },
});

tcp.createClient(8080).start().router.emit('echo', 'Hello world', (msg) => {
    console.log(msg);
});
```

*All-you-need-to-know* in one example:

```js
import * as tcp from 'nmsg-tcp';

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

    // Send messages to the server after we connected.
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
```

## Development

Publishing:

    npm run mypublish

Create distribution:

    npm run dist
    
Typing:

    npm run typing

## License

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org/>
