import React, { Component } from 'react'
import async from 'async'
import 'babel-polyfill'

class Grid extends Component {

  componentDidMount() {
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
    for (let i = 0; i < 16; i++) {
      P.push(i)
    }
    for (let i = 0; i < 40; i++) {
      N.push(i)
    }
    const unit = 20
    const margin = 15
    return (
      <div>
        <button onClick={ this.move.bind(this) }>Move</button>
        { this.props.markers.map((marker, index) => {
          return (
            <div className="marker" key={index} style={{
              'left' : `${unit * marker.x - margin}px`,
              'top'  : `${unit * marker.y - margin}px`,
              // 'transform': `rotate(${robot.rotate}deg)`
            }}>
              { marker.id }
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