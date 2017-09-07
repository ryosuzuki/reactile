import parse from 'parse-svg-path'
import contours from 'svg-path-contours'
import simplify from 'simplify-path'
import { toPoints, toPath } from 'svg-points'
import { rotate, offset, add, remove, scale } from 'points'
import _ from 'lodash'

class Outline extends createjs.Shape {
  constructor(shape) {
    super()

    this.app = app
    this.shape = shape
    this.targetMarkers = []

    this.app.stage.addChild(this)
    window.outline = this
  }

  convert(val) {
    return val * this.app.offset
  }

  init() {
    this.updateShape()
    this.generateTargets()
    this.renderTargets()
  }

  updateShape() {
    this.graphics.clear()
    this.graphics.beginStroke('#0f0')
    this.graphics.setStrokeStyle(3)

    switch (this.shape.type) {
      case 'circle':
        this.radius = this.convert(this.shape.radius)
        this.x = this.convert(this.shape.x)
        this.y = this.convert(this.shape.y)
        this.regX = 0
        this.regY = 0
        this.graphics.drawCircle(0, 0, this.radius)
        this.svg = toPoints({
          type: 'circle',
          cx: this.x,
          cy: this.y,
          r: this.radius
        })
        break
      case 'rect':
        this.width = this.convert(this.shape.width)
        this.height = this.convert(this.shape.height)
        this.x = this.convert(this.shape.x)
        this.y = this.convert(this.shape.y)
        this.regX = this.width / 2
        this.regY = this.height / 2
        this.graphics.drawRect(0, 0, this.width, this.height)
        this.svg = toPoints({
          type: 'rect',
          x: this.x,
          y: this.y,
          width: this.width,
          height: this.height
        })
        this.svg = offset(this.svg, -this.width/2, -this.height/2)
        break
      case 'point':
        this.radius = 10
        this.x = this.convert(this.shape.x)
        this.y = this.convert(this.shape.y)
        this.regX = 0
        this.regY = 0
        this.graphics.drawCircle(0, 0, this.radius)
        this.svg = toPoints({
          type: 'circle',
          cx: this.x,
          cy: this.y,
          r: this.radius,
        })
        break
      case 'triangle':
        break
      default:
        break
    }
    this.rotation = this.shape.angle
    this.scaleX = this.shape.scale
    this.scaleY = this.shape.scale
    this.svg = rotate(this.svg, this.shape.angle)
    this.svg = scale(this.svg, this.shape.scale)
  }

  generateTargets() {
    this.pathData = toPath(this.svg)
    this.path = parse(this.pathData)
    this.contours = contours(this.path)[0]

    this.contours = simplify.douglasPeucker(this.contours, 1)
    this.contours = simplify.radialDistance(this.contours, 3 * this.app.offset)
    this.contours = _.uniqWith(this.contours, _.isEqual)

    this.targets = []
    for (let contour of this.contours) {
      this.targets.push({
        x: Math.round(contour[0] / this.app.offset),
        y: Math.round(contour[1] / this.app.offset)
      })
    }

    /*
    if (this.shape.type === 'rect') {
      let minX = _.min(this.targets.map(t => t.x))
      let maxX = _.max(this.targets.map(t => t.x))
      let minY = _.min(this.targets.map(t => t.y))
      let maxY = _.max(this.targets.map(t => t.y))
      if (maxX - minX > 6) {
        this.targets.push({ x: Math.round((maxX + minX)/2), y: minY })
        this.targets.push({ x: Math.round((maxX + minX)/2), y: maxY })
      }
      if (maxY - minY > 6) {
        this.targets.push({ x: minX, y: Math.round((maxY + minY)/2) })
        this.targets.push({ x: maxX, y: Math.round((maxY + minY)/2) })
      }
    }
    */

  }

  renderTargets() {
    // this.graphics.clear()
    for (let targetMarker of this.targetMarkers) {
      this.app.stage.removeChild(targetMarker)
    }

    this.targetMarkers = []
    for (let target of this.targets) {
      this.targetMarker = new createjs.Shape()
      this.targetMarker.graphics.beginFill('#f00')
      this.targetMarker.graphics.drawCircle(0, 0, 10)
      this.targetMarker.x = target.x * this.app.offset
      this.targetMarker.y = target.y * this.app.offset
      this.targetMarker.alpha = 0.3
      this.app.stage.addChild(this.targetMarker)
      this.targetMarkers.push(this.targetMarker)
    }
    this.app.update = true

    // this.calculate()
  }



}

export default Outline