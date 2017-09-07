const _ = require('lodash')

function detectRect() {
  this.min = this.blueMin
  this.max = this.blueMax
  let imCanny = this.im.copy()
  imCanny.convertHSVscale()
  imCanny.inRange(this.min, this.max)
  imCanny.dilate(3)

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

    let leftTop = _.orderBy(left, 'y')[0]
    let leftBottom = _.orderBy(left, 'y')[1]
    let rightBottom = _.orderBy(right, 'y')[1]
    let rightTop = _.orderBy(right, 'y')[0]

    this.rect = [
      leftTop, leftBottom, rightBottom, rightTop
    ]

    for (let i = 0; i < this.rect.length; i++) {
      let ci = i
      let ni = (i+1) % 4
      let p0 = [this.rect[ci].x, this.rect[ci].y]
      let p1 = [this.rect[ni].x, this.rect[ni].y]
      this.im.line(p0, p1)
    }
  }
}

module.exports = detectRect

