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

    this.camera = new cv.VideoCapture(0)
    this.camera.setWidth(this.camWidth)
    this.camera.setHeight(this.camHeight)

    this.buffer = null
    this.im = null
    this.calibrating = true

    this.index = 0
    this.rect = []
    this.markers = [{ x: 10, y: 10 }]

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
    this.socket.on('move', this.move)

    this.run()
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

  move(data) {
    // this.port.write(JSON.stringify(data))
    //
    // For Debugging
    setTimeout(() => {
      console.log(data)
      this.markers = [JSON.parse(data)]
    }, 100)
  }
}

module.exports = Track

