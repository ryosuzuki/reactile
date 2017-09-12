const _ = require('lodash')

function detectPanelMarker(type) {
  this.min = [0, 130, 50]
  this.max = [100, 255, 255]

  // this.min = this.yellowMin
  // this.max = this.yellowMax

  let imCanny = this.imPanel.copy()
  imCanny.convertHSVscale()
  imCanny.inRange(this.min, this.max)
  imCanny.erode(4)
  imCanny.dilate(2)

  // this.imPanel = imCanny
  // return

  let contours = imCanny.findContours()
  let threshold = 100
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

    let green = [0, 255, 0]
    this.imPanel.ellipse(pos.x, pos.y, 10, 10, green)

    let width = this.imPanel.width()
    let height = this.imPanel.height()
    pos.x = pos.x / width
    pos.y = pos.y / height

    positions.push(pos)
  }
  this.socket.emit('panel-markers:update', positions　)
}

module.exports = detectPanelMarker

