const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const SerialPort = require('serialport')
const glob = require('glob')
const app = express()
const bodyParser = require('body-parser')
const portName = glob.sync('/dev/cu.usbmodem*')[0]
let port
if (portName) {
  port = new SerialPort(portName, {
    baudrate: 9600,
    parser: SerialPort.parsers.readline('\n')
  })
  port.on('data', (data) => {
    console.log(data.toString())
  })
}

app.use(bodyParser.json())
app.use('/', express.static(__dirname))
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
})

app.post('/move', (req, res) => {
  let data = { p: req.body.x, n: req.body.y }
  // port.write(JSON.stringify(data))
  setTimeout(() => {
    console.log(req.body)
    res.contentType('json')
    res.send({ result: 'ok' })
  }, 1000)
})

const server = http.Server(app)
server.listen(4000, () => {
  console.log('listening 4000')
})

const io = socketio(server)
const socket = require('./socket')
io.on('connection', socket)


