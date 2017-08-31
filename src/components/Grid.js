import React, { Component } from 'react'
import 'createjs'

class Grid extends createjs.Shape {
  constructor() {
    super()
    this.app = app
    window.grid = this

    this.init()
  }

  init() {
    this.line = new createjs.Shape()
    this.line.graphics.setStrokeStyle(1)
    this.line.graphics.beginStroke('#000')
    for (let i = 0; i < this.app.pSize; i++) {
      let pos = this.app.offset * (i + 1)
      let end = this.app.offset * (this.app.pSize + 1)
      this.line.graphics.moveTo(pos, 0)
      this.line.graphics.lineTo(pos, end)
    }

    for (let i = 0; i < this.app.nSize; i++) {
      let pos = this.app.offset * (i + 1)
      let end = this.app.offset * (this.app.nSize + 1)
      this.line.graphics.moveTo(0, pos)
      this.line.graphics.lineTo(end, pos)
    }
    this.line.graphics.endStroke()
  }

  render() {
    this.app.stage.addChild(this.line)
    this.app.update = true
  }

}

export default Grid