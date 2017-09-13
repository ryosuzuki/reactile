const SerialPort = require('serialport')
const glob = require('glob')
const Readline = SerialPort.parsers.Readline
const _ = require('lodash')

function connect() {
  this.portName = glob.sync('/dev/cu.usbmodem*')[0]
  if (this.portName) {
    console.log('connected to ' + this.portName)
    this.port = new SerialPort(this.portName, {
      baudrate: 9600,
    })

    this.parser = this.port.pipe(new Readline())
    this.parser.on('data', (data) => {
      console.log(data)
      if (data.includes('start')) {
        this.arduinoReady = true
      }
      if (data.includes('done')) {
        this.arduinoRunning = false
        if (this.timerFinish) {
          console.log('all done')
          this.socket.emit('arduino:finish', true)
        }
      }
      this.socket.emit('arduino:log', data)
    })
  }
}

module.exports = connect
