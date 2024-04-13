const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const Chats = require('../modules/chatsModule')
const ChatList = require('../modules/chatListModule')
const User = require('../modules/userModule')

const getMessageHandler = ({ chatId, skip, limit, userId }) => new Promise(async (resolve, reject) => {
    try {
        if (!chatId || !ObjectId.isValid(chatId)) {
            return reject({ message: "chatId is missing or invalid.", status: 400 })
        }
        if (userId && !ObjectId.isValid(userId)) {
            return reject({ message: "userId is missing or invalid.", status: 400 })
        }
        let userData = null
        if (userId) {
            const userQuery = { _id: userId }
            userData = await User.findOne(userQuery)
        }
        const query = { chatId: chatId }
        const messages = await Chats.find(query)
            .sort({ createdAt: 1 })
            .skip(parseInt(skip) || 0)
            .limit(parseInt(limit) || 10)
        const messagesCount = await Chats.countDocuments(query)
        return resolve({ messages, messagesCount, opponentUserName: userData ? userData.userName : '', message: "Chats retrive successfully.", status: 200 })
    } catch (error) {
        return reject({ message: 'Something went wrong', status: 500 })
    }
})

const postMessageHandler = ({ chatId, senderId, message }) => new Promise(async (resolve, reject) => {
    try {
        if (!chatId || !ObjectId.isValid(chatId)) {
            return reject({ message: "chatId is missing or invalid.", status: 400 })
        }
        if (!senderId || !ObjectId.isValid(senderId)) {
            return reject({ message: "senderId is missing or invalid.", status: 400 })
        }
        if (!message || !message.trim()) {
            return reject({ message: "message is missing or invalid.", status: 400 })
        }

        const senderData = await User.findOne({ _id: senderId })
        if (!senderData) {
            return reject({ message: "Sender data not found!", status: 401 })
        }

        const chatListData = await ChatList.findOne({ _id: chatId })
        if (!chatListData) {
            return reject({ message: "Chat data not found!", status: 404 })
        }

        const chatListPayload = {
            chatId: chatId,
            senderId: senderId,
            message: message,
            senderName: senderData.userName
        }
        const chats = new Chats(chatListPayload)
        const chatData = await chats.save()

        await ChatList.findOneAndUpdate({ _id: chatId }, { lastMessAt: Date.now() })

        const emitChatData = JSON.parse(JSON.stringify(chatData))
        emitChatData.isGroupChat = chatListData.isGroupChat
        emitChatData.groupName = chatListData.groupName
        return resolve({ data: emitChatData, message: "Message send successfully.", status: 200 })
    } catch (error) {
        return reject({ message: 'Something went wrong', status: 500 })
    }
})

module.exports = { getMessageHandler, postMessageHandler }