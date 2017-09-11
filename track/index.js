const cv = require('opencv');
const _ = require('lodash')

const config = require('./config')
const connect = require('./connect')
const detectRect = require('./rect')
const detectMarker = require('./marker')
const detectPointer = require('./pointer')
const warpWithRect = require('./warp')

class Track {
  constructor() {
    for (let key of Object.keys(config)) {
      this[key]= config[key]
    }
    this.ready = false
    this.arduinoReady = false
    this.arduinoRunning = false
    this.rect = {}
    this.positions = []
    this.init()
  }

  init() {
    this.camera = new cv.VideoCapture(0)
    this.camera.setWidth(this.camWidth)
    this.camera.setHeight(this.camHeight)
    this.cameraInterval = 1000 / this.camFps
    this.connect = connect.bind(this)
    this.detectRect = detectRect.bind(this)
    this.detectMarker = detectMarker.bind(this)
    this.detectPointer = detectPointer.bind(this)
    this.warpWithRect = warpWithRect.bind(this)
  }

  run() {
    setInterval(() => {
      this.camera.read((err, im) => {
        if (err) throw err
        this.im = im

        this.detectPointer()
        // this.detectRect()
        // if (this.ready) {
        //   this.warpWithRect()
        //   this.detectMarker()
        // }
        this.buffer = this.im.toBuffer()
        this.socket.emit('buffer', {
          buffer: this.buffer,
          rect: this.rect
        })
      })
    }, this.cameraInterval)
  }

  start(socket) {
    let connected = this.socket ? true : false
    this.socket = socket
    // let move = this.testMove.bind(this)
    this.socket.on('markers:move', this.move.bind(this))
    this.socket.on('markers:travel', this.travel.bind(this))

    this.socket.on('update:pos', this.updatePos.bind(this))
    if (!connected) {
      console.log('connect')
      this.connect()
      this.run()
      // this.testRun()
    } else {
      console.log('already connected')
    }
  }

  travel(commands) {
    let index = 0
    console.log(commands)
    const timer = setInterval(() => {
      if (!this.arduinoReady) return
      if (this.arduinoRunning) return

      let command = commands[index]
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
      commands[index] = command
      this.arduinoRunning = true
      let str = JSON.stringify(json)
      this.port.write(str)
      if (command.x && command.y) {
        index++
      }
      if (index >= commands.length) {
        console.log('clear')
        clearInterval(timer)
      }
    }, 100)
  }

  move(positions) {
    if (!this.arduinoReady) return
    if (this.arduinoRunning) return

    if (!Array.isArray(positions)) return
    console.log(positions)

    let commands = {}
    for (let pos of positions) {
      let command = commands[pos.x]
      if (!command) command = []
      command.push(pos.y)
      command = _.sortBy(command)
      commands[pos.x] = command
    }

    let ps = Object.keys(commands).map(p => parseInt(p))
    let json = {
      t: 2,
      s: ps.length,
      ps: []
    }
    for (let p of ps) {
      let ns = commands[p]
      let s = ns.length
      json.ps.push({ p: p, ns: ns, s: s })
    }
    let str = JSON.stringify(json)
    this.arduinoRunning = true
    this.port.write(str)
  }

  testMove(positions) {
    setTimeout(() => {
      console.log(positions)
      this.positions = positions
    }, 100)
  }


  updatePos(data) {
    let id = data.id
    let pos = data.pos
    this.positions[id] = pos
  }

  testRun() {
    this.positions = []
    for (let i = 0; i < 20; i++) {
      this.positions.push({
        x: this.random(),
        y: this.random()
      })
    }
    setInterval(() => {
      let positions = []
      for (let pos of this.positions) {
        let p = _.clone(pos)
        if (Math.random() < 0.2) p.x++
        if (Math.random() < 0.2) p.y++
        positions.push(p)
      }
      // this.socket.emit('markers:update', this.positions)
      this.socket.emit('markers:update', positions)
    }, this.cameraInterval)
  }

  random() {
    return Math.floor(Math.random()*40)
  }


}

module.exports = Track

