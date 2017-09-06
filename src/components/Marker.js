
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
    // this.on('mouseup', this.onMouseUp)

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
    this.sketch.x = this.x * this.app.offset
    this.sketch.y = this.y * this.app.offset

    this.app.update = true
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

  onPressMove(event) {
    if (['constraint', 'demonstrate'].includes(this.app.state.mode)) {
      if (!this.isReference) return
    }

    this.isMoving = true
    console.log('move')
    this.sketch.x = this.app.stage.mouseX
    this.sketch.y = this.app.stage.mouseY
    this.app.update = true

    let pos = {
      x: Math.round(this.sketch.x / this.app.offset),
      y: Math.round(this.sketch.y / this.app.offset)
    }
    this.app.socket.emit('update:pos', { id: this.id, pos: pos })

    if (this.app.state.mode === '') {
      if (this.shapeId != null) {
        let items = this.app.props.items
        let info = items[this.shapeId]
        switch (info.type) {
          case 'circle':

            break
          case 'point':
            // let origin = info.variables.origin
            let x = pos.x // - origin.x
            let y = pos.y // - origin.y
            if (info.values['x']) {
              info.values['x'] = x
            }
            if (info.values['y']) {
              info.values['y'] = y
            }
            break
          default:
            break
        }
        items[this.shapeId] = info
        this.app.updateState({ items: items })


        let mapping = this.app.props.mappings.filter((mapping) => {
          let shapeIds = mapping.map(m => m.shapeId)
          return shapeIds.includes(this.shapeId)
        })[0]

        let base
        let target
        if (mapping[0].shapeId === this.shapeId) {
          base = mapping[0]
          target = mapping[1]
        } else {
          base = mapping[1]
          target = mapping[0]
        }

        console.log(target)

        let shape = this.app.shapes[target.shapeId]
        // TODO: rewrite with mapping function
        shape.info[target.name] = this[base.name] // pos[base.name] * this.app.offset
        shape.init()

      }
    }
  }


}

export default Marker