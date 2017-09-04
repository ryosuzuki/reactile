import React, { Component } from 'react'
import 'createjs'

class Panel extends Component {
  constructor() {
    super()
    window.panel = this

    this.state = {
      width: 100,
      height: 100,
      from: 0,
      to: 0,
      items: [
        {
          name: 'Circle',
          variables: ['radius']
        },
        {
          name: 'Slider',
          variables: ['value']
        }
      ]
    }
  }

  componentDidMount() {
    let el = document.getElementById('panel')
    console.log(el.offsetWidth)
    this.setState({ width: el.offsetWidth })
  }

  render() {
    let left = 300
    let top = 240
    let width = 40
    let height = 240
    let margin = 10
    let style1 = {
      position: 'absolute',
      width: `${0}px`,
      height: `${height + margin*2}px`,
      left: `${left}px`,
      top: `${top}px`,
      zIndex: 1000,
      borderRight: '10px solid teal'
    }
    let style2 = {
      position: 'absolute',
      width: `${width}px`,
      height: `${0}px`,
      left: `${left - width}px`,
      top: `${top}px`,
      zIndex: 1000,
      borderTop: '10px solid teal'
    }
    let style3 = {
      position: 'absolute',
      width: `${width}px`,
      height: `${0}px`,
      left: `${left - width}px`,
      top: `${top + height + margin}px`,
      zIndex: 1000,
      borderBottom: '10px solid teal'
    }

    return (
      <div id="panel" className="panel">
        <div style={ style1 }></div>
        <div style={ style2 }></div>
        <div style={ style3 }></div>
        <p>{ this.state.items[0].name }</p>
        { this.state.items.map((item) => {
          return (
            <div className="ui card" key={ item.name } style={{ width: '100%', height: height, margin: `${margin}px 0` }}>
              <div className="content">
                <div className="header">{ item.name }</div>
              </div>
              { this.drawSvg(item.name) }
              <div className="content">
                { item.variables.map((variable) => {
                  return (
                    <button className="ui teal button" style={{ width: '100%' }} key={ variable }>{ variable }</button>
                  )
                }) }
              </div>
            </div>
          )
        }) }
      </div>
    )
  }


  drawSvg(type) {
    type = type.toLowerCase()
    switch (type) {
      case 'circle':
        return (
          <svg height="100" width="100%">
            <circle cx={ this.state.width / 2 } cy={50} r={30} strokeWidth={10} stroke="#f00" fill="none"/>
          </svg>
        )
      case 'rect':
        return (
          <svg height="100" width="100%">
            <rect x={ (this.state.width - 50) / 2 } y={50 / 2} width={50} height={50} strokeWidth={10} stroke="#f00" fill="none"/>
          </svg>
        )
      case 'slider':
        return (
          <svg height="100" width="100%">
            <line x1={30} y1={50} x2={ this.state.width - 30 } y2={50} strokeWidth="10" stroke="black"/>
            <circle cx={ this.state.width / 2 } cy={50} r={8} strokeWidth={15} stroke="#f00" fill="none"/>
          </svg>
        )
      case 'point':
        return (
          <svg height="100" width="100%">
            <circle cx={ this.state.width / 2 } cy={50} r={5} strokeWidth={10} stroke="#f00" fill="none"/>
          </svg>
        )
    }

  }
}



export default Panel