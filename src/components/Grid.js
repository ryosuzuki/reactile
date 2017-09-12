
class Grid extends createjs.Shape {
  constructor() {
    super()
    this.app = app
    window.grid = this

    this.init()
  }

  init() {
    this.line = new createjs.Shape()
    this.line.graphics.setStrokeStyle(1)
    this.line.graphics.beginStroke('#fff')
    for (let i = 0; i < this.app.xSize; i++) {
      let pos = this.app.offsetX * (i + 1)
      let end = this.app.offsetX * (this.app.ySize + 1)
      this.line.graphics.moveTo(pos, 0)
      this.line.graphics.lineTo(pos, end)
    }

    for (let i = 0; i < this.app.ySize; i++) {
      let pos = this.app.offsetY * (i + 1)
      let end = this.app.offsetY * (this.app.xSize + 1)
      this.line.graphics.moveTo(0, pos)
      this.line.graphics.lineTo(end, pos)
    }
    this.line.graphics.endStroke()
  }

  render() {
    this.app.stage.addChild(this.line)
    this.app.update = true
  }

}

export default Grid