var tcp = require('../dist/nmsg-tcp.min');

tcp.createServer(8080).start().api.add({
        echo: function(msg, callback) { callback(msg); }
});

tcp.createClient(8080).start().router.emit('echo', 'Hello world', function(msg) {
    console.log(msg);
});
