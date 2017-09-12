const _ = require('lodash')

function detectPointer(type) {
  this.min = [130, 0, 230]
  this.max = [150, 130, 255]

  let imCanny = this.im.copy()
  imCanny.convertHSVscale()
  imCanny.inRange(this.min, this.max)
  imCanny.dilate(3)
  imCanny.erode(2)

  // this.im = imCanny
  // return

  let contours = imCanny.findContours()
  let threshold = 10
  let max = 0
  for (let i = 0; i < contours.size(); i++) {
    if (threshold > contours.area(i)) continue
    if (max < contours.area(i)) {
      let pos = { x: 0, y: 0 }
      let count = contours.cornerCount(i)
      for (let j = 0; j < count; j++) {
        let point = contours.point(i, j)
        pos.x += point.x
        pos.y += point.y
      }
      pos.x /= count
      pos.y /= count

      let green = [0, 255, 0]
      this.im.ellipse(pos.x, pos.y, 10, 10, green)

      let width = this.im.width()
      let height = this.im.height()
      pos.x = pos.x / width
      pos.y = pos.y / height

      this.socket.emit('pointer:update', pos)
    }
  }

}

module.exports = detectPointer

