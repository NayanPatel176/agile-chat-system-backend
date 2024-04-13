const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  userName: {
    type: String,
    unique: true,
    required: [true, 'Please enter your user name']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

module.exports = mongoose.model('users', userSchema)
