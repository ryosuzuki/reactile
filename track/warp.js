
function warpWithRect(type) {
  let points
  let im

  if (type === 'rect') {
    points = this.rect
    im = this.im
  } else {
    points = this.panel
    im = this.imPanel
  }

  if (points.length < 4) return

  let topLeft = points[0]
  let bottomLeft = points[1]
  let bottomRight = points[2]
  let topRight = points[3]

  if (!topLeft || !bottomLeft || !bottomRight || !topRight) return

  let topWidth = Math.sqrt(
    (topLeft.x - topRight.x)**2
    + (topLeft.y - topRight.y)**2
  )
  let bottomWidth = Math.sqrt(
    (bottomLeft.x - bottomRight.x)**2
    + (bottomLeft.y - bottomRight.y)**2
  )
  let leftHeight = Math.sqrt(
    (topLeft.x - bottomLeft.x)**2
    + (topLeft.y - bottomLeft.y)**2
  )
  let rightHeight = Math.sqrt(
    (topRight.x - bottomRight.x)**2
    + (topRight.y - bottomRight.y)**2
  )
  let dstWidth = Math.max(topWidth, bottomWidth)
  let dstHeight = Math.max(leftHeight, rightHeight)

  let width = im.width()
  let height = im.height()

  let src = [
    topLeft.x, topLeft.y,
    topRight.x, topRight.y,
    bottomRight.x, bottomRight.y,
    bottomLeft.x, bottomLeft.y,
  ]

  let dst = [
    0, 0,
    width, 0,
    width, height,
    0, height
  ]

  let M = im.getPerspectiveTransform(src, dst)
  im.warpPerspective(M, width, height)
}

module.exports = warpWithRect