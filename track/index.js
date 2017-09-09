const cv = require('opencv');
const _ = require('lodash')

const connect = require('./connect')
const detectRect = require('./rect')
const detectMarker = require('./marker')
const warpWithRect = require('./warp')

class Track {
  constructor() {
    this.camWidth = 580 // 720;
    this.camHeight = 450 // 400;
    this.camFps = 10
    this.camInterval = 1000 / this.camFps
    this.rectThickness = 2

    this.xSize = 16 * 2
    this.ySize = 40

    this.camera = new cv.VideoCapture(1)
    this.camera.setWidth(this.camWidth)
    this.camera.setHeight(this.camHeight)

    this.buffer = null
    this.im = null
    this.ready = false

    this.index = 0
    this.rect = {}
    this.positions = []
    this.accumulate = []
    this.meanPositions = []

    this.redMin = [0, 180, 100]
    this.redMax = [100, 255, 255]
    this.blueMin = [100, 100, 150]
    this.blueMax = [120, 255, 250]
    this.whiteMin = [100, 0, 100]
    this.whiteMax = [200, 100, 255]
    this.brownMin = [156, 25, 39]
    this.brownMax = [170, 50, 200]

    this.portName = null
    this.port = null

    this.connect = connect.bind(this)
    this.detectRect = detectRect.bind(this)
    this.detectMarker = detectMarker.bind(this)
    this.warpWithRect = warpWithRect.bind(this)
  }

  start(socket) {
    this.socket = socket
    this.connect()
    let move = this.testMove.bind(this)
    // let move = this.move.bind(this)
    this.socket.on('markers:move', move)
    this.socket.on('update:pos', this.updatePos.bind(this))
    this.run()
    // this.testRun()
  }

  testMove(positions) {
    setTimeout(() => {
      console.log(positions)
      this.positions = positions
    }, 100)
  }

  move(positions) {
    // let positions = [{x: 10, y: 2}, {x: 5, y: 8}, {x:10, y:8}]
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
    this.port.write(JSON.stringify(json))
    // this.port.write(JSON.stringify(data))
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
    }, this.camInterval)
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
    }, this.camInterval)
  }

  random() {
    return Math.floor(Math.random()*40)
  }


}

module.exports = Track

