const cv = require('opencv');
const _ = require('lodash')

const config = require('./config')
const connect = require('./connect')
const detectRect = require('./rect')
const detectMarker = require('./marker')
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
    this.warpWithRect = warpWithRect.bind(this)
  }

  start(socket) {
    let connected = this.socket ? true : false
    this.socket = socket
    // let move = this.testMove.bind(this)
    let move = this.move.bind(this)
    this.socket.on('markers:move', move)
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

  move(positions) {
    if (!this.arduinoReady) return
    if (this.arduinoRunning) return

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
    console.log(this.port.write)
    this.arduinoRunning = true
    this.port.write(str, (err, results) => {
      if (err) console.log(err)
      this.port.close(() => {
        console.log('close')
      })
    })
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

  run() {
    setInterval(() => {
      this.camera.read((err, im) => {
        if (err) throw err
        this.im = im

        this.detectRect()
        if (this.ready) {
          this.warpWithRect()
          this.detectMarker()
        }
        this.buffer = this.im.toBuffer()
        this.socket.emit('buffer', {
          buffer: this.buffer,
          rect: this.rect
        })
      })
    }, this.cameraInterval)
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

