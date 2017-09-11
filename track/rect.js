const _ = require('lodash')

function detectRect() {
  // if (this.ready) return

  this.min = this.whiteMin
  this.max = this.whiteMax
  this.min = [0, 0, 210]
  this.max = [50, 60, 255]

  let imCanny = this.im.copy()
  imCanny.convertHSVscale()
  imCanny.inRange(this.min, this.max)
  imCanny.erode(2)
  imCanny.dilate(2)

  // this.im = imCanny
  // return

  let contours = imCanny.findContours()
  let threshold = 100
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

  for (let i = 0; i < this.rect.length; i++) {
    let ci = i
    let ni = (i+1) % 4
    let p0 = [this.rect[ci].x, this.rect[ci].y]
    let p1 = [this.rect[ni].x, this.rect[ni].y]
    let black = [0, 0, 0]
    // this.im.line(p0, p1, black)
  }
  this.ready = true

}

function detectRectWithPoints() {
  if (this.ready) return

  this.min = this.yellowMin
  this.max = this.yellowMax

  let imCanny = this.im.copy()
  imCanny.convertHSVscale()
  imCanny.inRange(this.min, this.max)
  // imCanny.erode(1)
  imCanny.dilate(2)

  // this.im = imCanny
  // return

  let contours = imCanny.findContours()
  let threshold = 20
  let ids = []
  for (let i = 0; i < contours.size(); i++) {
    if (threshold > contours.area(i)) continue
    ids.push(i)
  }

  let points = []
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
    points.push(pos)
  }

  if (points.length === 4) {
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

    for (let i = 0; i < this.rect.length; i++) {
      let ci = i
      let ni = (i+1) % 4
      let p0 = [this.rect[ci].x, this.rect[ci].y]
      let p1 = [this.rect[ni].x, this.rect[ni].y]
      let black = [0, 0, 0]
      this.im.line(p0, p1, black)
    }
    this.ready = true
  }
}

module.exports = detectRect

