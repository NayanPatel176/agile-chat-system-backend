const user = require('./user/routes')
const chat = require('./chat/routes')
const message = require('./message/routes')

module.exports = {
    user,
    chat,
    message
}