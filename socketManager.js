const { postChatListHandler } = require('./handlers/chatListHandler');
const { postMessageHandler } = require('./handlers/messagesHandler');

exports.SocketManager = function (server) {
    const io = require('socket.io')(server, {
        cors: { origin: '*' }
    });
    io.on('connection', async (socket) => {
        socket.on('disconnect', () => {
            console.log("Disconnected");
        });

        socket.on('pushMessage', async (message) => {
            console.log('pushMessage: ', message);
            try {
                const { data } = await postMessageHandler(message)
                socket.broadcast.emit('recieveMessage', data)
            } catch (error) {
                console.log('error: ', error)
                socket.emit('error', message)
            }
        })

        socket.on('createChat', async (message) => {
            console.log('createChat: ', message);
            try {
                const { data } = await postChatListHandler(message, true)
                socket.broadcast.emit('recievedChat', data)
                socket.emit('recievedChat', data)
            } catch (error) {
                console.log('error: ', error)
                socket.emit('error', message)
            }
        })
    });
    return io
};