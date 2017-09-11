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
    if (this.app.state.mode === '') {
      console.log('click')
      shape.x = Math.round(this.app.stage.mouseX / this.app.offset)
      shape.y = Math.round(this.app.stage.mouseY / this.app.offset)
      shape.init()
    }

    if (this.app.state.mode === 'constraint') {

    }
    if (this.app.state.mode !== 'draw') return
    this.drawing = true
    this.stroke = []
    this.line.graphics.clear()
  }

  draw(event) {
    console.log(this.app.stage.mouseX, this.app.stage.mouseY)

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
    this.line.graphics.clear()
    this.app.update = true
    if (this.stroke.length < 2) return

    let detect = this.detector.spot(this.stroke)
    console.log(detect)

    let x = this.stroke.map(p => p.x)
    let y = this.stroke.map(p => p.y)
    let maxX = Math.max(...x)
    let minX = Math.min(...x)
    let maxY = Math.max(...y)
    let minY = Math.min(...y)

    // let shape = this.app.props.shapes[this.app.currentId]
    switch (detect.pattern) {
      case 'circle':
        let radius = (maxX + maxY - minX - minY) / 4
        let x = (maxX + minX) / 2
        let y = (maxY + minY) / 2
        this.app.shape.initFromCanvas({
          type: 'circle',
          radius: radius,
          x: x,
          y: y
        })
        break
      case 'square':
        let width = maxX - minX
        let height = maxY - minY
        this.app.shape.initFromCanvas({
          type: 'rect',
          x: minX,
          y: minY,
          width: width,
          height: height,
        })
        break
      default:
        break
    }
  }

}

export default Draw
