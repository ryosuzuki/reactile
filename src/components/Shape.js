import React, { Component } from 'react'
import 'createjs'

class Shape extends createjs.Shape {
  constructor() {
    super()
    this.app = app
    this.targets = []
    window.shape = this

    this.init()
  }

  init() {
    this.targets = []
    for (let i = 0; i < 10; i++) {
      this.targets.push({
        x: this.app.random(),
        y: this.app.random()
      })
    }
  }

  render() {
    for (let target of this.targets) {
      this.circle = new createjs.Shape()
      this.circle.graphics.beginFill('#00f')
      this.circle.graphics.drawCircle(0, 0, 10)
      this.circle.x = target.x
      this.circle.y = target.y
      this.app.stage.addChild(this.circle)
    }
    this.app.update = true
  }
}

export default Shape