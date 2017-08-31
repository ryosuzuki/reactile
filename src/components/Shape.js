import React, { Component } from 'react'
import munkres from 'munkres-js'
import 'createjs'

class Shape extends createjs.Shape {
  constructor() {
    super()
    this.app = app
    this.markers = []
    this.targets = []
    window.shape = this

    this.init()
  }

  init() {
    this.markers = []
    for (let i = 0; i < 20; i++) {
      this.markers.push({
        x: this.app.random(),
        y: this.app.random()
      })
    }

    this.targets = []
    for (let i = 0; i < 20; i++) {
      this.targets.push({
        x: this.app.random(),
        y: this.app.random()
      })
    }
  }

  calculate() {
    this.distMatrix = []
    for (let marker of this.markers) {
      let distArray = []
      for (let target of this.targets) {
        let dist = Math.abs(marker.x - target.x) + Math.abs(marker.y - target.y)
        distArray.push(dist)
      }
      this.distMatrix.push(distArray)
    }

    this.ids = munkres(this.distMatrix)
    this.line = new createjs.Shape()
    this.line.graphics.setStrokeStyle(3)
    this.line.graphics.beginStroke('#0f0')
    for (let id of this.ids) {
      let marker = this.markers[id[0]]
      let target = this.targets[id[1]]
      this.line.graphics.moveTo(marker.x, marker.y)
      this.line.graphics.lineTo(target.x, target.y)
    }
    this.line.graphics.endStroke()
    this.app.stage.addChild(this.line)
    this.app.update = true

  }

  render() {
    for (let marker of this.markers) {
      this.circle = new createjs.Shape()
      this.circle.graphics.beginFill('#f00')
      this.circle.graphics.drawCircle(0, 0, 10)
      this.circle.x = marker.x
      this.circle.y = marker.y
      this.app.stage.addChild(this.circle)
    }

    for (let target of this.targets) {
      this.circle = new createjs.Shape()
      this.circle.graphics.beginFill('#00f')
      this.circle.graphics.drawCircle(0, 0, 10)
      this.circle.x = target.x
      this.circle.y = target.y
      this.app.stage.addChild(this.circle)
    }
    this.app.update = true

    this.calculate()
  }
}

export default Shape