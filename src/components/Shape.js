import React, { Component } from 'react'
import munkres from 'munkres-js'
import 'createjs'

class Shape extends createjs.Shape {
  constructor() {
    super()
    this.app = app
    this.targets = []
    window.shape = this

    // this.init()
  }

  init(contours) {
    this.target = []
    for (let contour of contours) {
      let target = {
        x: contour[0] / this.app.offset,
        y: contour[1] / this.app.offset
      }
      this.targets.push(target)
    }
  }

  render() {
    for (let target of this.targets) {
      this.circle = new createjs.Shape()
      this.circle.graphics.beginFill('#00f')
      this.circle.graphics.drawCircle(0, 0, 10)
      this.circle.x = target.x * this.app.offset
      this.circle.y = target.y * this.app.offset
      this.app.stage.addChild(this.circle)
    }
    this.app.update = true

    // this.calculate()
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

    if (this.debug) this.drawLine()
  }

  move() {
    this.calculate()
    let nextPositions = []

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
      nextPositions.push({ x: x, y: y })
    }

    this.app.sendCommand(nextPositions)
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