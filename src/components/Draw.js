
class Draw {
  constructor() {
    window.draw = this
  }

  init() {
    this.app = app
    this.drawing = false
    this.mouse

    this.line = new createjs.Shape()
    this.app.stage.addChild(this.line)

    this.app.stage.on('stagemousedown', this.start.bind(this))
    this.app.stage.on('stagemousemove', this.draw.bind(this))
    this.app.stage.on('stagemouseup', this.end.bind(this))
  }

  start() {
    this.drawing = true
    this.history = []
    this.line.graphics.clear()
  }

  draw(event) {
    if (!this.drawing) return

    this.history.push({
      x: this.app.stage.mouseX,
      y: this.app.stage.mouseY
    })

    let prev = this.history.slice(-2)[0]
    let current = this.history.slice(-2)[1]
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
    console.log(this.history)
  }

}

export default Draw
