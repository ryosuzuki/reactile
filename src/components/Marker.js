
class Marker extends createjs.Shape {
  constructor() {
    super()
    this.app = app

    this.isReference = false

    this.on('mousedown', this.onMouseDown)
    this.on('pressmove', this.onPressMove)

    this.app.stage.addChild(this)
    this.render()
    window.marker = this
  }

  render() {
    if (this.isReference) {
      this.graphics.beginFill('#00f')
      this.graphics.drawCircle(0, 0, 10)
      this.origin = { x: this.x, y: this.y }
    } else {
      this.graphics.beginFill('#f00')
      this.graphics.drawCircle(0, 0, 10)
      this.origin = null
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
    // this.drag()
  }


}

export default Marker