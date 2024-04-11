const express = require('express')
const router = express.Router()

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId

const ChatList = require('../../modules/chatListModule')
const User = require('../../modules/userModule')


router.get('', async (req, res) => {
    try {
        const { userId, skip, limit } = req.query
        if (!userId || !ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "userId is missing or invalid.", status: 400 })
        }
        const query = { participants: { $in: [userId] } }
        const chatList = await ChatList.find(query)
            .sort({ createdAt: -1 })
            .skip(parseInt(skip) || 0)
            .limit(parseInt(limit) || 10)
        const chatListCount = await ChatList.countDocuments(query)
        res.status(200).json({ chats: chatList, chatCount: chatListCount, message: "Chat List retrive successfully.", status: 200 })
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Something went wrong' })
    }
})

router.post('', async (req, res) => {
    try {
        const participants = req.body.participants
        if (!participants || !Array.isArray(participants) || participants.length < 2) {
            return res.status(400).json({ message: "Participants array must contain more than 2 values.", status: 400 });
        }

        const chatListPayload = {
            isGroupChat: !!req.body.isGroupChat,
            participants
        }
        if (chatListPayload.isGroupChat) {
            chatListPayload.groupName = `Group ${Math.floor(Date.now() / 1000)}`
            const chatList = new ChatList(chatListPayload);
            await chatList.save()
            return res.status(200).json({ data: chatList, message: "Chat created successfully.", status: 200 })
        }
        const userQuery = { _id: { $in: participants } }
        let userList = await User.find(userQuery).select('userName')
        chatListPayload.userList = userList

        const filter = chatListPayload
        const update = chatListPayload
        const options = { upsert: true, new: true }

        const chatList = await ChatList.findOneAndUpdate(filter, update, options)
        res.status(200).json({ data: chatList, message: "Chat created successfully.", status: 200 })
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Something went wrong' })
    }
})

module.exports = router