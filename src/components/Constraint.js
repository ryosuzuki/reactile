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

    this.ov
    this.cv

  }

  check() {
    this.references = this.app.markers.filter(marker => marker.isReference)

    this.diff = null
    this.line.graphics.clear()
    if (this.references.length > 1) {
      let r0 = this.references[0]
      let r1 = this.references[1]
      this.line.graphics.setStrokeStyle(3)
      this.line.graphics.beginStroke('#00f')
      this.line.graphics.moveTo(r0.x, r0.y)
      this.line.graphics.lineTo(r1.x, r1.y)

      this.ov = {
        x: r1.origin.x - r0.origin.x,
        y: r1.origin.y - r0.origin.y
      }
      this.cv = {
        x: r1.x - r0.x,
        y: r1.y - r0.y
      }
      this.dv = {
        x: this.cv.x - this.ov.x,
        y: this.cv.y - this.ov.y
      }

      this.diff = this.calculate(this.cv, this.ov)
    }
    this.app.update = true
  }

  calculate(cv, ov) {
    let cd = this.dist(cv)
    let od = this.dist(ov)
    let angle = this.angle(cv, ov)
    return { dist: cd - od, angle: angle }
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

  calculate() {

  }

}

export default Constraint
