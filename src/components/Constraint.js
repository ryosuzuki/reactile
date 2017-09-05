import Shape from './Shape'

class Constraint {
  constructor() {
    window.constraint = this
  }

  init() {
    this.app = app

    this.line = new createjs.Shape()
    this.line.alpha = 0.4
    this.app.stage.addChild(this.line)
  }

  run() {
    console.log('run')
    console.log(this.diff)
    if (Math.abs(this.diff.angle) > 10 && Math.abs(this.diff.dist) < 10) {
      // this.app.shape.rotate(this.diff.angle)
    }
    if (Math.abs(this.diff.angle) < 10 && Math.abs(this.diff.dist) > 10) {
      this.app.shape.scale(this.diff.scale)
    }
  }

  check() {
    this.references = this.app.markers.filter(marker => marker.isReference)
    this.diff = null
    this.line.graphics.clear()
    if (this.references.length > 1) {
      this.visualize()
      this.calculate()
      let info = this.app.props.items[this.app.currentIndex]
      let type = info.type
      let variables = info.variables
      switch (type) {
        case 'circle':
          variables.push('radius')
          break
        case 'point':
          variables.push('x')
          break
        case 'rect':
          variables.push('width')
          break
      }
      variables = _.uniq(variables)
      Object.assign(info, { variables: variables })
      this.app.updateState({ info: info })
    }
    this.app.update = true
  }

  visualize() {
    let r0 = this.references[0]
    let r1 = this.references[1]
    this.line.graphics.setStrokeStyle(3)
    this.line.graphics.beginStroke('#00f')
    this.line.graphics.moveTo(r0.x, r0.y)
    this.line.graphics.lineTo(r1.x, r1.y)
  }

  calculate() {
    let r0 = this.references[0]
    let r1 = this.references[1]
    this.ov = {
      x: r1.origin.x - r0.origin.x,
      y: r1.origin.y - r0.origin.y
    }
    this.cv = {
      x: r1.x - r0.x,
      y: r1.y - r0.y
    }

    let cd = this.dist(this.cv)
    let od = this.dist(this.ov)
    let angle = this.angle(this.cv, this.ov)
    let dist = cd - od
    let scale = cd / od
    this.diff = {
      dist: dist,
      scale: scale,
      angle: angle
    }
  }

  dist(v) {
    return Math.sqrt(v.x*v.x + v.y*v.y)
  }

  angle(v1, v2) {
    let d1 = this.dist(v1)
    let d2 = this.dist(v2)
    let dot = v1.x*v2.x + v1.y*v2.y
    let cos = dot / (d1 * d2)
    return Math.acos(cos) / Math.PI * 180
    // return Math.atan2(v2.y-v1.y, v2.x-v1.x) / Math.PI * 180
  }

}

export default Constraint
