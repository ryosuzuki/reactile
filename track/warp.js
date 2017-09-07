
function warpWithRect() {
  if (this.rect.length < 4) return

  let topLeft = this.rect[0]
  let bottomLeft = this.rect[1]
  let bottomRight = this.rect[2]
  let topRight = this.rect[3]

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

  let width = this.im.width()
  let height = this.im.height()

  let src = [
    topLeft.x-1, topLeft.y-1,
    topRight.x+1, topRight.y-1,
    bottomRight.x+1, bottomRight.y+1,
    bottomLeft.x-1, bottomLeft.y+1,
  ]

  let dst = [
    0, 0,
    width, 0,
    width, height,
    0, height
  ]

  let M = this.im.getPerspectiveTransform(src, dst)
  this.im.warpPerspective(M, width, height)
}

module.exports = warpWithRect