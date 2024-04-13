const http = require('http')
const cluster = require('cluster')
const numCPUs = require('os').cpus().length
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config('./.env')

const { SocketManager } = require('./socketManager')

// mongodb connection
const main = require('./mongoDbConnection')

const app = express()
app.use(express.json())
app.use(cors())

const { user, chat, message } = require('./routes')

if (false) {
  // if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`)
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`)
    cluster.fork()
  })
} else {
  const server = http.createServer(app)
  const io = SocketManager(server)
  app.use((req, res, next) => {
    req.io = io
    next()
  })

  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - Status Code: ${res.statusCode}`)
    next()
  })

  app.use('/user', user)
  app.use('/chat', chat)
  app.use('/message', message)

  app.get('/hello', (req, res) => {
    res.status(200).json({ message: "Hello world", status: 200 })
  })

  server.listen(process.env.PORT, async () => {
    console.log("App listen on", process.env.PORT)
  })
}