import munkres from 'munkres-js'
import Outline from './Outline'

class Shape {
  constructor() {
    this.app = app
    this.targets = []
    this.ids = []
    this.id = this.app.currentId

    this.dependent = false
    this.repeatCount = 0
    this.type = 'point'
    this.x = 30 + 10 * this.id
    this.y = 30
    this.angle = 0
    this.scale = 1
    this.variables = []
    this.running = false

    this.demo = 5

    if (this.demo === 1) {
      this.type = 'rect'
      this.variables = []
      this.x = 20
      this.y = 20
      this.width = 15
      this.height = 15
    }

    if (this.demo === 2) {
      this.type = 'circle'
      this.variables = []
      this.x = 25
      this.y = 20
      this.radius = 9
      this.diameter = this.radius * 2
    }

    if (this.demo === 3) {
      this.type = 'point'
      this.x = 35
      this.y = 30
    }

    if (this.demo === 4) {
      if (this.id === 0) {
        this.type = 'rect'
        this.variables = ['width']
        this.x = 20
        this.y = 10
        this.width = 15
        this.height = 15
      }
      if (this.id === 1) {
        this.type = 'point'
        this.x = 20
        this.y = 30
        this.variables = ['x']
      }
    }

    if (this.demo === 5) {
      if (this.id === 0) {
        // this.type = 'point'
        this.type = 'rect'
        // this.variables = ['angle', 'radius']
        this.variables = ['angle']
        this.x = 20
        this.y = 10
        this.radius = 7
        this.width = 10
        this.height = 10
      }
      if (this.id === 1) {
        this.type = 'point'
        this.x = 20
        this.y = 30
        this.variables = ['x']
      }
    }

    // this.type = 'circle'
    // this.radius = 4

    this.outline = new Outline(this)
    window.shape = this
  }

  propagate(marker) {
    console.log(marker.x, marker.y)
    if (this.demo === 4) {
      // _.intersect(this.app.props.shapes, this)

      let shape = this.app.props.shapes[0]
      let shape1 = this.app.props.shapes[1]
      shape.dependent = true
      shape1.dependent = true
      if (marker.x > 25) {
        if (shape.width !== 20) {
          shape.width = 20 // marker.x
          shape1.x = 25
          shape.init()
          shape1.init()
        }
      } else if (marker.x < 10) {
        if (shape.width !== 10) {
          shape.width = 10 // marker.x
          shape1.x = 15
          shape.init()
          shape1.init()
        }
      }
    }

    if (this.demo === 5) {

    }
  }

  init() {
    this.outline.init()
    this.targets = this.outline.targets
    let shapes = this.app.props.shapes
    shapes[this.id] = this
    this.app.updateState({ shapes: shapes })

    this.calculate()
    if (this.app.isSimulation) {
      this.move()
      // this.travel()
    } else {
      this.travel()
      // this.move()
    }
  }

  calculate() {
    this.distMatrix = []
    for (let marker of this.app.props.markers) {
      let distArray = []
      for (let target of this.targets) {
        let dist = Math.abs(marker.x - target.x) + Math.abs(marker.y - target.y)
        // if (marker.shapeId != null && marker.shapeId !== this.app.currentId) {
        //   dist = Infinity
        // }
        // if (dist > 10) dist = 100
        distArray.push(dist)
      }
      this.distMatrix.push(distArray)
    }
    if (!this.distMatrix.length) return
    this.ids = munkres(this.distMatrix)
    this.drawLine()
  }

  redo() {
    return
    let markers = this.app.props.markers
    let commands = []
    for (let id of this.ids) {
      let mid = id[0]
      let tid = id[1]
      let marker = markers[mid]
      let target = this.targets[tid]
      // let dist = Math.abs(marker.x - target.x) + Math.abs(marker.y - target.y)
      let dist = Math.sqrt((marker.x-target.x)**2 + (marker.y-target.y)**2)
      if (dist > 2) {
        commands.push({
          from: { x: marker.x, y: marker.y },
          to: { x: target.x, y: target.y },
          dist: dist
        })
      }
    }
    commands.sort((a, b) => {
      return b.dist - a.dist
    })
    if (commands.length > 0 && this.repeatCount < 2) {
      console.log(commands)
      this.app.initPositions()
      this.app.socket.emit('markers:travel', commands)
      this.repeatCount++
    } else {
      this.repeatCount = 0
    }
  }

  travel() {
    let markers = this.app.props.markers
    let commands = []
    for (let id of this.ids) {
      let mid = id[0]
      let tid = id[1]
      let marker = markers[mid]
      let target = this.targets[tid]
      marker.shapeId = this.id
      // let dist = Math.abs(marker.x - target.x) + Math.abs(marker.y - target.y)
      let dist = Math.sqrt((marker.x-target.x)**2 + (marker.y-target.y)**2)
      commands.push({
        from: { x: marker.x, y: marker.y },
        to: { x: target.x, y: target.y },
        dist: dist
      })
    }
    this.app.updateState({ markers: markers })
    commands.sort((a, b) => {
      return b.dist - a.dist
    })
    console.log(commands)
    this.app.socket.emit('markers:travel', commands)
  }

  move() {
    let markers = this.app.props.markers
    if (!markers.length) return
    let commands = new Array(100).fill([])
    for (let id of this.ids) {
      let index = 0
      let mid = id[0]
      let tid = id[1]
      let marker = markers[mid]
      let target = this.targets[tid]
      let dx = marker.x - target.x
      let dy = marker.y - target.y
      if (dx > 0) {
        for (let i = 1; i < Math.abs(dx); i++) {
          let pos = { x: marker.x-i, y: marker.y }
          commands[index].push(pos)
          index++
        }
      }
      if (dx < 0) {
        for (let i = 1; i < Math.abs(dx); i++) {
          let pos = { x: marker.x+i, y: marker.y }
          commands[index].push(pos)
          index++
        }
      }
      if (dy > 0) {
        for (let i = 1; i < Math.abs(dx); i++) {
          let pos = { x: target.x, y: marker.y-i }
          commands[index].push(pos)
          index++
        }
      }
      if (dy < 0) {
        for (let i = 1; i < Math.abs(dx); i++) {
          let pos = { x: target.x, y: marker.y+i }
          commands[index].push(pos)
          index++
        }
      }
    }

    const waitTime = 100
    let repeatCount = 0
    index = 0
    const timer = setInterval(() => {
      if (this.running) return
      let command = commands[index]
      console.log('run')
      console.log(command)
      if (command.length > 0) {
        index++
        this.running = true
        this.app.socket.emit('markers:move', command)
      } else {
        console.log('clear')
        clearInterval(timer)
        let mids = this.ids.map(a => a[0])
        for (let id of mids) {
          // let markers = this.app.props.markers
          let marker = markers[id]
          marker.shapeId = this.app.currentId
          marker.isMoving = false
          markers[id] = marker
          this.app.updateState({ markers: markers })
        }
      }
    }, waitTime)
  }

  check(markers) {
    this.calculate()
    let change = false
    // let markers = this.app.props.markers
    let longIds = []
    let changedIds = []
    let targets = []
    for (let id of this.ids) {
      let mid = id[0]
      let tid = id[1]
      let marker = markers[mid]
      let target = this.targets[tid]

      let dx = marker.x - target.x
      let dy = marker.y - target.y
      let x = marker.x
      let y = marker.y
      let dist = Math.sqrt(dx**2 + dy**2)
      if (dx !== 0) {
        if (dx > 0) {
          targets.push({ x: marker.x-1, y: marker.y })
        } else {
          targets.push({ x: marker.x+1, y: marker.y })
        }
      } else if (dy !== 0) {
        if (dy > 0) {
          targets.push({ x: marker.x,   y: marker.y-1 })
        } else {
          targets.push({ x: marker.x,   y: marker.y+1 })
        }
      }
      if (dx !== 0 || dy !== 0) {
        marker.isMoving = true
        if (dist > 4) longIds.push(mid)
      } else {
        marker.isMoving = false
      }
      markers[mid] = marker
    }
    this.app.updateState({ markers: markers })

    // let targets = markers.filter((marker) => {
    //   if (longIds.length > 0) {
    //     return longIds.includes(marker.id)
    //   } else {
    //     return marker.isMoving
    //   }
    // })
    return { change: change, markers: markers, targets: targets }
  }

  drawLine() {
    if (!this.line) {
      this.line = new createjs.Shape()
    } else {
      this.line.graphics.clear()
    }
    this.line.graphics.setStrokeDash([10, 10])
    this.line.graphics.setStrokeStyle(3)
    this.line.graphics.beginStroke('#0f0')
    for (let id of this.ids) {
      let pos = this.app.props.markers[id[0]]
      let target = this.targets[id[1]]
      this.line.graphics.moveTo((pos.x+1) * this.app.offsetX, (pos.y+1) * this.app.offsetY)
      this.line.graphics.lineTo((target.x+1) * this.app.offsetX, (target.y+1) * this.app.offsetY)
    }
    this.line.graphics.endStroke()
    this.app.stage.addChild(this.line)
    this.app.update = true
  }

  initFromCanvas(info) {
    this.dependent = (this.type === info.type)
    this.type = info.type
    this.variables = []
    switch (info.type) {
      case 'circle':
        this.x = Math.round(info.x / this.app.offsetX)
        this.y = Math.round(info.y / this.app.offsetY)
        this.radius = Math.round(info.radius / this.app.offset)
        this.diameter = this.radius * 2
        break
      case 'rect':
        this.width = Math.round(info.width / this.app.offsetX)
        this.height = Math.round(info.height / this.app.offsetY)
        this.x = Math.round(info.x / this.app.offsetX) + this.width / 2
        this.y = Math.round(info.y / this.app.offsetY) + this.height / 2
        break
      case 'triangle':
        this.points = info.points.map((point) => {
          let x = Math.round(point.x  / this.app.offsetX)
          let y = Math.round(point.y  / this.app.offsetY)
          return { x: x, y: y }
        })
        this.x = Math.round(info.x / this.app.offsetX)
        this.y = Math.round(info.y / this.app.offsetY)
        console.log(this.points)
        break
    }
    this.init()
  }

}

export default Shape