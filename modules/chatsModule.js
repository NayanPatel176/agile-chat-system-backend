const mongoose = require('mongoose');

const chatsSchema = mongoose.Schema({
  chatId:{
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'chatlists'
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: 'users'
  },
  senderName: {
    type: String,
    require: true,
  },
  message: {
    type: String,
    require: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('chats', chatsSchema);
