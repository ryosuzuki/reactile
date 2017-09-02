import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from '../redux/actions'
import 'createjs'

import Grid from './Grid'
import Marker from './Marker'
import Draw from './Draw'
import Shape from './Shape'
import Constraint from './Constraint'

const socket = io.connect('http://localhost:8080/')

class App extends Component {
  constructor(props) {
    super(props)
    window.app = this

    this.pSize = 40 // 16
    this.nSize = 40 // 40
    this.offset = 20

    this.markers = []

    this.state = {
      mode: '',
      width: 1080,
      height: 720
    }
    this.update = true
    this.socket = socket
    this.socket.on('markers:update', this.updateMarkers.bind(this))
  }

  sendCommand(positions) {
    this.socket.emit('markers:move', positions)
  }

  updateMarkers(positions) {
    if (this.markers.length === 0) {
      for (let pos of positions) {
        let marker = new Marker()
        marker.x = pos.x * this.offset
        marker.y = pos.y * this.offset
        this.markers.push(marker)
      }
    }

    for (let i = 0; i < this.markers.length; i++) {
      let marker = this.markers[i]
      let pos = positions[i]
      marker.x = pos.x * this.offset
      marker.y = pos.y * this.offset
      marker.id = i
    }
    this.update = true
    this.updateState({ positions: positions })
    this.constraint.check()
  }

  componentDidMount() {
    this.stage = new createjs.Stage(this.refs.canvas)
    this.stage.enableMouseOver(10)
    this.resize()
    createjs.Touch.enable(this.stage)
    createjs.Ticker.on('tick', this.tick.bind(this))

    this.grid = new Grid()
    this.grid.render()

    this.draw = new Draw()
    this.draw.init()

    this.shape = new Shape()

    this.constraint = new Constraint()
    this.constraint.init()
  }

  tick(event) {
    if (this.update || this.animate) {
      this.update = false
      this.stage.update(event)
    }
  }

  resize() {
    this.stage.canvas.width = window.innerWidth
    this.stage.canvas.height = window.innerHeight
  }

  updateState(state) {
    let result = this.props.store.dispatch(actions.updateState(state))
    return result.state
  }

  random() {
    return Math.floor(Math.random()*40)
  }

  onClick(mode) {
    console.log(mode)
    this.setState({ mode: mode })
  }

  render() {
    return (
      <div>
        {/*
        <div className="eight wide column">
          <canvas id="canvas-video" width={ this.state.width } height={ this.state.height }></canvas>
        </div>
        */}
        <button className={ `ui button ${ this.state.mode === 'draw' ? 'primary' : '' }` } onClick={ this.onClick.bind(this, 'draw') }>Draw</button>
        <button className={ `ui button ${ this.state.mode === 'constraint' ? 'primary' : '' }` } onClick={ this.onClick.bind(this, 'constraint') }>Constraint</button>
        <button className={ `ui button ${ this.state.mode === 'demonstrate' ? 'primary' : '' }` } onClick={ this.onClick.bind(this, 'demonstrate') }>Demonstrate</button>
        <div className="sixteen wide column">
          <canvas ref="canvas" id="canvas" width="1000" height="600"></canvas>
          {/*
          <Grid
            app={ this }
            markers={ this.props.markers }
          />
          <pre id="markers"></pre>
          <input type="text" id="input"></input>
          <button id="button">Move</button>
          */}
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
