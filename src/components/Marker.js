
class Marker {
  constructor() {
    this.app = app
    this.isReference = false
    this.isMoving = false
    this.sketch = new createjs.Shape()
    this.origin = new createjs.Shape()
    this.shapeId = null

    this.app.stage.addChild(this.origin)
    this.app.stage.addChild(this.sketch)
    this.sketch.on('click', this.onClick.bind(this))
    this.sketch.on('pressmove', this.onPressMove.bind(this))

    window.marker = this
  }

  update() {
    if (this.isReference) {
      this.sketch.graphics.beginFill('#00f')
      this.origin.graphics.beginFill('#f00')
      this.origin.graphics.drawCircle(0, 0, 10)
      this.origin.alpha = 0.2
      this.origin.x = this.sketch.x
      this.origin.y = this.sketch.y
    } else {
      this.sketch.graphics.beginFill('#f00')
      this.origin.graphics.clear()
    }

    this.sketch.graphics.drawCircle(0, 0, 10)
    if (this.sketch.x !== this.x * this.app.offset
      || this.sketch.y !== this.y * this.app.offset) {
      this.sketch.x = this.x * this.app.offset
      this.sketch.y = this.y * this.app.offset
      this.app.update = true
    }
  }

  onClick(event) {
    if (this.isMoving) {
      this.isMoving = false
      return
    }
    console.log('click')
    if (this.app.state.mode !== 'constraint') return
    this.isReference = !this.isReference
    this.update()
  }

  transform() {
    let shapes = this.app.props.shapes
    let shape = shapes[this.shapeId]
    this.app.currentId = this.shapeId
    switch (shape.type) {
      case 'circle':
        if (shape.variables.includes('radius')) {
          shape.radius = Math.round(Math.sqrt((this.x - shape.x)**2 + (this.y - shape.y)**2))
        }
        break
      case 'point':
        if (shape.variables.includes('x')) {
          shape.x = this.x
        }
        if (shape.variables.includes('y')) {
          shape.y = this.y
        }
        break
      case 'rect':
        if (shape.variables.includes('width')) {

        }
        if (shape.variables.includes('height')) {

        }
        if (shape.variables.includes('scale')) {

        }
        break
      default:
        break
    }
    shape.init()
  }

  moved() {
    if (this.shapeId == null) return
    this.transform()

    let relatedMapping = this.app.props.mappings.filter((mapping) => {
      let shapeIds = mapping.map(m => m.shapeId)
      return shapeIds.includes(this.shapeId)
    })[0]

    if (!relatedMapping) return

    let base = relatedMapping[0]
    let target = relatedMapping[1]
    if (target.shapeId === this.shapeId) {
      base = relatedMapping[1]
      target = relatedMapping[0]
    }
    let baseShape = this.app.props.shapes[base.shapeId]
    let baseVariable = base.variable
    let targetShape = this.app.props.shapes[target.shapeId]
    let targetVariable = target.variable

    // TODO: rewrite with mapping function
    targetShape[targetVariable] = baseShape[baseVariable]
    targetShape.init()
  }

  onPressMove(event) {
    if (['constraint', 'demonstrate'].includes(this.app.state.mode)) {
      if (!this.isReference) return
    }

    this.isMoving = true
    console.log('move')
    this.sketch.x = this.app.stage.mouseX
    this.sketch.y = this.app.stage.mouseY
    this.app.update = true

    this.x = Math.round(this.sketch.x / this.app.offset)
    this.y = Math.round(this.sketch.y / this.app.offset)

    let pos = { x: this.x, y: this.y }
    this.app.socket.emit('update:pos', { id: this.id, pos: pos })

    if (this.app.state.mode === '') {
      this.moved()
    }
  }


}

export default Marker