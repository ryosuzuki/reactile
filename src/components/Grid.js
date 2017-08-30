import React, { Component } from 'react'

class Grid extends Component {

  componentDidMount() {
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