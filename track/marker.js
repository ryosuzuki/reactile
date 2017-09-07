
function detectMarker() {
  this.positions = []

  let imCanny = this.im.copy()
  imCanny.convertHSVscale()
  imCanny.inRange(this.redMin, this.redMax)
  imCanny.dilate(10)
  let contours = imCanny.findContours()
  let threshold = 100
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

  let width = this.im.width()
  let height = this.im.height()
  let unit = {
    x: width / 40,
    y: height / 16
  }

  for (let pos of positions) {
    let red = [0, 0, 255]
    this.im.ellipse(pos.x, pos.y, 10, 10, red)

    let x = 40 - Math.round(pos.x / unit.x)
    let y = 16 - Math.round(pos.y / unit.y)
    this.positions.push({ x: x, y: y })
  }
  this.socket.emit('markers:update', this.positions)
}

module.exports = detectMarker

