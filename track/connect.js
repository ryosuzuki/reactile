const SerialPort = require('serialport')
const glob = require('glob')

function connect() {
  this.portName = glob.sync('/dev/cu.usbmodem*')[0]
  if (this.portName) {
    console.log('connected to ' + this.portName)
    this.port = new SerialPort(this.portName, {
      baudrate: 9600,
      parser: SerialPort.parsers.readline('\n')
    })

    this.port.on('data', (data) => {
      console.log(data.toString())
    })
  }
}

module.exports = connect
