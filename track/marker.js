
function detectMarker() {
  this.markers = []
  this.positions = []

  let imCanny = this.im.copy()
  imCanny.convertHSVscale()
  imCanny.inRange(this.redMin, this.redMax)
  imCanny.dilate(2)
  let contours = imCanny.findContours()
  let threshold = 40
  let ids = []
  for (let i = 0; i < contours.size(); i++) {
    if (threshold < contours.area(i)) {
      ids.push(i)
    }
  }
  // console.log(" size " + contours.size() + " filter " + ids.length)

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
    this.positions.push(pos)
  }

  if (this.rect.length > 0) {
    let xMin = Math.min(this.rect[0].x, this.rect[1].x, this.rect[2].x, this.rect[3].x)
    let xMax = Math.max(this.rect[0].x, this.rect[1].x, this.rect[2].x, this.rect[3].x)
    let yMin = Math.min(this.rect[0].y, this.rect[1].y, this.rect[2].y, this.rect[3].y)
    let yMax = Math.max(this.rect[0].y, this.rect[1].y, this.rect[2].y, this.rect[3].y)
    let xPixel = (xMax - xMin) / 16
    let yPixel = (yMax - yMin) / 40

    for (let pos of positions) {
      if (pos.x < xMin || pos.x > xMax || pos.y < yMin || pos.y > yMax) continue

      let red = [0, 0, 255]
      this.im.ellipse(pos.x, pos.y, 10, 10, red)

      let x = 15 - Math.floor((pos.x - xMin) / xPixel)
      let y = 39 - Math.floor((pos.y - yMin) / yPixel)
      this.markers.push({ x: x, y: y })
    }
  }

  this.socket.emit('markers', this.markers)
}

module.exports = detectMarker

