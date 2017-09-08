
function detectMarker() {
  this.positions = []

  this.min = this.redMin
  this.max = this.redMax

  this.min = [0, 110, 120]
  this.max = [100, 255, 255]

  let imCanny = this.im.copy()
  imCanny.convertHSVscale()
  imCanny.inRange(this.min, this.max)
  // imCanny.dilate(4)

  let contours = imCanny.findContours()
  let threshold = 10
  let ids = []
  for (let i = 0; i < contours.size(); i++) {
    if (threshold < contours.area(i)) {
      ids.push(i)
    }
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

  let xSize = 80
  let ySize = 40
  let width = this.im.width()
  let height = this.im.height()
  let unit = {
    x: width / xSize,
    y: height / ySize
  }

  for (let pos of positions) {
    let red = [0, 0, 255]
    this.im.ellipse(pos.x, pos.y, 10, 10, red)

    let x = xSize - Math.round(pos.x / unit.x)
    let y = ySize - Math.round(pos.y / unit.y)
    this.positions.push({ x: x, y: y })
  }
  this.socket.emit('markers:update', this.positions)
}

module.exports = detectMarker

