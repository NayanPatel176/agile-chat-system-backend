// mongoose.js
const mongoose = require('mongoose')

// MongoDB connection URI
const mongoURI = process.env.MONGO_DB_URL

// Mongoose connection options
const options = {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useCreateIndex: true,
//   useFindAndModify: false
}

// Create a Mongoose connection
mongoose.connect(mongoURI, options)

// Get the default connection
const db = mongoose.connection

// Event handlers for Mongoose connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))
db.once('open', () => {
  console.log('Connected to MongoDB')
})

// Export the Mongoose connection
module.exports = db
