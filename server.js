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
  console.log(req.body)
  let data = { p: req.body.x, n: req.body.y }
  // port.write(JSON.stringify(data))
  res.contentType('json')
  res.send({ result: 'ok' })
})

const server = http.Server(app)
server.listen(8080, () => {
  console.log('listening 8080')
})

const io = socketio(server)
const socket = require('./socket')
io.on('connection', socket)


