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

  let running = false
  port.on('data', (data) => {
    console.log(data)
    if (data.includes('done')) {
      console.log('ok')
      running = false
    }
  })

  // let positions = [{x: 10, y: 2}, {x: 5, y: 8}, {x:10, y:8}]
  // sendCommands(port, positions)

  setTimeout(() => {
    setInterval(() => {
      if (!running) {
        let positions = [{x: 10, y: 2}, {x: 5, y: 8}, {x:10, y:8},{x: 9, y: 2}, {x: 5, y: 3}, {x:10, y:4},{x: 30, y: 2}, {x: 25, y: 8}, {x:13, y:8}, {x: 2, y: 3}, {x:11, y:4},{x: 31, y: 20}, {x: 22, y: 11}, {x:14, y:9}]
        sendCommands(port, positions)
        running = true
      }
    }, 110)
  }, 1000)


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
  return json
}

let json = {
  "s":3,
  "ps":[
    {"p":5,"n":[8],"s":1},
    {"p":10,"n":[2,8],"s":2},
    {"p":5,"n":[8],"s":1},
    {"p":10,"n":[2,8],"s":2},
    {"p":10,"n":[2,8],"s":2},
    {"p":10,"n":[2,8],"s":2},
    {"p":10,"n":[2,8],"s":2},
    {"p":5,"n":[8],"s":1},
    {"p":10,"n":[2,8],"s":2},
    {"p":5,"n":[8],"s":1},
    {"p":10,"n":[2,8,1,1,1,1,2,3,4,5,5,6,1],"s":2},
    {"p":10,"n":[2,8],"s":2},
    {"p":10,"n":[2,8],"s":2},
    {"p":10,"n":[2,8],"s":2},
    {"p":10,"n":[2,8],"s":2},
    {"p":10,"n":[2,8],"s":2},
    {"p":10,"n":[2,8],"s":2},
    {"p":10,"n":[2,8],"s":2},
    {"p":10,"n":[2,8],"s":2},
    {"p":10,"n":[2,8],"s":2},
    {"p":10,"n":[2,8],"s":2},
    {"p":10,"n":[2,8],"s":2},
    {"p":10,"n":[2,8],"s":2},
    {"p":10,"n":[2,8],"s":2},
    {"p":10,"n":[2,8],"s":2},
    {"p":5,"n":[8],"s":1},
    {"p":10,"n":[2,8],"s":2},
    {"p":5,"n":[8],"s":1},
    {"p":10,"n":[2,8],"s":2},
    {"p":10,"n":[2,8],"s":2},
    {"p":10,"n":[2,8],"s":2}
  ]
}
