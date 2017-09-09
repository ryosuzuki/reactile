const SerialPort = require('serialport')
const glob = require('glob')
const _ = require('lodash')

const portName = glob.sync('/dev/cu.usbmodem*')[0]
if (portName) {
  console.log('connected to ' + portName)
  let port = new SerialPort(portName, {
    baudrate: 9600,
    parser: SerialPort.parsers.readline('\n')
  })

  port.on('data', (data) => {
    console.log(data.toString())
  })

  // let positions = [{x: 10, y: 2}, {x: 5, y: 8}, {x:10, y:8}]
  // sendCommands(port, positions)

  setInterval(() => {
    let positions = [{x: 10, y: 2}, {x: 5, y: 8}, {x:10, y:8},{x: 9, y: 2}, {x: 5, y: 3}, {x:10, y:4},{x: 30, y: 2}, {x: 25, y: 8}, {x:13, y:8}]
    sendCommands(port, positions)
  }, 3000)

}

function sendCommands(port, positions) {
  let commands = {}
  for (let pos of positions) {
    let command = commands[pos.x]
    if (!command) command = []
    command.push(pos.y)
    command = _.sortBy(command)
    commands[pos.x] = command
  }

  let ps = Object.keys(commands).map(p => parseInt(p))
  let json = {}
  json.s = ps.length
  json.ps = []
  for (let p of ps) {
    let ns = commands[p]
    let s = ns.length
    json.ps.push({ p: p, ns: ns, s: s })
  }
  let str = JSON.stringify(json)
  console.log(str)
  port.write(str)
}
