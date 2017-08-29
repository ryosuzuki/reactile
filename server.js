const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const SerialPort = require('serialport')
const app = express()
const bodyParser = require('body-parser')
const portName = '/dev/cu.usbmodem14141'
let port

app.use(bodyParser.json())
app.use('/', express.static(__dirname))
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
})

app.post('/move', (req, res) => {
  let x = req.body.x
  let y = req.body.y

  let portName = glob.sync('/dev/cu.usbmodem*')[0]
  if (!portName) {
    res.send('no portname')
    return
  }

  port = new SerialPort(portName, {
    baudrate: 9600,
    parser: SerialPort.parsers.readline('\n')
  })
  port.write()

  res.send('ok')
})

const server = http.Server(app)
server.listen(8080, () => {
  console.log('listening 8080')
})

const io = socketio(server)
const socket = require('./socket')
io.on('connection', socket)


