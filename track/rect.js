const _ = require('lodash')

function detectRect() {

  // this.rect = [
  //   {x: 54, y: 125},
  //   {x: 21, y: 346},
  //   {x: 467, y: 363},
  //   {x: 460, y: 141}
  // ]
  // this.ready = true

  if (!this.ready) {
    this.min = this.whiteMin
    this.max = this.whiteMax
    // this.min = [100, 0, 160]
    // this.max = [150, 100, 255]

    let imCanny = this.im.copy()
    imCanny.convertHSVscale()
    imCanny.inRange(this.min, this.max)
    // imCanny.erode(1)
    // imCanny.dilate(10)

    // this.im = imCanny
    // return

    let contours = imCanny.findContours()
    let threshold = 100 * 100
    let points = []
    for (let i = 0; i < contours.size(); i++) {
      if (contours.area(i) < threshold) continue
      let arcLengh = contours.arcLength(i, true)
      let epsilon = 0.1 * arcLengh
      let isColsed = true
      contours.approxPolyDP(i, epsilon, isColsed)

      if (contours.cornerCount(i) !== 4) continue
      points = [
        contours.point(i, 0),
        contours.point(i, 1),
        contours.point(i, 2),
        contours.point(i, 3)
      ]
    }

    if (points.length !== 4) return

    let left = _.orderBy(points, 'x').slice(0, 2)
    let right = _.orderBy(points, 'x').slice(2, 4)
    let top =  _.orderBy(points, 'y').slice(0, 2)
    let bottom =  _.orderBy(points, 'y').slice(2, 4)

    let topLeft = _.orderBy(left, 'y')[0]
    let bottomLeft = _.orderBy(left, 'y')[1]
    let bottomRight = _.orderBy(right, 'y')[1]
    let topRight = _.orderBy(right, 'y')[0]

    this.rect = [
      topLeft,
      bottomLeft,
      bottomRight,
      topRight
    ]
    this.socket.emit('rect:update', this.rect)
    this.ready = true
  }

  for (let i = 0; i < this.rect.length; i++) {
    let ci = i
    let ni = (i+1) % 4
    let p0 = [this.rect[ci].x, this.rect[ci].y]
    let p1 = [this.rect[ni].x, this.rect[ni].y]
    let red = [0, 0, 255]
    this.im.line(p0, p1, red)
  }

}








module.exports = detectRect

