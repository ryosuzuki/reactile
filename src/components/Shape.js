import React, { Component } from 'react'
import munkres from 'munkres-js'
import _ from 'lodash'
import { getPoints, toPath } from 'svg-shapes'
import parse from 'parse-svg-path'
import contours from 'svg-path-contours'
import simplify from 'simplify-path'
import 'createjs'

class Shape extends createjs.Shape {
  constructor() {
    super()
    this.app = app
    this.targets = []
    this.targetMarkers = []
    this.info = {
      type: 'point',
      x: 20 * this.app.offset,
      y: 20 * this.app.offset,
      variables: []
    }
    window.shape = this

    this.outline = new createjs.Shape()
    this.app.stage.addChild(this.outline)
    this.app.stage.addChild(this)

    this.init()
    this.render()
    this.move()
  }

  init() {
    this.app.updateState({ items: [this.info] })

    this.outline.graphics.clear()
    this.outline.graphics.beginStroke('#0f0')
    this.outline.graphics.setStrokeStyle(3)
    switch (this.info.type) {
      case 'circle':
        this.outline.graphics.drawCircle(0, 0, this.info.radius)
        this.outline.x = this.info.x
        this.outline.y = this.info.y
        this.svg = getPoints('circle', {
          cx: this.info.x,
          cy: this.info.y,
          r: this.info.radius
        })
        break
      case 'rect':
        this.outline.graphics.drawRect(0, 0, this.info.width, this.info.height)
        this.outline.x = this.info.x
        this.outline.y = this.info.y
        this.svg = getPoints('rect', {
          x: this.info.x,
          y: this.info.y,
          width: this.info.width,
          height: this.info.height
        })
        break
      case 'point':
        let radius = 10
        this.outline.graphics.drawCircle(0, 0, radius)
        this.outline.x = this.info.x
        this.outline.y = this.info.y
        this.svg = getPoints('circle', {
          cx: this.info.x,
          cy: this.info.y,
          r: radius,
        })
        break
      case 'triangle':
        break
      default:
        break
    }
    this.generate()
  }

  generate() {
    this.pathData = toPath(this.svg)
    this.path = parse(this.pathData)
    this.contours = contours(this.path)[0]

    this.contours = simplify.radialDistance(this.contours, 3 * this.app.offset)
    // this.outline.graphics.clear()

    this.targets = []
    for (let contour of this.contours) {
      let target = {
        x: Math.round(contour[0] / this.app.offset),
        y: Math.round(contour[1] / this.app.offset)
      }
      this.targets.push(target)
    }
    this.targets = _.uniqWith(this.targets, _.isEqual)
  }

  render() {
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

  scale(value) {
    switch (this.info.type) {
      case 'circle':
        this.info.radius *= value
        break
      case 'rect':
        this.info.width *= value
        this.info.height *= value
        break
    }
    this.init()
    this.render()
    this.move()
  }

  calculate() {
    this.distMatrix = []
    for (let pos of this.app.props.positions) {
      let distArray = []
      for (let target of this.targets) {
        let dist = Math.abs(pos.x - target.x) + Math.abs(pos.y - target.y)
        distArray.push(dist)
      }
      this.distMatrix.push(distArray)
    }
    if (!this.distMatrix.length) return
    this.ids = munkres(this.distMatrix)

    this.drawLine()
  }

  move() {
    const timer = setInterval(() => {
      this.check()
      console.log('run')
      if (!_.isEqual(this.app.props.positions, this.nextPositions)) {
        this.app.sendCommand(this.nextPositions)
      } else {
        console.log('clear')
        clearInterval(timer)
      }
    }, 100)
  }

  check() {
    this.calculate()
    this.nextPositions = _.clone(this.app.props.positions)
    for (let id of this.ids) {
      let mid = id[0]
      let tid = id[1]
      let marker = this.app.props.positions[mid]
      let target = this.targets[tid]

      let dx = marker.x - target.x
      let dy = marker.y - target.y
      let x = marker.x
      let y = marker.y
      if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) {
          x = x - 1
        }
        if (dx < 0) {
          x = x + 1
        }
      } else {
        if (dy > 0) {
          y = y - 1
        }
        if (dy < 0) {
          y = y + 1
        }
      }
      this.nextPositions[mid] = { x: x, y: y }
    }
  }

  drawLine() {
    if (!this.line) {
      this.line = new createjs.Shape()
    } else {
      this.line.graphics.clear()
    }
    this.line.graphics.setStrokeStyle(3)
    this.line.graphics.beginStroke('#0f0')
    for (let id of this.ids) {
      let pos = this.app.props.positions[id[0]]
      let target = this.targets[id[1]]
      this.line.graphics.moveTo(pos.x * this.app.offset, pos.y * this.app.offset)
      this.line.graphics.lineTo(target.x * this.app.offset, target.y * this.app.offset)
    }
    this.line.graphics.endStroke()
    this.app.stage.addChild(this.line)
    this.app.update = true
  }

}

export default Shape