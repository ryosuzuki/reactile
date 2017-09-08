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

    this.xSize = 16 * 5
    this.ySize = 40


    // this.camera = new cv.VideoCapture(1)
    // this.camera.setWidth(this.camWidth)
    // this.camera.setHeight(this.camHeight)

    this.buffer = null
    this.im = null
    this.ready = false

    this.index = 0
    this.rect = {}
    this.positions = []
    this.accumulate = []
    this.meanPositions = []

    this.redMin = [170, 128, 70]
    this.redMax = [180, 255, 255]
    this.blueMin = [100, 100, 100]
    this.blueMax = [120, 255, 200]
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
    this.socket.on('markers:move', this.testMove.bind(this))
    this.socket.on('update:pos', this.updatePos.bind(this))
    // this.run()
    this.testRun()
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
        }
        this.detectMarker()
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

  testMove(positions) {
    setTimeout(() => {
      console.log(positions)
      this.positions = positions
    }, 100)
  }

  random() {
    return Math.floor(Math.random()*40)
  }

  move(data) {
    // this.port.write(JSON.stringify(data))
  }


}

module.exports = Track

