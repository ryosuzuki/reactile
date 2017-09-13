import Shape from './Shape'
import munkres from 'munkres-js'

class Constraint {
  constructor() {
    window.constraint = this
  }

  init() {
    this.app = app
    this.line = new createjs.Shape()
    this.line.alpha = 1
    this.positions = []
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
    let markers = this.app.props.markers
    // let constraints = this.positions
    // this.distMatrix = []
    // for (let marker of markers) {
    //   let distArray = []
    //   for (let pos of constraints) {
    //     let dist = Math.sqrt((marker.x-pos.x)**2+(marker.y-pos.y)**2)
    //     distArray.push(dist)
    //   }
    //   this.distMatrix.push(distArray)
    // }
    // if (!this.distMatrix.length) return
    // this.ids = munkres(this.distMatrix)

    // if (!Array.isArray(this.ids)) return
    // for (let id of this.ids) {
    //   let mid = id[0]
    //   let cid = id[1]
    //   let marker = markers[mid]
    //   let pos = constraints[cid]
    //   let dist = Math.sqrt((marker.x-pos.x)**2+(marker.y-pos.y)**2)
    //   if (dist < 2) {
    //     marker.isReference = true
    //   } else {
    //     marker.isReference = false
    //   }
    //   marker.id = mid
    //   markers[mid] = marker
    //   // marker.update() => make blue if isReference
    // }


    this.references = markers.filter(marker => marker.isReference)
    this.diff = null
    this.line.graphics.clear()
    if (this.references.length > 1) {
      this.visualize()
      this.calculate()
      let shapes = this.app.props.shapes
      let shape = shapes[this.app.currentId]
      let type = shape.type
      let variables = shape.variables
      let r0 = this.references[0]
      let r1 = this.references[1]
      switch (type) {
        case 'circle':
          variables = ['diameter']
          break
        case 'point':
          // variables.push('x')
          if (Math.abs(r0.y - r1.y) < 3) {
            variables = ['x']
          } else if (Math.abs(r0.x - r1.x) < 3) {
            variables = ['y']
          } else {
            variables = ['dist']
            shape.dist = Math.round(Math.sqrt((r1.x-r0.x)**2+(r1.y-r1.y)**2))
          }
          break
        case 'rect':
          if (Math.abs(r0.y - r1.y) < 3) {
            variables = ['width']
          } else if (Math.abs(r0.x - r1.x) < 3) {
            variables = ['height']
          } else {
            variables = ['scale']
          }
          break
        case 'triangle':
          if (Math.abs(r0.y - r1.y) > 3) {
            variables = ['angle']
          } else {
            variables = []
          }
          break
      }
      variables = _.uniq(variables)
      Object.assign(shape, { variables: variables })
      shapes[this.app.currentId] = shape
      this.app.updateState({ shapes: shapes, markers: markers })
    }
    // this.app.update = true
  }

  visualize() {
    let r0 = this.references[0]
    let r1 = this.references[1]
    this.line.graphics.setStrokeStyle(3)
    this.line.graphics.beginStroke('#66d2cd')
    this.line.graphics.moveTo((r0.x+1) * this.app.offsetX, (r0.y+1) * this.app.offsetY)
    this.line.graphics.lineTo((r1.x+1) * this.app.offsetX, (r1.y+1) * this.app.offsetY)
    this.app.update = true
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
