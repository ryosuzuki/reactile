import React, { Component } from 'react'
import async from 'async'
import 'babel-polyfill'
import munkres from 'munkres-js'


class Grid extends Component {
  constructor() {
    super()
    this.pSize = 40 // 16
    this.nSize = 40 // 40

    this.state = {
      markers: [],
      targets: []
    }
    window.grid = this
  }

  componentDidMount() {
    this.calculate()
  }

  calculate() {
    // let markers = this.props.markers
    const random = () => {
      return Math.floor(Math.random()*40)
    }

    let markers = []
    let targets = []
    for (let i = 0; i < 10; i++) {
      markers.push({ x: random(), y: random() })
      targets.push({ x: random(), y: random() })
    }
    console.log(markers)
    console.log(targets)

    let distMatrix = []
    for (let marker of markers) {
      let distArray = []
      for (let target of targets) {
        let dist = Math.abs(marker.x - target.x) + Math.abs(marker.y - target.y)
        distArray.push(dist)
      }
      distMatrix.push(distArray)
    }
    console.log(distMatrix)

    let result = munkres(distMatrix)
    console.log(result)

    for (let item of result) {
      console.log(distMatrix[item[0]][item[1]])
    }

    this.setState({
      markers: markers,
      targets: targets
    })

  }

  move() {
    if (this.props.markers.length < 1) return

    const command = () => {
      return new Promise((resolve) => {
        let marker = this.props.markers[0]
        let x = (marker.x + 1) % 16
        let y = marker.y
        let data = JSON.stringify({ x: x, y: y })
        this.props.app.socket.emit('move', data)
      })
    }

    const run = async () => {
      await command()
      // for (let i = 0; i < 10; i++) {
      //   await command()
      // }
    }

    run()
  }

  render() {
    let P = []
    let N = []
    for (let i = 0; i < this.pSize; i++) {
      P.push(i)
    }
    for (let i = 0; i < this.nSize; i++) {
      N.push(i)
    }
    const unit = 20
    const margin = 15
    return (
      <div>
        <button onClick={ this.calculate.bind(this) }>Move</button>
        { this.state.markers.map((marker, index) => {
          return (
            <div className="marker" key={index} style={{
              'background' : 'red',
              'left' : `${unit * marker.x - margin}px`,
              'top'  : `${unit * marker.y - margin}px`,
              // 'transform': `rotate(${robot.rotate}deg)`
            }}>
              { marker.id }
            </div>
          )
        }) }
        <svg height="210" width="500">
          <line x1="0" y1="0" x2="200" y2="200" style={{
            'stroke': 'rgb(255,0,0)',
            'stroke-width': 2}  }
          />
        </svg>
        { this.state.targets.map((target, index) => {
          return (
            <div className="marker" key={index} style={{
              'background' : 'blue',
              'left' : `${unit * target.x - margin}px`,
              'top'  : `${unit * target.y - margin}px`,
              // 'transform': `rotate(${robot.rotate}deg)`
            }}>
              { target.id }
            </div>
          )
        }) }

        <table id="grid" className="">
          <tbody>
            { N.map((n) => {
              return (
                <tr key={ n }>
                  { P.map((p) => {
                    return (
                      <td key={ p }>
                      </td>
                    )
                  }) }
                </tr>
              )
            }) }
          </tbody>
        </table>
      </div>
    )
  }

}

export default Grid