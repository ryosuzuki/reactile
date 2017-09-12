
class Marker {
  constructor() {
    this.app = app
    this.isReference = false
    this.isMoving = false
    this.sketch = new createjs.Shape()
    this.origin = new createjs.Shape()
    this.shapeId = null

    this.text = new createjs.Text('', '20px Arial', '#000')
    this.text.regX = 5
    this.text.regY = 10

    this.app.stage.addChild(this.origin)
    this.app.stage.addChild(this.sketch)
    this.app.stage.addChild(this.text)

    this.sketch.on('click', this.onClick.bind(this))
    this.sketch.on('pressmove', this.onPressMove.bind(this))
    this.sketchColor = this.sketch.graphics.beginFill('#f00').command
    this.originColor = this.origin.graphics.beginFill('#f00').command

    window.marker = this
  }

  update() {
    this.sketch.graphics.drawCircle(0, 0, 10)
    this.text.text = this.id
    if (this.sketch.x !== (this.x+1) * this.app.offsetX
      || this.sketch.y !== (this.y+1) * this.app.offsetY) {
      this.sketch.x = (this.x+1) * this.app.offsetX
      this.sketch.y = (this.y+1) * this.app.offsetY
      this.text.x = this.sketch.x
      this.text.y = this.sketch.y
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
    if (this.isReference) {
      this.sketchColor.style = '#00f'
      this.origin.graphics.beginFill('#f00')
      this.origin.graphics.drawCircle(0, 0, 10)
      this.origin.alpha = 0.2
      this.origin.x = this.sketch.x
      this.origin.y = this.sketch.y
    } else {
      this.sketchColor.style = '#f00'
      this.origin.graphics.clear()
    }
    this.app.update = true
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
        let minX = _.min(shape.targets.map(t => t.x))
        let maxX = _.max(shape.targets.map(t => t.x))
        let minY = _.min(shape.targets.map(t => t.y))
        let maxY = _.max(shape.targets.map(t => t.y))
        if (shape.variables.includes('width')) {
          if (this.x <= minX) shape.width = maxX - this.x
          if (this.x >= maxX) shape.width = this.x - minX
          console.log(minX, maxX)
          console.log(this.x)
        }
        if (shape.variables.includes('height')) {
          if (this.y <= minY) shape.height = maxY - this.y
          if (this.y >= maxY) shape.height = this.y - minY
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

    this.x = Math.round(this.sketch.x / this.app.offsetX)
    this.y = Math.round(this.sketch.y / this.app.offsetY)

    let pos = { x: this.x, y: this.y }
    this.app.socket.emit('update:pos', { id: this.id, pos: pos })

    if (this.app.state.mode === '') {
      this.moved()
    }
    this.isMoving = false
  }


}

export default Marker