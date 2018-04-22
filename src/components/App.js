import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from '../redux/actions'
import 'createjs'
import munkres from 'munkres-js'
import _ from 'lodash'

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

    this.isSimulation = window.isSimulation
    this.xSize = 80 // 16
    this.ySize = 40 // 40
    this.offsetX = 19
    this.offsetY = 19.7
    this.offset = 19 // (this.offsetX + this.offsetY) / 2

    this.panelWidth = 350
    this.panelHeight = 350

    this.positions = []
    this.shapes = []
    this.currentId = -1

    this.finish = false


    this.state = {
      mode: 'draw',
      width: 1080,
      height: 720
    }

    this.demo = true

    this.update = true
    this.socket = socket
    this.socket.on('markers:update', this.updateMarkers.bind(this))
    this.socket.on('constraints:update', this.updateConstraints.bind(this))
    this.socket.on('pointer:update', this.updatePointer.bind(this))
    this.socket.on('panel-markers:update', this.updatePanelMarkers.bind(this))
    this.socket.on('arduino:finish', this.checkFinish.bind(this))
    this.socket.on('arduino:log', (data) => {
      // console.log(data)
    })
  }

  initPositions() {
    console.log('init position')
    let positions = this.props.markers.map((marker) => {
      return { x: marker.x, y: marker.y }
    })
    this.socket.emit('markers:move', positions)
  }

  checkFinish() {
    if (!this.shape) return
    this.shape.running = false
    this.shape.redo()

    /*
    >>>>>>> dev

    this.running = false
    if (this.shape.demo === 8) {
      this.shape.redo()
      return
    }


    let shape = this.props.shapes[0]
    if (!shape) return

    if (!this.finish) {
      shape.redo()
    }
    */
  }

  updatePointer(pos) {
    pos = {
      x: this.stage.canvas.width * (1-pos.x),
      y: this.stage.canvas.height * (1-pos.y),
    }
    this.pointer.update(pos)
  }

  updateConstraints(positions) {
    this.constraint.positions = positions
  }

  updatePanelMarkers(positions) {

    positions = positions.map((pos) => {
      return {
        x: this.panelWidth * (1-pos.x),
        y: this.stage.canvas.height * (1-pos.y)
      }
    })
    window.hoge = positions
    for (let pos of positions) {
      $('.variable.button').each(function(index, el) {
        let top = $(this).offset().top
        let height = $(this).height()
        if (top < pos.y && pos.y < top + height) {
          $(this).addClass('on')
        } else {
          $(this).addClass('off')
        }
      })

      if ($('.variable.button.on').length === 2) {
        let mapping = []
        for (let i = 0; i < 2; i++) {
          let el = $('.variable.button.on')[i]
          let id = $(el).attr('id')
          mapping.push(id)
        }
        mapping = _.orderBy(mapping)
        let mappings = this.props.mappings
        let exist = false
        for (let existing of mappings) {
          if (_.isEqual(existing, mapping)) exist = true
        }
        if (!exist) {
          setInterval(() => {
            this.shape.angle = 10 * Math.floor((Date.now()-panel.startTime)/1000)
            this.shape.init()
          }, 1000)
          /*
          >>>>>>> dev
          if (this.shape.demo === 5) {
            setInterval(() => {
              // this.shape.x = Math.floor((Date.now()-panel.startTime)/1000)
              this.shape.angle = Math.floor((Date.now()-panel.startTime)/1000)
              this.shape.init()
            }, 1000)
          }
          */

          mappings.push(mapping)
          this.updateState({ mappings: mappings })
        }

      }
    }
    // this.pointer.update(pos)
  }

  initMarkers(positions) {
    let markers = this.props.markers
    for (let pos of positions) {
      let marker = new Marker()
      marker.x = pos.x
      marker.y = pos.y
      marker.update()
      markers.push(marker)
    }
    this.updateState({ markers: markers })
  }

  updateMarkers(positions) {
    if (!this.props.markers.length) {
      this.initMarkers(positions)
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

      if (marker.shapeId === 1) {
        let shape = this.props.shapes[marker.shapeId]
        shape.propagate(marker)
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

    if (this.isSimulation) {
      this.grid = new Grid()
      this.grid.render()
    }

    this.draw = new Draw()
    this.draw.init()

    this.pointer = new Pointer()
    this.pointer.init()

    this.constraint = new Constraint()
    this.constraint.init()

    if (this.demo) {
      this.currentId++
      this.shape = new Shape()
      this.shape.init()
      this.shapes.push(this.shape)

      if (this.shape.demo === 4) {
        this.currentId++
        this.shape = new Shape()
        this.shape.init()
        this.shapes.push(this.shape)
      }

      if (this.shape.demo === 8) {
        this.currentId++
        this.shape = new Shape()
        this.shape.init()
        this.shapes.push(this.shape)


        setTimeout(() => {
          this.initShape()
        }, 1000)
      }

    }
  }

  initShape() {
    for (let shape of this.props.shapes) {
      shape.init()
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
          <div style={{ display: 'none' }}>
            <pre style={{ color: 'white', width: '100%', whiteSpace: 'normal' }}>
              { JSON.stringify(this.props.markers.map((marker) => {
                return { x: marker.x, y: marker.y }
              } )) }
            </pre>
            <pre style={{ color: 'white' }}>
              { JSON.stringify(this.props.targets.map((target) => {
                return { x: target.x, y: target.y }
              } )) }
            </pre>
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
