import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from '../redux/actions'
import 'createjs'
import munkres from 'munkres-js'

import Grid from './Grid'
import Marker from './Marker'
import Draw from './Draw'
import Pointer from './Pointer'
import Shape from './Shape'
import Panel from './Panel'
import Constraint from './Constraint'

const socket = io.connect('http://localhost:8080/')

class App extends Component {
  constructor(props) {
    super(props)
    window.app = this

    this.isSimulator = window.isSimulator
    this.xSize = 80 // 16
    this.ySize = 40 // 40
    this.offsetX = 19
    this.offsetY = 19.7
    this.offset = 19 // (this.offsetX + this.offsetY) / 2

    this.positions = []
    this.shapes = []
    this.currentId = -1

    this.state = {
      mode: '',
      width: 1080,
      height: 720
    }

    this.update = true
    this.socket = socket
    this.socket.on('markers:update', this.updateMarkers.bind(this))
    this.socket.on('pointer:update', this.updatePointer.bind(this))
    this.socket.on('arduino:log', (data) => {
      console.log(data)
    })
  }

  initPositions() {
    let positions = this.props.markers.map((marker) => {
      return { x: marker.x, y: marker.y }
    })
    this.socket.emit('markers:move', positions)
  }

  updatePointer(pos) {
    pos = {
      x: this.stage.canvas.width * (1-pos.x),
      y: this.stage.canvas.height * (1-pos.y),
    }
    this.pointer.update(pos)
  }

  updateMarkers(positions) {
    let markers = this.props.markers
    if (markers.length === 0) {
      for (let pos of positions) {
        let marker = new Marker()
        marker.x = pos.x
        marker.y = pos.y
        marker.update()
        markers.push(marker)
      }
    }
    this.positions = positions
    this.track()
    return

    for (let i = 0; i < markers.length; i++) {
      let marker = markers[i]
      let pos = positions[i]
      if (pos) {
        marker.x = pos.x
        marker.y = pos.y
      }
      marker.id = i
      marker.update()
    }
    this.updateState({ markers: markers })
    this.constraint.check()
  }

  track() {
    let markers = this.props.markers
    let positions = this.positions
    this.distMatrix = []
    for (let marker of markers) {
      let distArray = []
      for (let pos of positions) {
        let dist = Math.sqrt((marker.x-pos.x)**2+(marker.y-pos.y)**2)
        distArray.push(dist)
      }
      this.distMatrix.push(distArray)
    }
    if (!this.distMatrix.length) return
    this.ids = munkres(this.distMatrix)

    for (let id of this.ids) {
      let mid = id[0]
      let pid = id[1]
      let marker = markers[mid]
      let pos = positions[pid]
      let dist = Math.sqrt((marker.x-pos.x)**2+(marker.y-pos.y)**2)
      if (dist > 1 || (dist > 0.9 && marker.isMoving) ) {
        marker.x = pos.x
        marker.y = pos.y
      }
      marker.id = mid
      markers[mid] = marker
      marker.update()
    }
    this.updateState({ markers: markers })
    this.constraint.check()
  }

  componentDidMount() {
    this.stage = new createjs.Stage(this.refs.canvas)
    this.stage.canvas.style.backgroundColor = '#000'
    this.stage.enableMouseOver(10)
    this.resize()
    createjs.Touch.enable(this.stage)
    createjs.Ticker.on('tick', this.tick.bind(this))

    if (this.isSimulator) {
      this.grid = new Grid()
      this.grid.render()
    }

    this.draw = new Draw()
    this.draw.init()

    this.pointer = new Pointer()
    this.pointer.init()

    this.constraint = new Constraint()
    this.constraint.init()

    if (window.Maptastic) {
      const config = {
        autoSave: false,
        autoLoad: false,
        layers: ['react-app']
      }
      Maptastic(config)
    }
  }

  tick(event) {
    if (this.update || this.animate) {
      this.update = false
      this.stage.update(event)
    }
  }

  resize() {
    this.stage.canvas.width = this.offsetX * (this.xSize + 1)
    this.stage.canvas.height = this.offsetY * (this.ySize + 1)
    // $('canvas').css('left', '300px')
  }

  updateState(state) {
    let result = this.props.store.dispatch(actions.updateState(state))
    this.setState({})
    return result.state
  }

  random() {
    return Math.floor(Math.random()*40)
  }

  onClick(mode) {
    if (mode === 'init') {
      this.initPositions()
      return
    }

    if (this.state.mode === mode) {
      this.setState({ mode: '' })
      return
    }

    console.log(mode)
    if (mode === 'run') {
      this.constraint.run()
    } else if (mode === 'new') {
      let markers = this.props.markers.map((marker) => {
        marker.isReference = false
        marker.update()
        return marker
      })
      this.updateState({ markers: markers })
      this.currentId++
      this.shape = new Shape()
      this.shape.init()
      this.shapes.push(this.shape)

    } else {
      this.setState({ mode: mode })
    }
  }

  render() {
    return (
      <div>
        <div id="sidepanel">
          <Panel
            pathData={ this.props.pathData }
            shapes={ this.props.shapes }
            mappings={ this.props.mappings }
           />
          <div style={{ display: 'block' }}>
            <button className="ui button" onClick={ this.onClick.bind(this, 'init') }>Init</button>
            <button className="ui button" onClick={ this.onClick.bind(this, 'new') }>New</button>
            <button className={ `ui button ${ this.state.mode === 'draw' ? 'primary' : '' }` } onClick={ this.onClick.bind(this, 'draw') }>Draw</button>
            <button className={ `ui button ${ this.state.mode === 'constraint' ? 'primary' : '' }` } onClick={ this.onClick.bind(this, 'constraint') }>Constraint</button>
            <button className={ `ui button ${ this.state.mode === 'demonstrate' ? 'primary' : '' }` } onClick={ this.onClick.bind(this, 'demonstrate') }>Demonstrate</button>
            <button className="ui button" onClick={ this.onClick.bind(this, 'run') }>Run</button>
          </div>
        </div>
        <div id="main">
          <canvas ref="canvas" id="canvas" width="1000" height="600"></canvas>
        </div>
      </div>
    )
  }
}

window.addEventListener('resize', () => {
  // window.app.resize()
}, false)

function mapStateToProps(state) {
  return state
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)
