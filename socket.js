const cv = require('opencv');
const _ = require('lodash')
const camWidth = 580 // 720;
const camHeight = 450 // 400;
const camFps = 10
const camInterval = 1000 / camFps;
const rectColor = [0, 255, 0];
const rectThickness = 2;
let socket

let camera = new cv.VideoCapture(0)
camera.setWidth(camWidth);
camera.setHeight(camHeight);

const redMin = [170, 128, 70]
const redMax = [180, 255, 255]
const blueMin = [100, 100, 100]
const blueMax = [120, 255, 200]

let rect = []
let index = 0
let calibrating = true

const detect = (socketio) => {
  socket = socketio
  setInterval(function() {
    camera.read(function(err, im) {
      if (err) throw err;

      socket.emit('frame', {
        buffer: im.toBuffer(),
        markers: []
      })
      return

      let result
      result = detectRect(im)
      let rect = result.rect
      im = result.im

      if (calibrating) {
        let data = {
          buffer: im.toBuffer(),
          markers: []
        }
        socket.emit('frame', data)
        return
      }

      result = detectMarkers(im)
      im = result.im
      let markers = result.markers

      let data = {
        buffer: im.toBuffer(),
        markers: markers
      }
      socket.emit('frame', data)
    })
  }, camInterval);
}


const detectMarkers = (im) => {
  let imCanny = im.copy()
  imCanny.convertHSVscale()
  imCanny.inRange(redMin, redMax)
  imCanny.dilate(2)
  let contours = imCanny.findContours()
  let threshold = 40
  let ids = []
  for (let i = 0; i < contours.size(); i++) {
    if (threshold < contours.area(i)) {
      ids.push(i)
    }
  }
  // console.log(" size " + contours.size() + " filter " + ids.length)

  let positions = []
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
    positions.push(pos)
  }

  let markers = []
  if (rect.length > 0) {
    let xMin = Math.min(rect[0].x, rect[1].x, rect[2].x, rect[3].x)
    let xMax = Math.max(rect[0].x, rect[1].x, rect[2].x, rect[3].x)
    let yMin = Math.min(rect[0].y, rect[1].y, rect[2].y, rect[3].y)
    let yMax = Math.max(rect[0].y, rect[1].y, rect[2].y, rect[3].y)
    let xPixel = (xMax - xMin) / 16
    let yPixel = (yMax - yMin) / 40

    for (let pos of positions) {
      if (pos.x < xMin || pos.x > xMax || pos.y < yMin || pos.y > yMax) continue

      let red = [0, 0, 255]
      im.ellipse(pos.x, pos.y, 10, 10, red)

      let x = 15 - Math.floor((pos.x - xMin) / xPixel)
      let y = 39 - Math.floor((pos.y - yMin) / yPixel)
      markers.push({ x: x, y: y })
    }
  }

  let result = {
    im: im,
    markers: markers
  }

  return result
}


const detectRect = (im) => {
  if (index < 50 && true) {
    let imCanny = im.copy()
    imCanny.convertHSVscale()
    imCanny.inRange(blueMin, blueMax)
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
      if (rect.length > 0) {
        rect = rect.map((pos, i) => {
          return {
            x: (pos.x + points[i].x) / 2,
            y: (pos.y + points[i].y) / 2
          }
        })
      } else {
        rect = points
      }
      console.log('calibrating')
      index++
    }
    if (index === 50) {
      calibrating = false
      console.log('done')
    }
  }


  for (let i = 0; i < rect.length; i++) {
    let ci = i
    let ni = (i+1) % 4
    let p0 = [rect[ci].x, rect[ci].y]
    let p1 = [rect[ni].x, rect[ni].y]
    im.line(p0, p1)
  }

  // socket.emit('rect', { rect: rect })
  let result = {
    im: im,
    rect: rect
  }

  return result
}



module.exports = detect

