const { postChatListHandler } = require('./handlers/chatListHandler')
const { postMessageHandler } = require('./handlers/messagesHandler')

exports.SocketManager = function (server) {
    const io = require('socket.io')(server, {
        cors: { origin: '*' }
    })
    const groupSockets = new Map() // Map to store group IDs and sockets
    io.on('connection', (socket) => {

        socket.on('disconnect', () => {
            console.log("Disconnected")
        })

        socket.on('joinGroup', (groupId) => {
            console.log('groupId: ', groupId)
            if (!groupSockets.has(groupId)) {
                groupSockets.set(groupId, new Set())
            }
            groupSockets.get(groupId).add(socket.id)
            socket.join(groupId)
        })

        socket.on('message', async (data) => {
            const { participants = [], message } = data
            if (participants && participants.length) {
                participants.map(id => {
                    io.to(id).emit('message', message)
                })
            }
            await postMessageHandler(message)
        })

        socket.on('createChat', async (message) => {
            try {
                const { data } = await postChatListHandler(message, true)
                if (message.participants && message.participants.length) {
                    message.participants.map(participantId => {
                        io.to(participantId).emit('recievedChat', data)
                    })
                }
            } catch (error) {
                socket.emit('error', message)
            }
        })
    })
    return io
}