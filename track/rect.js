const _ = require('lodash')

function detectRect() {

  this.min = this.blueMin
  this.max = this.blueMax

  this.min = [156, 25, 39]
  this.max = [170, 50, 200]

  this.min = [100, 0, 100]
  this.max = [200, 100, 255]


  this.min = this.redMin
  this.max = this.redMax

  let imCanny = this.im.copy()
  // imCanny = this.im
  imCanny.convertHSVscale()
  imCanny.inRange(this.min, this.max)
  imCanny.dilate(3)

  let contours = imCanny.findContours()
  let threshold = 20
  let ids = []
  for (let i = 0; i < contours.size(); i++) {
    if (threshold < contours.area(i)) {
      ids.push(i)
    }
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

  if (points.length >= 4) {
    this.rect = points
    let left = _.orderBy(points, 'x').slice(0, 2)
    let right = _.orderBy(points, 'x').slice(2, 4)
    let top =  _.orderBy(points, 'y').slice(0, 2)
    let bottom =  _.orderBy(points, 'y').slice(2, 4)

    const drawLine = (points) => {
      let p0 = _.values(points[0])
      let p1 = _.values(points[1])
      this.im.line(p0, p1)
    }

    drawLine(left)
    drawLine(right)
    drawLine(top)
    drawLine(bottom)
  }


  return


  if (this.index < 50) {
    let imCanny = this.im.copy()

    let hoge = true
    if (hoge) imCanny = this.im
    imCanny.convertHSVscale()
    imCanny.inRange(this.min, this.max)
    imCanny.dilate(2)
    if (hoge) return

    let contours = imCanny.findContours()
    let size = contours.size()
    let threshold = 100
    let points = []
    for (let i = 0; i < size; i++) {
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

    if (points.length === 4) {
      if (this.rect.length > 0) {
        this.rect = this.rect.map((pos, i) => {
          return {
            x: (pos.x + points[i].x) / 2,
            y: (pos.y + points[i].y) / 2
          }
        })
      } else {
        this.rect = points
      }
      console.log('calibrating')
      this.index++
    }
    if (this.index === 50) {
      this.calibrating = false
      console.log('done')
    }
    this.index = 0
  }

  for (let i = 0; i < this.rect.length; i++) {
    let ci = i
    let ni = (i+1) % 4
    let p0 = [this.rect[ci].x, this.rect[ci].y]
    let p1 = [this.rect[ni].x, this.rect[ni].y]
    this.im.line(p0, p1)
  }
}

module.exports = detectRect