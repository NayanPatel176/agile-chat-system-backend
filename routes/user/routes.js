const express = require('express')
const { userLoginHandler, userListHandler } = require('../../handlers/userHandler')
const router = express.Router()

router.post('/login', async (req, res) => {
    try {
        const data = await userLoginHandler(req.body)
        res.status(data.status || 500).json({ ...data })
    } catch (error) {
        res.status(error.status || 500).json({ status: error.status || 500, message: error.message || 'Something went wrong' })
    }
})

router.get('', async (req, res) => {
    try {
        const data = await userListHandler(req.query)
        res.status(data.status || 500).json({ ...data })
    } catch (error) {
        res.status(error.status || 500).json({ status: error.status || 500, message: error.message || 'Something went wrong' })
    }
})

module.exports = router