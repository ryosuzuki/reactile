
function detectRect() {
  if (this.index < 50) {
    let imCanny = this.im.copy()
    imCanny.convertHSVscale()
    imCanny.inRange(this.blueMin, this.blueMax)
    imCanny.dilate(2)

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