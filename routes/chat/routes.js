const express = require('express')
const router = express.Router()

const { postChatListHandler, getChatListHandler } = require('../../handlers/chatListHandler')


router.get('', async (req, res) => {
    try {
        const data = await getChatListHandler(req.query)
        res.status(data.status || 500).json({ ...data })
    } catch (error) {
        res.status(error.status || 500).json({ status: error.status || 500, message: error.message || 'Something went wrong' })
    }
})

router.post('', async (req, res) => {
    try {
        const data = await postChatListHandler(req.body)
        res.status(data.status || 500).json({ ...data })
    } catch (error) {
        res.status(error.status || 500).json({ status: error.status || 500, message: error.message || 'Something went wrong' })
    }
})

module.exports = router