const SerialPort = require('serialport')
const glob = require('glob')
const _ = require('lodash')
const Readline = SerialPort.parsers.Readline

const portName = glob.sync('/dev/cu.usbmodem*')[0]
let running = false
let ready = false
let port = null

if (portName) {
  console.log('connected to ' + portName)
  port = new SerialPort(portName, {
    baudrate: 9600,
  })
  const parser = port.pipe(new Readline())
  parser.on('data', (data) => {
    console.log(data)
    if (data.includes('start')) {
      ready = true
    }
    if (data.includes('done')) {
      running = false
    }
  })

  let commands
  // commands = [
  // {
  //   from: { x: 70, y: 35 },
  //   to: { x: 70, y: 5 }
  // },
  // {
  //   from: { x: 70, y: 5 },
  //   to: { x: 70, y: 35 }
  // }
  // ]

  commands = [
  {
    from: { x: 78, y: 30 },
    to: { x: 67, y: 20 }
  },
  {
    from: { x: 67, y: 20 },
    to: { x: 78, y: 30 }
  }
  ]


  travel(port, commands)
  return false
}

function travel(port, commands) {
  let index = 0
  const timer = setInterval(() => {
    if (!ready) return
    if (running) return
    let command = commands[index]
  console.log(command)
    let json = {}
    if (!command.x) {
      json = {
        t: 0,
        pf: command.from.x,
        pt: command.to.x,
        n: command.from.y,
      }
      command.x = true
    } else if (!command.y) {
      json = {
        t: 1,
        p: command.to.x,
        nf: command.from.y,
        nt: command.to.y,
      }
      command.y = true
    }
    running = true
    commands[index] = command
    let str = JSON.stringify(json)
    port.write(str)
    if (command.x && command.y) {
      index++
      command.x = false
      command.y = false
      index = index % 2
    }
    if (index >= commands.length) {
      console.log('clear')
      clearInterval(timer)
      return false
    }
  }, 100)
}


function move(port, positions) {
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
  port.write(str, (err, res) => {
    if (err) console.log(err)
    console.log(res)
    port.close()
  })
  return json
}


/*
Example data structure
{ t: 0, pf: 1, pt: 10, n: 4 }
{ t: 1, p: 4, nf: 1, nt: 10 }
{ t: 2 , s: 2, ps: [{p: 1, ns: [1, 2], s: 2}, ….] }
*/

/*
let n = 38
let p1 = 54
let p2 = 63
let p3 = 70
let p4 = 77
let a = [{ x: p1, y: n }, { x: p2, y: n }, { x: p3, y: n }, { x: p4, y: n }]
let b = [{ x: p1+1, y: n }, { x: p2+1, y: n }, { x: p3+1, y: n }, { x: p4+1, y: n }]

let index = 0
setInterval(() => {
  if (ready && !running) {
    // let positions = (index % 2) ? a : b
    let positions = [{ x: 59, y: 29 }]
    move(port, positions)
    running = true
    index++
  }
}, 100)
*/

