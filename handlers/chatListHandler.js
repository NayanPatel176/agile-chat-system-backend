const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId

const ChatList = require('../modules/chatListModule')
const User = require('../modules/userModule')

const postChatListHandler = (body, isSocket) => new Promise(async (resolve, reject) => {
    try {
        const participants = body.participants
        if (!participants || !Array.isArray(participants) || participants.length < 2) {
            return reject({ message: 'Participants array must contain more than 2 values.', status: 400 })
        }

        const senderData = await User.findOne({ _id: participants[0] })
        if (!senderData) {
            return reject({ message: 'Sender data not found!', status: 404 })
        }

        const chatListPayload = {
            isGroupChat: !!body.isGroupChat,
            participants
        }
        if (isSocket) {
            chatListPayload.lastMessAt = Date.now()
        }
        if (chatListPayload.isGroupChat) {
            chatListPayload.groupName = `Group ${Math.floor(Date.now() / 1000)}`
            const chatList = new ChatList(chatListPayload);
            await chatList.save()

            const emitData = JSON.parse(JSON.stringify(chatList))
            emitData.senderName = senderData.userName
            emitData.senderId = senderData._id
            return resolve({ data: emitData, message: 'Chat created successfully.', status: 200 })
        }
        const userQuery = { _id: { $in: participants } }
        let userList = await User.find(userQuery).select('userName')
        chatListPayload.userList = userList

        const filter = chatListPayload
        const update = chatListPayload
        const options = { upsert: true, new: true }

        const chatList = await ChatList.findOneAndUpdate(filter, update, options)
        const emitData = JSON.parse(JSON.stringify(chatList))
        emitData.senderName = senderData.userName
        emitData.senderId = senderData._id
        return resolve({ data: emitData, message: 'Chat created successfully.', status: 200 })
    } catch (error) {
        return reject({ message: 'Something went wrong', status: 500 })
    }
})

const getChatListHandler = (params) => new Promise(async (resolve, reject) => {
    try {
        const { userId, skip, limit } = params
        if (!userId || !ObjectId.isValid(userId)) {
            return reject({ message: 'userId is missing or invalid.', status: 400 })
        }
        const query = { participants: { $in: [userId] } }
        const chatList = await ChatList.find(query)
            .sort({ lastMessAt: -1, createdAt: -1 })
            .skip(parseInt(skip) || 0)
            .limit(parseInt(limit) || 10)
        const chatListCount = await ChatList.countDocuments(query)
        return resolve({ chats: chatList, chatCount: chatListCount, message: 'Chat List retrive successfully.', status: 200 })
    } catch (error) {
        return reject({ status: 500, message: 'Something went wrong' })
    }
})
module.exports = { postChatListHandler, getChatListHandler }