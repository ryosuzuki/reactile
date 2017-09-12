const _ = require('lodash')

function detectPanel() {

  this.panel = [
    {x: 451, y: 93},
    {x: 465, y: 424},
    {x: 577, y: 428},
    {x: 548, y: 95}
  ]

  for (let i = 0; i < this.panel.length; i++) {
    let ci = i
    let ni = (i+1) % 4
    let p0 = [this.panel[ci].x, this.panel[ci].y]
    let p1 = [this.panel[ni].x, this.panel[ni].y]
    let blue = [255, 255, 0]
    this.imPanel.line(p0, p1, blue)
  }

  this.panelReady = true
  return

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

    this.panel = [
      topLeft,
      bottomLeft,
      bottomRight,
      topRight
    ]
  }

  for (let i = 0; i < this.panel.length; i++) {
    let ci = i
    let ni = (i+1) % 4
    let p0 = [this.panel[ci].x, this.panel[ci].y]
    let p1 = [this.panel[ni].x, this.panel[ni].y]
    let blue = [255, 255, 0]
    this.imPanel.line(p0, p1, blue)
  }
}




module.exports = detectPanel

