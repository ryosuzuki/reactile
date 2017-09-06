const cv = require('opencv');
const _ = require('lodash')

const connect = require('./connect')
const detectRect = require('./rect')
const detectMarker = require('./marker')

class Track {
  constructor() {
    this.camWidth = 580 // 720;
    this.camHeight = 450 // 400;
    this.camFps = 10
    this.camInterval = 1000 / this.camFps
    this.rectThickness = 2

    // this.camera = new cv.VideoCapture(0)
    // this.camera.setWidth(this.camWidth)
    // this.camera.setHeight(this.camHeight)

    this.buffer = null
    this.im = null
    this.calibrating = true

    this.index = 0
    this.rect = []
    this.positions = []

    this.redMin = [170, 128, 70]
    this.redMax = [180, 255, 255]
    this.blueMin = [100, 100, 100]
    this.blueMax = [120, 255, 200]

    this.portName = null
    this.port = null

    this.connect = connect.bind(this)
    this.detectRect = detectRect.bind(this)
    this.detectMarker = detectMarker.bind(this)
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

  testRun() {
    this.positions = []
    for (let i = 0; i < 20; i++) {
      this.positions.push({
        x: this.random(),
        y: this.random()
      })
    }

    // this.positions = [{x: 24, y: 11}, {x: 21, y: 12}, {x: 19, y: 14}, {x: 18, y: 17}, {x: 18, y: 21}, {x: 20, y: 23}, {x: 24, y: 24}, {x: 27, y: 24}, {x: 29, y: 22}, {x: 31, y: 18}, {x: 30, y: 15}, {x: 28, y: 13}]

    setInterval(() => {
      this.socket.emit('markers:update', this.positions)
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

  run() {
    setInterval(() => {
      this.camera.read((err, im) => {
        if (err) throw err
        this.im = im

        this.detectRect()
        if (!this.calibrating) {
          this.detectMarker(this)
        }
        this.buffer = this.im.toBuffer()
        this.socket.emit('buffer', this.buffer)
      })
    }, this.camInterval)
  }


}

module.exports = Track

