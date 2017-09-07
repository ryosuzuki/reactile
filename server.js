const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const app = express()
const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use('/', express.static(__dirname))
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
})
app.get('/camera', (req, res) => {
  res.sendFile(path.join(__dirname + '/camera.html'));
})


const server = http.Server(app)
server.listen(4000, () => {
  console.log('listening 4000')
})

const io = socketio(server)
const Track = require('./track')
const track = new Track()
io.on('connection', track.start.bind(track))


