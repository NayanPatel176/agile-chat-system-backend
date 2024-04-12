const mongoose = require('mongoose');

const chatListSchema = mongoose.Schema({
  isGroupChat: {
    type: Boolean,
    require: true
  },
  groupName: {
    type: String,
    default: ''
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users'
  }],
  userList: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users'
    },
    userName: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastMessAt: {
    type: Date
  }
});

module.exports = mongoose.model('chatList', chatListSchema);
