import ShapeDetector from 'shape-detector'


class Draw {
  constructor() {
    window.draw = this
  }

  init() {
    this.app = app
    this.drawing = false
    this.detector = new ShapeDetector(ShapeDetector.defaultShapes)

    this.line = new createjs.Shape()
    this.shape = new createjs.Shape()
    this.app.stage.addChild(this.line)
    this.app.stage.addChild(this.shape)

    this.app.stage.on('stagemousedown', this.start.bind(this))
    this.app.stage.on('stagemousemove', this.draw.bind(this))
    this.app.stage.on('stagemouseup', this.end.bind(this))
  }

  start() {
    this.drawing = true
    this.stroke = []
    this.line.graphics.clear()
    this.shape.graphics.clear()
  }

  draw(event) {
    if (!this.drawing) return

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
    this.drawing = false
    this.prev = null
    this.line.graphics.endStroke()

    if (this.stroke.length > 1) {
      this.beautify()
    }
  }

  beautify() {
    let shape = this.detector.spot(this.stroke)
    console.log(shape)

    let x = this.stroke.map(p => p.x)
    let y = this.stroke.map(p => p.y)
    let maxX = Math.max(...x)
    let minX = Math.min(...x)
    let maxY = Math.max(...y)
    let minY = Math.min(...y)

    this.shape.graphics.beginStroke('#0f0')
    this.shape.graphics.setStrokeStyle(3)

    switch (shape.pattern) {
      case 'circle':
        let radius = (maxX + maxY - minX - minY) / 4
        let center = {
          x: (maxX + minX) / 2,
          y: (maxY + minY) / 2
        }
        this.shape.graphics.drawCircle(center.x, center.y, radius)
        break

      case 'square':
        let width = maxX - minX
        let height = maxY - minY
        this.shape.graphics.drawRect(minX, minY, width, height)
      default:
        break
    }

    this.line.graphics.clear()
    this.app.update = true

  }

}

export default Draw
