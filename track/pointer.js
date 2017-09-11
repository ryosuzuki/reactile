const _ = require('lodash')

function detectPointer() {
  this.min = this.redMin
  this.max = this.redMax

  this.min = [130, 0, 200]
  this.max = [250, 130, 255]

  let imCanny = this.im.copy()
  imCanny.convertHSVscale()
  imCanny.inRange(this.min, this.max)
  imCanny.dilate(3)
  imCanny.erode(2)

  // this.im = imCanny
  // return

  let contours = imCanny.findContours()
  let threshold = 10
  let id
  let max = 0
  for (let i = 0; i < contours.size(); i++) {
    // console.log(contours.area(i))
    if (threshold > contours.area(i)) continue
    if (max < contours.area(i)) {
      id = i
      // console.log(contours.area(i))

      let pos = { x: 0, y: 0 }
      let count = contours.cornerCount(id)
      console.log(count)
      for (let i = 0; i < count; i++) {
        let point = contours.point(id, i)
        pos.x += point.x
        pos.y += point.y
      }
      pos.x /= count
      pos.y /= count

      let red = [0, 0, 255]
      this.im.ellipse(pos.x, pos.y, 10, 10, red)

      pos.x = Math.round(pos.x)
      pos.y = Math.round(pos.y)

      this.socket.emit('markers:update', pos)
    }
  }

  // let width = this.im.width()
  // let height = this.im.height()
  // let unit = {
  //   x: width / this.xSize,
  //   y: height / this.ySize
  // }

}

module.exports = detectPointer

