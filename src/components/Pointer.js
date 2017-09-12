
class Pointer {
  constructor() {
    this.app = app
    this.sketch = new createjs.Shape()
    this.app.stage.addChild(this.sketch)

    window.pointer = this
  }

  init() {

  }

  update(pos) {
    if (pos.x && pos.y) {
      this.sketch.graphics.beginFill('#0f0')
      this.sketch.graphics.drawCircle(0, 0, 5)
      this.sketch.x = pos.x
      this.sketch.y = pos.y
    } else {
      this.sketch.graphics.clear()
    }
    this.app.update = true

  }

}

export default Pointer