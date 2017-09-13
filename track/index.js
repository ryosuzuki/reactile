const cv = require('opencv');
const _ = require('lodash')

const config = require('./config')
const connect = require('./connect')
const detectRect = require('./rect')
const detectMarker = require('./marker')
const detectConstraint = require('./constraint')
const detectPointer = require('./pointer')
const detectPanel = require('./panel')
const detectPanelMarker = require('./panel-marker')
const warpWithRect = require('./warp')

class Track {
  constructor() {
    for (let key of Object.keys(config)) {
      this[key]= config[key]
    }
    this.ready = false
    this.isSimulation = false
    // this.isSimulation = true
    this.arduinoReady = false
    this.arduinoRunning = false
    this.timerFinish = true
    this.cameraInterval = 1000 / this.camFps
    this.rect = []
    this.panel = []
    this.positions = []
    this.constraints = []
    this.init()
  }

  init() {
    if (this.isSimulation) return
    this.camera = new cv.VideoCapture(0)
    this.camera.setWidth(this.camWidth)
    this.camera.setHeight(this.camHeight)
    this.connect = connect.bind(this)
    this.detectRect = detectRect.bind(this)
    this.detectMarker = detectMarker.bind(this)
    this.detectConstraint = detectConstraint.bind(this)
    this.detectPointer = detectPointer.bind(this)
    this.detectPanel = detectPanel.bind(this)
    this.detectPanelMarker = detectPanelMarker.bind(this)
    this.warpWithRect = warpWithRect.bind(this)
  }

  run() {
    setInterval(() => {
      this.camera.read((err, im) => {
        if (err) throw err
        this.im = im.copy()
        this.imPanel = im.copy()

        this.detectRect()
        if (this.ready) {
          this.warpWithRect('rect')
          this.detectPointer()
          this.detectMarker()
          this.detectConstraint()
        }

        this.detectPanel()
        if (this.panelReady) {
          this.warpWithRect('panel')
          this.detectPanelMarker()
        }

        this.buffer = this.im.toBuffer()
        this.bufferPanel = this.imPanel.toBuffer()
        this.socket.emit('buffer', {
          buffer: this.buffer,
          bufferPanel: this.bufferPanel,
          rect: this.rect,
          panel: this.panel,
        })
      })
    }, this.cameraInterval)
  }

  start(socket) {
    let connected = this.socket ? true : false
    this.socket = socket
    if (this.isSimulation) {
      this.socket.on('markers:move', this.testMove.bind(this))
      this.socket.on('markers:travel', this.testTravel.bind(this))
    } else {
      this.socket.on('markers:move', this.move.bind(this))
      this.socket.on('markers:travel', this.travel.bind(this))
    }
    // let move = this.testMove.bind(this)

    this.socket.on('update:pos', this.updatePos.bind(this))
    if (!connected) {
      console.log('connect')
      if (this.isSimulation) {
        this.testRun()
      } else {
        this.connect()
        this.run()
      }
    } else {
      console.log('already connected')
    }
  }

  travel(commands) {
    let index = 0
    console.log(commands)
    if (!commands.length) return
    this.timerFinish = false
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
      console.log(str)
      if (command.x && command.y) {
        index++
      }
      if (index >= commands.length) {
        console.log('clear')
        clearInterval(timer)
        this.timerFinish = true
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

  testTravel(commands) {
    let index = 0
    console.log(commands)
    if (!commands.length) return
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
      console.log(str)
      if (command.x && command.y) {
        index++
      }
      if (index >= commands.length) {
        console.log('clear')
        clearInterval(timer)
      }
    }, 100)
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
      this.socket.emit('markers:update', this.positions)
      // this.socket.emit('markers:update', positions)
    }, this.cameraInterval)
  }

  random() {
    return Math.floor(Math.random()*40)
  }


}

module.exports = Track

