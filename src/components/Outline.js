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
        this.radius = this.shape.radius * this.app.offset
        this.x = this.shape.x * this.app.offsetX
        this.y = this.shape.y * this.app.offsetY
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
        this.width = this.shape.width * this.app.offsetX
        this.height = this.shape.height * this.app.offsetY
        this.x = this.shape.x * this.app.offsetX
        this.y = this.shape.y * this.app.offsetY
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
        this.x = this.shape.x * this.app.offsetX
        this.y = this.shape.y * this.app.offsetY
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
        this.points = this.shape.points.map((point) => {
          let x = (point.x-1) * this.app.offsetX
          let y = (point.y-1) * this.app.offsetY
          return [x, y]
        })
        this.graphics
        .moveTo(this.points[0][0], this.points[0][1])
        .lineTo(this.points[1][0], this.points[1][1])
        .lineTo(this.points[2][0], this.points[2][1])
        .lineTo(this.points[0][0], this.points[0][1])
        .closePath()
        this.x = this.shape.x * this.app.offsetX
        this.y = this.shape.y * this.app.offsetY
        this.regX = this.shape.x * this.app.offsetX
        this.regY = this.shape.y * this.app.offsetY
        this.svg = toPoints({
          type: 'polygon',
          points: this.points.join()
        })
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
    let original = this.contours

    this.contours = simplify.douglasPeucker(this.contours, 1)
    this.contours = simplify.radialDistance(this.contours, 5 * this.app.offset)
    this.contours = _.uniqWith(this.contours, _.isEqual)

    if (this.shape.dependent && this.shape.type === 'circle') {
      let shapeMarkers = this.app.props.markers.filter((marker) => {
        return marker.shapeId === this.shape.id
      })
      let count = shapeMarkers.length
      let limit = Math.floor(original.length / count) + 1
      this.contours = original.filter((contour, index) => {
        return (index % limit) === 0
      })
    }

    if (this.contours.length > 1) {
      let first = _.first(this.contours)
      let last = _.last(this.contours)
      let dist = Math.sqrt((first[0] - last[0])**2 + (first[1] - last[1])**2)
      if (dist < 5 * this.app.offset) {
        this.contours.splice(-1)
      }
    }

    this.targets = []
    for (let contour of this.contours) {
      if (this.shape.type === 'triangle') {
        this.targets.push({
          x: Math.round(contour[0] / this.app.offsetX) ,
          y: Math.round(contour[1] / this.app.offsetY)
        })
      } else {
        this.targets.push({
          x: Math.round(contour[0] / this.app.offsetX) - 1,
          y: Math.round(contour[1] / this.app.offsetY) - 1
        })
      }
    }




    this.app.updateState({ targets: this.targets })

    if (this.shape.type === 'rect') {
      let minX = _.min(this.targets.map(t => t.x))
      let maxX = _.max(this.targets.map(t => t.x))
      let minY = _.min(this.targets.map(t => t.y))
      let maxY = _.max(this.targets.map(t => t.y))
      if (maxX - minX > 10) {
        this.targets.push({ x: Math.round((maxX + minX)/2), y: minY })
        this.targets.push({ x: Math.round((maxX + minX)/2), y: maxY })
      }
      if (maxY - minY > 10) {
        this.targets.push({ x: minX, y: Math.round((maxY + minY)/2) })
        this.targets.push({ x: maxX, y: Math.round((maxY + minY)/2) })
      }
    }

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
      this.targetMarker.x = (target.x+1) * this.app.offsetX
      this.targetMarker.y = (target.y+1) * this.app.offsetY
      this.targetMarker.alpha = 0.3
      this.app.stage.addChild(this.targetMarker)
      this.targetMarkers.push(this.targetMarker)
    }
    this.app.update = true

    // this.calculate()
  }



}

export default Outline