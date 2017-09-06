import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from '../redux/actions'
import 'createjs'

import Grid from './Grid'
import Marker from './Marker'
import Draw from './Draw'
import Shape from './Shape'
import Panel from './Panel'
import Constraint from './Constraint'

const socket = io.connect('http://localhost:8080/')

class App extends Component {
  constructor(props) {
    super(props)
    window.app = this

    this.pSize = 40 // 16
    this.nSize = 40 // 40
    this.offset = 20

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
  }

  sendPositions(positions) {
    this.socket.emit('markers:move', positions)
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

    for (let i = 0; i < markers.length; i++) {
      let marker = markers[i]
      let pos = positions[i]
      marker.x = pos.x
      marker.y = pos.y
      marker.id = i
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

    this.grid = new Grid()
    this.grid.render()

    this.draw = new Draw()
    this.draw.init()

    // this.draw.stroke = [{ x: 481, y: 229 }, { x: 421, y: 243 }, { x: 372, y: 287 }, { x: 350, y: 349 }, { x: 363, y: 416 }, { x: 408, y: 467 }, { x: 472, y: 489 }, { x: 540, y: 475 }, { x: 589, y: 431 }, { x: 611, y: 369 }, { x: 598, y: 302 }, { x: 553, y: 251 }, { x: 489, y: 229 }, { x: 481, y: 229 }]
    // this.draw.beautify()

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
    this.stage.canvas.width = this.offset * (this.pSize + 1)
    this.stage.canvas.height = this.offset * (this.nSize + 1)
    // $('canvas').css('left', '300px')
  }

  updateState(state) {
    let result = this.props.store.dispatch(actions.updateState(state))
    return result.state
  }

  random() {
    return Math.floor(Math.random()*40)
  }

  onClick(mode) {
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
        </div>
        <div id="main">
          <canvas ref="canvas" id="canvas" width="1000" height="600"></canvas>

          <button className={ `ui button ${ this.state.mode === 'draw' ? 'primary' : '' }` } onClick={ this.onClick.bind(this, 'new') }>New</button>
          <button className={ `ui button ${ this.state.mode === 'draw' ? 'primary' : '' }` } onClick={ this.onClick.bind(this, 'draw') }>Draw</button>
          <button className={ `ui button ${ this.state.mode === 'constraint' ? 'primary' : '' }` } onClick={ this.onClick.bind(this, 'constraint') }>Constraint</button>
          <button className={ `ui button ${ this.state.mode === 'demonstrate' ? 'primary' : '' }` } onClick={ this.onClick.bind(this, 'demonstrate') }>Demonstrate</button>
          <button className="ui button" onClick={ this.onClick.bind(this, 'run') }>Run</button>
        </div>
      </div>
    )
  }
}

window.addEventListener('resize', () => {
  window.app.resize()
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


/*
socket.on('buffer', function (buffer) {
  const canvas = document.getElementById('canvas-video')
  const context = canvas.getContext('2d')
  const img = new Image()
  const uint8Arr = new Uint8Array(buffer);
  const str = String.fromCharCode.apply(null, uint8Arr);
  const base64String = btoa(str);
  img.onload = function () {
    context.drawImage(this, 0, 0, canvas.width, canvas.height)
  }
  img.src = 'data:image/png;base64,' + base64String
})
*/
