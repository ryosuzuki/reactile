import parse from 'parse-svg-path'
import contours from 'svg-path-contours'
import simplify from 'simplify-path'
import { getPoints, toPath } from 'svg-shapes'
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
        this.graphics.drawCircle(0, 0, this.radius)
        this.svg = getPoints('circle', {
          cx: this.x,
          cy: this.y,
          r: this.radius
        })
        break
      case 'rect':
        this.x = this.convert(this.shape.x)
        this.y = this.convert(this.shape.y)
        this.width = this.convert(this.shape.width)
        this.height = this.convert(this.shape.height)
        this.graphics.drawRect(0, 0, this.width, this.height)
        this.svg = getPoints('rect', {
          x: this.x,
          y: this.y,
          width: this.width,
          height: this.height
        })
        break
      case 'point':
        this.radius = 10
        this.x = this.convert(this.shape.x)
        this.y = this.convert(this.shape.y)
        this.graphics.drawCircle(0, 0, this.radius)
        this.svg = getPoints('circle', {
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
  }

  generateTargets() {
    this.pathData = toPath(this.svg)
    this.path = parse(this.pathData)
    this.contours = contours(this.path)[0]
    this.contours = simplify.radialDistance(this.contours, 3 * this.app.offset)

    this.targets = []
    for (let contour of this.contours) {
      this.targets.push({
        x: Math.round(contour[0] / this.app.offset),
        y: Math.round(contour[1] / this.app.offset)
      })
    }
    this.targets = _.uniqWith(this.targets, _.isEqual)
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