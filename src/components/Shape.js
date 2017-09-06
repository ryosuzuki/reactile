import munkres from 'munkres-js'
import Outline from './Outline'

class Shape {
  constructor() {
    this.app = app
    this.targets = []
    this.ids = []
    this.id = this.app.currentId

    this.type = 'point'
    this.x = 20 + 10 * this.id
    this.y = 20
    this.variables = []
    this.values = {}

    if (this.id === 0) {
      this.variables = ['x']
      this.values['x'] = this.x
    } else {
      this.variables = ['y']
      this.values['y'] = this.y
    }
    this.outline = new Outline(this)
    window.shape = this
  }

  init() {
    this.outline.init()
    this.targets = this.outline.targets
    let shapes = this.app.props.shapes
    shapes[this.id] = this
    this.app.updateState({ shapes: shapes })
    this.move()
  }

  calculate() {
    this.distMatrix = []
    for (let marker of this.app.props.markers) {
      let distArray = []
      for (let target of this.targets) {
        let dist = Math.abs(marker.x - target.x) + Math.abs(marker.y - target.y)
        if (marker.shapeId != null && marker.shapeId !== this.app.currentId) {
          dist = Infinity
        }
        distArray.push(dist)
      }
      this.distMatrix.push(distArray)
    }
    if (!this.distMatrix.length) return
    this.ids = munkres(this.distMatrix)

    this.drawLine()
  }

  move() {
    const timer = setInterval(() => {
      let res = this.check()
      let change = res.change
      let markers = res.markers
      console.log('run')
      if (change) {
        let positions = markers.map((marker) => {
          return { x: marker.x, y: marker.y }
        })
        this.app.sendPositions(positions)
      } else {
        console.log('clear')
        clearInterval(timer)
        let mids = this.ids.map(a => a[0])
        for (let id of mids) {
          let markers = this.app.props.markers
          markers[id].shapeId = this.app.currentId
          this.app.updateState({ markers: markers })
        }
      }
    }, 100)
  }

  check() {
    this.calculate()
    let change = false
    let markers = this.app.props.markers
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
        change = true
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
      this.line.graphics.moveTo(pos.x * this.app.offset, pos.y * this.app.offset)
      this.line.graphics.lineTo(target.x * this.app.offset, target.y * this.app.offset)
    }
    this.line.graphics.endStroke()
    this.app.stage.addChild(this.line)
    // this.app.update = true
  }

  initFromCanvas(info) {
    this.type = info.type
    this.x = this.convert(info.x)
    this.y = this.convert(info.y)
    this.variables = []
    switch (info.type) {
      case 'circle':
        this.radius = this.convert(info.radius)
        break
      case 'rect':
        this.width = this.convert(info.width)
        this.height = this.convert(info.height)
        break
    }
    this.init()
  }

  convert(val) {
    return Math.round(val / this.app.offset)
  }

  scale(value) {
    switch (this.type) {
      case 'circle':
        this.radius *= value
        break
      case 'rect':
        this.width *= value
        this.height *= value
        break
    }
    this.init()
  }

}

export default Shape