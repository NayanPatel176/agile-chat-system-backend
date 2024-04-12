const express = require('express')
const router = express.Router()

const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const Chats = require('../../modules/chatsModule')
const ChatList = require('../../modules/chatListModule')
const User = require('../../modules/userModule')

router.get('', async (req, res) => {
    try {
        const { chatId, skip, limit, userId } = req.query
        if (!chatId || !ObjectId.isValid(chatId)) {
            return res.status(400).json({ message: "chatId is missing or invalid.", status: 400 })
        }
        if (userId && !ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "userId is missing or invalid.", status: 400 })
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
        res.status(200).json({ messages, messagesCount, opponentUserName: userData ? userData.userName : '', message: "Chats retrive successfully.", status: 200 })
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Something went wrong' })
    }
})

router.post('', async (req, res) => {
    try {
        const { chatId, senderId, message } = req.body
        if (!chatId || !ObjectId.isValid(chatId)) {
            return res.status(400).json({ message: "chatId is missing or invalid.", status: 400 })
        }
        if (!senderId || !ObjectId.isValid(senderId)) {
            return res.status(400).json({ message: "senderId is missing or invalid.", status: 400 })
        }
        if (!message || !message.trim()) {
            return res.status(400).json({ message: "message is missing or invalid.", status: 400 })
        }

        const senderData = await User.findOne({ _id: senderId })
        if (!senderData) {
            return res.status(404).json({ message: "Sender data not found!", status: 404 })
        }

        const chatListData = await ChatList.findOne({ _id: chatId })
        if (!chatListData) {
            return res.status(404).json({ message: "Chat data not found!", status: 404 })
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
        req.io.emit('pushmessage', emitChatData)
        res.status(200).json({ data: chatData, message: "Message send successfully.", status: 200 })
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Something went wrong' })
    }
})

module.exports = router