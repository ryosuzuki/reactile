const _ = require('lodash')

function detectConstraint() {
  this.positions = []

  this.min = this.blueMin
  this.max = this.blueMax

  this.min = [70, 130, 0]
  this.max = [150, 155, 160]


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

    let white = [255, 255, 255]
    this.im.ellipse(pos.x, pos.y, 10, 10, white)
    positions.push(pos)
  }

  let width = this.im.width()
  let height = this.im.height()
  let unit = {
    x: width / this.xSize,
    y: height / this.ySize
  }

  this.constraints = positions.map((pos) => {
    let x = this.xSize - Math.round(pos.x / unit.x) -1
    let y = this.ySize - Math.round(pos.y / unit.y) -1
    return { x: x, y: y }
  })

  this.socket.emit('constraints:update', this.constraints)

}

module.exports = detectConstraint

