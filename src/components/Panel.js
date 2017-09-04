import React, { Component } from 'react'
import 'createjs'

class Panel extends Component {
  constructor() {
    super()
    window.panel = this

    let items = [{
      name: 'Circle',
      variables: ['radius']
    }, {
      name: 'Slider',
      variables: ['value']
    }]

    items = [{
      name: 'Data',
      variables: ['month', 'temperature']
    }, {
      name: 'Point',
      variables: ['x', 'y']
    }]

    this.state = {
      width: 260,
      height: 220,
      margin: 10,
      connections: [1, 0],
      items: items
    }
  }

  componentDidMount() {
  }

  render() {
    return (
      <div id="panel" className="panel">
        { this.state.connections.map((connection, index) => {
          return (
            this.drawConnector(connection)
          )
        }) }
        <p>{ this.state.items[0].name }</p>
        { this.state.items.map((item) => {
          return (
            <div className="ui card" key={ item.name } style={{ width: '100%', height: this.state.height, margin: `${this.state.margin}px 0` }}>
              <div className="content">
                <div className="header">{ item.name }</div>
              </div>
              { this.drawSvg(item.name) }
              <div className="content">
                { item.variables.map((variable) => {
                  return (
                    <button className="ui teal button" style={{ width: '100%', marginBottom: '10px' }} key={ variable }>{ variable }</button>
                  )
                }) }
              </div>
            </div>
          )
        }) }

        <div className="ui card" style={{ width: '100%', height: this.state.height, marginTop: `${this.state.margin*5}px` }}>
          <div className="content">
            <div className="header">Mapping</div>
          </div>
          <div className="content">
            <span className="ui teal label">circle.radius</span>
            <span> = </span>
            <span className="ui teal label">slider.value</span>
            <span> / 100 </span>
          </div>
        </div>

      </div>
    )
  }


  drawSvg(type) {
    type = type.toLowerCase()
    let height = 80
    switch (type) {
      case 'circle':
        return (
          <svg height={ height } width="100%">
            <circle cx={ this.state.width / 2 } cy={ height / 2 } r={30} strokeWidth={10} stroke="#f00" fill="none"/>
          </svg>
        )
      case 'rect':
        return (
          <svg height={ height } width="100%">
            <rect x={ (this.state.width - 50) / 2 } y={ height / 4 } width={ height / 2 } height={ height / 2} strokeWidth={10} stroke="#f00" fill="none"/>
          </svg>
        )
      case 'slider':
        return (
          <svg height={ height } width="100%">
            <line x1={30} y1={ height / 2 } x2={ this.state.width - 30 } y2={ height / 2 } strokeWidth="10" stroke="black"/>
            <circle cx={ this.state.width / 2 } cy={ height / 2 } r={8} strokeWidth={15} stroke="#f00" fill="none"/>
          </svg>
        )
      case 'point':
        return (
          <svg height={ height } width="100%">
            <circle cx={ this.state.width / 2 } cy={ height / 2 } r={5} strokeWidth={10} stroke="#f00" fill="none"/>
          </svg>
        )
      case 'data':
        return (
          <div style={{ height: height, width: '100%', textAlign: 'center', color: 'black' }}>
            <i className="fa fa-3x fa-database"></i>
          </div>
        )
      default:
        return (
          <svg height={ height } width="100%">
          </svg>
        )
    }
  }

  drawConnector(index) {
    let width = 40 - index * 20
    let left = 300 - index * 20
    let top = 230 - index * 50
    let style1 = {
      position: 'absolute',
      width: `${0}px`,
      height: `${this.state.height + this.state.margin*2}px`,
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
      top: `${top + this.state.height + this.state.margin}px`,
      zIndex: 1000,
      borderBottom: '10px solid teal'
    }

    return (
      <div>
        <div style={ style1 }></div>
        <div style={ style2 }></div>
        <div style={ style3 }></div>
      </div>
    )
  }

}



export default Panel