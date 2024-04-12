const express = require('express')
const { postMessageHandler, getMessageHandler } = require('../../handlers/messagesHandler')
const router = express.Router()

router.get('', async (req, res) => {
    try {
        const data = await getMessageHandler(req.query)
        res.status(data.status || 500).json({ ...data })
    } catch (error) {
        res.status(error.status || 500).json({ status: error.status || 500, message: error.message || 'Something went wrong' })
    }
})

router.post('', async (req, res) => {
    try {
        const data = await postMessageHandler(req.body)
        res.status(data.status || 500).json({ ...data })
    } catch (error) {
        res.status(error.status || 500).json({ status: error.status || 500, message: error.message || 'Something went wrong' })
    }
})

module.exports = router