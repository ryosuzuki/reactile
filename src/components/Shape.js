import munkres from 'munkres-js'
import Outline from './Outline'

class Shape {
  constructor() {
    this.app = app
    this.targets = []
    this.ids = []
    this.id = this.app.currentId

    this.type = 'point'
    this.x = 30 + 10 * this.id
    this.y = 30
    this.angle = 0
    this.scale = 1
    this.variables = []
    this.values = {}
    if (this.id === 0) {
      this.variables = ['x']
      this.values['x'] = this.x
    } else {
      this.variables = ['y']
      this.values['y'] = this.y
    }

    // this.type = 'circle'
    // this.radius = 4

    this.outline = new Outline(this)
    window.shape = this
  }

  init() {
    this.outline.init()
    this.targets = this.outline.targets
    let shapes = this.app.props.shapes
    shapes[this.id] = this
    this.app.updateState({ shapes: shapes })

    this.calculate()
    if (this.app.isSimulation) {
      this.move()
      // this.travel()
    } else {
      this.travel()
    }
  }

  calculate() {
    this.distMatrix = []
    for (let marker of this.app.props.markers) {
      let distArray = []
      for (let target of this.targets) {
        let dist = Math.abs(marker.x - target.x) + Math.abs(marker.y - target.y)
        // if (marker.shapeId != null && marker.shapeId !== this.app.currentId) {
        //   dist = Infinity
        // }
        // if (dist > 10) dist = 100
        distArray.push(dist)
      }
      this.distMatrix.push(distArray)
    }
    if (!this.distMatrix.length) return
    this.ids = munkres(this.distMatrix)
    this.drawLine()
  }

  travel() {
    let markers = this.app.props.markers
    let commands = []
    for (let id of this.ids) {
      let mid = id[0]
      let tid = id[1]
      let marker = markers[mid]
      let target = this.targets[tid]
      // let dist = Math.abs(marker.x - target.x) + Math.abs(marker.y - target.y)
      let dist = Math.sqrt((marker.x-target.x)**2 + (marker.y-target.y)**2)
      commands.push({
        from: { x: marker.x, y: marker.y },
        to: { x: target.x, y: target.y },
        dist: dist
      })
    }

    commands.sort((a, b) => {
      return b.dist - a.dist
    })
    console.log(commands)
    this.app.socket.emit('markers:travel', commands)
  }


  move() {
    const waitTime = 100
    const timer = setInterval(() => {
      let res = this.check()
      let change = res.change
      let markers = res.markers
      console.log('run')
      if (change) {
        let positions = markers
        .filter((marker) => {
          return marker.isMoving
        })
        .map((marker) => {
          return { x: marker.x, y: marker.y }
        })
        this.app.socket.emit('markers:move', positions)
      } else {
        console.log('clear')
        clearInterval(timer)
        let mids = this.ids.map(a => a[0])
        for (let id of mids) {
          let markers = this.app.props.markers
          let marker = markers[id]
          marker.shapeId = this.app.currentId
          marker.isMoving = false
          markers[id] = marker
          this.app.updateState({ markers: markers })
        }
      }
    }, waitTime)
  }

  check() {
    this.calculate()
    let change = false
    let markers = this.app.props.markers
    let changedIds = []
    for (let id of this.ids) {
      let mid = id[0]
      let tid = id[1]
      let marker = markers[mid]
      let target = this.targets[tid]

      let dx = marker.x - target.x
      let dy = marker.y - target.y
      let x = marker.x
      let y = marker.y
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
          x = x - 1
        }
        if (dx < 0) {
          x = x + 1
        }
      } else {
        if (dy > 0) {
          y = y - 1
        }
        if (dy < 0) {
          y = y + 1
        }
      }
      if (marker.x !== x || marker.y !== y) {
        marker.x = x
        marker.y = y
        marker.isMoving = true
        change = true
      } else {
        marker.isMoving = false
      }
    }
    return { change: change, markers: markers }
  }

  drawLine() {
    if (!this.line) {
      this.line = new createjs.Shape()
    } else {
      this.line.graphics.clear()
    }
    this.line.graphics.setStrokeStyle(3)
    this.line.graphics.beginStroke('#0f0')
    for (let id of this.ids) {
      let pos = this.app.props.markers[id[0]]
      let target = this.targets[id[1]]
      this.line.graphics.moveTo((pos.x+1) * this.app.offsetX, (pos.y+1) * this.app.offsetY)
      this.line.graphics.lineTo((target.x+1) * this.app.offsetX, (target.y+1) * this.app.offsetY)
    }
    this.line.graphics.endStroke()
    this.app.stage.addChild(this.line)
    this.app.update = true
  }

  initFromCanvas(info) {
    this.type = info.type
    this.variables = []
    switch (info.type) {
      case 'circle':
        this.x = Math.round(info.x / this.app.offsetX)
        this.y = Math.round(info.y / this.app.offsetY)
        this.radius = Math.round(info.radius / this.app.offset)
        break
      case 'rect':
        this.width = Math.round(info.width / this.app.offsetX)
        this.height = Math.round(info.height / this.app.offsetY)
        this.x = Math.round(info.x / this.app.offsetX) + this.width / 2
        this.y = Math.round(info.y / this.app.offsetY) + this.height / 2
        break
      case 'triangle':
        this.points = info.points.map((point) => {
          let x = Math.round(point.x  / this.app.offsetX)
          let y = Math.round(point.y  / this.app.offsetY)
          return { x: x, y: y }
        })
        this.x = Math.round(info.x / this.app.offsetX)
        this.y = Math.round(info.y / this.app.offsetY)
        console.log(this.points)
        break
    }
    this.init()
  }

}

export default Shape