exports.SocketManager = function (server) {
    const io = require('socket.io')(server, {
        cors: {origin : '*'}
      });
    io.on('connection', async (socket) => {
        socket.on('disconnect', () => {
            console.log("Disconnected");
        });

        // socket.on('sendmessage', (data) => {
        // })
    });
    return io
};