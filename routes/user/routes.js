const express = require('express')
const router = express.Router()
const User = require('../../modules/userModule')

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId

router.post('/login', async (req, res) => {
    try {
        const userName = req.body.userName ? req.body.userName.toLowerCase().trim() : ''
        if (!userName) {
            return res.status(400).json({ message: "Username is missing or invalid.", status: 400 })
        }
        // const existingUser = await User.findOne({ userName: username })
        // if (existingUser) {
        //     return res.status(200).json({ message: "Users logged in successfully.", status: 200 })
        // }

        // const user = new User({ userName: username })
        // await user.save()
        // res.status(200).json({ message: "Users logged in successfully.", status: 200 })

        const filter = { userName: userName }
        const update = { userName: userName }
        const options = { upsert: true, new: true }

        const user = await User.findOneAndUpdate(filter, update, options)

        if (user) {
            return res.status(200).json({ message: "Users logged in successfully.", userId: user._id, status: 200 })
        } else {
            return res.status(500).json({ status: 500, message: 'Something went wrong' })
        }
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Something went wrong' })
    }
})

router.get('', async (req, res) => {
    try {
        const { skip = 0, limit = 10, userId } = req.query
        if (!userId || !ObjectId.isValid(userId)) {
            return res.status(400).json({ message: "userId is missing or invalid.", status: 400 })
        }
        const query = { _id: { $nin: [userId] } }
        const usersList = await User.find(query)
            .sort({ createdAt: -1 })
            .skip(parseInt(skip) || 0)
            .limit(parseInt(limit) || 10)
        const usersCount = await User.countDocuments(query)
        res.status(200).json({ usersList, usersCount, message: "Users retrive successfully.", status: 200 })
    } catch (error) {
        res.status(500).json({ status: 500, message: 'Something went wrong' })
    }
})

module.exports = router