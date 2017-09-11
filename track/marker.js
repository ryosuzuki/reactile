const _ = require('lodash')

function detectMarker() {
  this.positions = []

  this.min = this.redMin
  this.max = this.redMax

  this.min = [150, 130, 100]
  this.max = [170, 255, 255]

  let imCanny = this.im.copy()
  imCanny.convertHSVscale()
  imCanny.inRange(this.min, this.max)
  imCanny.dilate(3)
  imCanny.erode(2)

  // this.im = imCanny
  // return

  let contours = imCanny.findContours()
  let threshold = 40
  let ids = []
  for (let i = 0; i < contours.size(); i++) {
    if (threshold > contours.area(i)) continue
    ids.push(i)
  }

  let positions = []
  for (let id of ids) {
    let pos = { x: 0, y: 0 }
    let count = contours.cornerCount(id)
    for (let i = 0; i < count; i++) {
      let point = contours.point(id, i)
      pos.x += point.x
      pos.y += point.y
    }
    pos.x /= count
    pos.y /= count
    positions.push(pos)
  }

  let width = this.im.width()
  let height = this.im.height()
  let unit = {
    x: width / this.xSize,
    y: height / this.ySize
  }

  for (let pos of positions) {
    let red = [0, 0, 255]
    this.im.ellipse(pos.x, pos.y, 10, 10, red)

    let x = this.xSize - Math.round(pos.x / unit.x)
    let y = this.ySize - Math.round(pos.y / unit.y)
    this.positions.push({ x: x, y: y })
  }

  if (!this.accumulate) {
    this.accumulate = new Array(this.positions.length).fill({ x: 0, y: 0 })
  }

  if (this.accumulate.length >= 10) {
    let meanPositions = []
    for (let i = 0; i < this.positions.length; i++) {
      let history = this.accumulate.map((positions) => {
        if (!positions[i]) return false
        return { x: positions[i].x, y: positions[i].y }
      }).filter(i => i)
      let x = _.mean(_.map(history, 'x'))
      let y = _.mean(_.map(history, 'y'))
      x = Math.round(x)
      y = Math.round(y)
      meanPositions.push({ x: x, y: y })
    }
    // this.socket.emit('markers:update', meanPositions)
    this.accumulate = []
  } else {
    this.accumulate.push(this.positions)
  }

  this.socket.emit('markers:update', this.positions)


}

module.exports = detectMarker

