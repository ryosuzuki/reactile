import ShapeDetector from 'shape-detector'

import Shape from './Shape'

class Draw {
  constructor() {
    window.draw = this
  }

  init() {
    this.app = app
    this.drawing = false
    this.stroke = []
    this.detector = new ShapeDetector(ShapeDetector.defaultShapes)

    this.line = new createjs.Shape()
    this.app.stage.addChild(this.line)

    this.app.stage.on('stagemousedown', this.start.bind(this))
    this.app.stage.on('stagemousemove', this.draw.bind(this))
    this.app.stage.on('stagemouseup', this.end.bind(this))
  }

  start() {
    if (this.app.state.mode !== 'draw') return
    this.drawing = true
    this.stroke = []
    this.line.graphics.clear()
  }

  draw(event) {
    if (!this.drawing) return
    console.log('stage move')

    this.stroke.push({
      x: this.app.stage.mouseX,
      y: this.app.stage.mouseY
    })

    let prev = this.stroke.slice(-2)[0]
    let current = this.stroke.slice(-2)[1]
    if (!current) return

    this.line.graphics.beginStroke('#0f0')
    this.line.graphics.setStrokeStyle(3)
    this.line.graphics.moveTo(prev.x, prev.y)
    this.line.graphics.lineTo(current.x, current.y)
    this.app.update = true
  }

  end() {
    if (!this.drawing) return
    this.drawing = false
    this.prev = null
    this.line.graphics.endStroke()
    this.beautify()
  }

  beautify() {
    if (this.stroke.length < 2) return

    let shape = this.detector.spot(this.stroke)
    console.log(shape)

    let x = this.stroke.map(p => p.x)
    let y = this.stroke.map(p => p.y)
    let maxX = Math.max(...x)
    let minX = Math.min(...x)
    let maxY = Math.max(...y)
    let minY = Math.min(...y)

    let info = {}
    switch (shape.pattern) {
      case 'circle':
        let radius = (maxX + maxY - minX - minY) / 4
        let center = {
          x: (maxX + minX) / 2,
          y: (maxY + minY) / 2
        }
        this.app.shape.info = {
          type: 'circle',
          radius: radius,
          x: center.x,
          y: center.y
        }
        break
      case 'square':
        let width = maxX - minX
        let height = maxY - minY
        this.app.shape.info = {
          type: 'rect',
          x: minX,
          y: minY,
          width: width,
          height: height
        }
        break
      default:
        break
    }

    this.line.graphics.clear()
    this.app.update = true

    this.app.shape.init()
    this.app.shape.render()
    this.app.shape.move()
  }

}

export default Draw
