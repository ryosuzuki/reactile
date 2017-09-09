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

  let n = 38
  let p1 = 54
  let p2 = 63
  let p3 = 70
  let p4 = 77

  let a = [{ x: p1, y: n }, { x: p2, y: n }, { x: p3, y: n }, { x: p4, y: n }]
  let b = [{ x: p1+1, y: n }, { x: p2+1, y: n }, { x: p3+1, y: n }, { x: p4+1, y: n }]

  let index = 0
  setTimeout(() => {
    setInterval(() => {
      if (!running) {
        let positions = (index % 2) ? a : b
        sendCommands(port, positions)
        running = true
        index++
      }
    }, 100)
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
