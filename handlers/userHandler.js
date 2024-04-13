const User = require('../modules/userModule')

const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

const userLoginHandler = (body) => new Promise(async (resolve, reject) => {
    try {
        const userName = body.userName ? body.userName.toLowerCase().trim() : ''

        if (!userName) {
            return reject({ message: "Username is missing or invalid.", status: 400 })
        }
        // const existingUser = await User.findOne({ userName: username })
        // if (existingUser) {
        // return resolve({ message: "Users logged in successfully.", status: 200 })
        // }

        // const user = new User({ userName: username })
        // await user.save()
        // return resolve({ message: "Users logged in successfully.", status: 200 })

        const filter = { userName: userName }
        const update = { userName: userName }
        const options = { upsert: true, new: true }

        const user = await User.findOneAndUpdate(filter, update, options)

        if (user) {
            return resolve({ message: "Users logged in successfully.", userId: user._id, status: 200 })
        } else {
            return resolve({ status: 500, message: 'Something went wrong' })
        }
    } catch (error) {
        return reject({ message: 'Something went wrong', status: 500 })
    }
})

const userDetailsHandler = ({ userId }) => new Promise(async (resolve, reject) => {
    try {
        if (!userId || !ObjectId.isValid(userId)) {
            return reject({ message: "userId is missing or invalid.", status: 400 })
        }
        const userDetails = await User.findOne({ _id: userId })
        if (userDetails) {
            return resolve({ message: "Users details retrived successfully.", userDetails, status: 200 })
        }

        return reject({ message: "User not found.", status: 404 })
    } catch (error) {
        return reject({ message: 'Something went wrong', status: 500 })
    }
})

const userListHandler = (params) => new Promise(async (resolve, reject) => {
    try {
        const { skip = 0, limit = 10, userId } = params
        if (!userId || !ObjectId.isValid(userId)) {
            return reject({ message: "userId is missing or invalid.", status: 400 })
        }
        const query = { _id: { $nin: [userId] } }
        const usersList = await User.find(query)
            .sort({ createdAt: -1 })
            .skip(parseInt(skip) || 0)
            .limit(parseInt(limit) || 10)
        const usersCount = await User.countDocuments(query)
        return resolve({ usersList, usersCount, message: "Users retrive successfully.", status: 200 })
    } catch (error) {
        return reject({ status: 500, message: 'Something went wrong' })
    }
})

module.exports = { userLoginHandler, userListHandler, userDetailsHandler }