
class Marker extends createjs.Shape {
  constructor() {
    super()
    this.app = app

    this.isReference = false

    this.origin = new createjs.Shape()

    this.app.stage.addChild(this.origin)
    this.app.stage.addChild(this)
    this.render()
    this.on('mousedown', this.onMouseDown)
    this.on('pressmove', this.onPressMove)

    window.marker = this
  }

  render() {
    if (this.isReference) {
      this.graphics.beginFill('#00f')
      this.graphics.drawCircle(0, 0, 10)

      this.origin.graphics.beginFill('#f00')
      this.origin.graphics.drawCircle(0, 0, 10)
      this.origin.alpha = 0.2
      this.origin.x = this.x
      this.origin.y = this.y

    } else {
      this.graphics.beginFill('#f00')
      this.graphics.drawCircle(0, 0, 10)
      this.origin.graphics.clear()
    }
    this.app.update = true
  }

  onMouseDown(event) {
    if (this.app.state.mode !== 'constraint') return
    console.log('down')
    this.isReference = !this.isReference
    this.render()
  }

  onPressMove(event) {
    if (this.app.state.mode !== 'demonstrate') return
    if (!this.isReference) return
    console.log('move')
    this.x = this.app.stage.mouseX
    this.y = this.app.stage.mouseY
    this.app.update = true

    let pos = {
      x: Math.round(this.x / this.app.offset),
      y: Math.round(this.y / this.app.offset)
    }

    this.app.socket.emit('update:pos', { id: this.id, pos: pos })

    // this.drag()
  }


}

export default Marker