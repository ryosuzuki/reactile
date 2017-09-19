import React, { Component } from 'react'
import _ from 'lodash'
import 'createjs'

class Panel extends Component {
  constructor() {
    super()
    this.app = app
    window.panel = this
    this.state = {
      width: 350,
      height: 220,
      margin: 10,
      selected: []
    }
    let temp = [5, 6, 9, 14, 18, 21, 25, 26, 23, 17, 12, 7]
  }

  componentDidMount() {
    this.startTime = Date.now()
  }

  onClick(shapeId, variable) {
    let selected = this.state.selected
    let info = { shapeId: shapeId, variable: variable }
    if (!this.includes(selected, info)) {
      selected.push(info)
    } else {
      _.pullAllWith(selected, [info], _.isEqual)
    }

    if (selected.length === 2) {
      let mapping = selected
      let mappings = this.props.mappings
      mappings.push(mapping)
      this.app.updateState({ mappings: mappings })
      selected = []
    }
    this.setState({ selected: selected })
  }

  includes(selected, info) {
    return _.intersectionWith(selected, [info], _.isEqual).length > 0
  }

  render() {
    let time = Math.floor((Date.now() - this.startTime) / 1000)
    return (
      <div id="panel" className="panel">
        { this.props.mappings.map((mapping, index) => {
          let id0 = mapping[0]
          let id1 = mapping[1]
          return (
            this.drawConnector(id0, id1, index)
          )
        }) }
        { this.props.shapes.map((shape, index) => {
          return (
            <div className="ui card" key={ index } style={{ width: '100%', margin: `${this.state.margin}px 0` }}>
              <div className="content" style={{ flexGrow: 0 }}>
                <div className="header">{ _.capitalize(shape.type) }</div>
              </div>
              { this.drawSvg(shape.type) }
              <div className="content">
                { shape.variables.map((variable) => {
                  let value = shape[variable]
                  return (
                    <button
                      id={ `${shape.id}-${variable}` }
                      className="ui variable button off"
                      // className={ `ui button ${ this.includes(this.state.selected, { shapeId: shape.id, variable: variable }) ? 'orange' : 'teal' }` }
                      style={{ width: '100%', marginBottom: '10px' }}
                      key={ variable }
                      onClick={ this.onClick.bind(this, shape.id, variable) }
                    >
                      { `${variable} : ${value}` }
                    </button>
                  )
                }) }
              </div>
            </div>
          )
        }) }
        <div style={{ display: (this.app.shape && this.app.shape.demo === 5) ? 'block' : 'none' }}>
          <div className="ui card" style={{ width: '100%', height: this.state.height, margin: `${this.state.margin}px 0` }}>
            <div className="content" style={{ flexGrow: 0 }}>
              <div className="header">Time</div>
            </div>
            { this.drawSvg('time', time) }
            <div className="content">
              <button
                id="time"
                className="ui variable button off"
                style={{ width: '100%', marginBottom: '10px' }}
              >
                { `value : ${time}` }
              </button>
            </div>
          </div>
        </div>
        <div style={{ display: (this.app.shape && this.app.shape.demo === 6) ? 'block' : 'none' }}>
          <div className="ui card" style={{ width: '100%', margin: `${this.state.margin}px 0` }}>
            <div className="content" style={{ flexGrow: 0 }}>
              <div className="header">Data</div>
            </div>
            { this.drawSvg('data') }
            <div className="content">
              <button
                id="data-month"
                className="ui variable button off"
                style={{ width: '100%', marginBottom: '10px' }}
              >
                { 'month' }
              </button>
              <button
                id="data-temperature"
                className="ui variable button off"
                style={{ width: '100%', marginBottom: '10px' }}
              >
                { `temperature` }
              </button>
            </div>
          </div>
        </div>

        <div className="ui card" style={{ display: (this.props.mappings.length > 0) ? 'block' : 'none', width: '100%', marginTop: `${this.state.margin*5}px` }}>
          <div className="content">
            <div className="header">Mapping</div>
          </div>
          <div className="content">
            { this.props.mappings.map((mapping, index) => {
              let name0 = this.getName(mapping[0])
              let name1 = this.getName(mapping[1])
              return (
                <div key={ index } style={{ fontSize: '3em' }}>
                  <span className="ui orange large label" style={{ fontSize: '0.5em', padding: '10px' }}>{ name0 }</span>
                  <span> = </span>
                  <span className="ui orange large label" style={{ fontSize: '0.5em', padding: '10px' }}>{ name1 }</span>
                  <span style={{ display: 'none' }}> - 5 </span>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    )
  }

  getName(id) {
    let shapeId = id.split('-')[0]
    let variable = id.split('-')[1]
    if (!['time', 'data'].includes(shapeId)) {
      let shape = this.props.shapes[shapeId]
      return `${shape.type}.${variable}`
    } else {
      return `${shapeId}.${variable}`
    }
  }

  drawConnector(id1, id2, index) {
    let el1 = $(`#${id1}`)
    let el2 = $(`#${id2}`)

    if (el1.offset().top > el2.offset().top) {
      let temp = el1
      el1 = el2
      el2 = temp
    }

    let info1 = {
      x: el1.offset().left,
      y: el1.offset().top,
      width: el1.width(),
      height: el1.height()
    }
    let info2 = {
      x: el2.offset().left,
      y: el2.offset().top,
      width: el2.width(),
      height: el2.height()
    }

    let offset = -30 //0 * (index + 1)
    let left = info1.x + info1.width //+ 40
    let top = info1.y + 20
    let height = Math.abs(info1.y - info2.y)

    let connector = {
      position: 'absolute',
      width: 0,
      height: height + 5,
      left: left + offset,
      top: top,
      zIndex: 1000,
      borderRight: '10px solid #f26202'
    }
    let topOffset = {
      position: 'absolute',
      width: offset + 10,
      height: 0,
      left: left,
      top: top - 5,
      zIndex: 1000,
      borderTop: '10px solid #f26202'
    }
    let bottomOffset = {
      position: 'absolute',
      width: offset + 10,
      height: 0,
      left: left,
      top: top + height - 5,
      zIndex: 1000,
      borderBottom: '10px solid #f26202'
    }

    return (
      <div key={ index }>
        <div style={ topOffset }></div>
        <div style={ connector }></div>
        <div style={ bottomOffset }></div>
      </div>
    )
  }

  drawSvg(type, time) {
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
      case 'triangle':
        return (
          <svg height={ height } width="100%">
            <polygon points={ `${this.state.width / 2},${ height * 1 / 4 },${this.state.width * 0.4},${ height * 3 / 4 },${this.state.width * 0.6},${ height * 3 / 4 }` } strokeWidth={10} stroke="#f00" fill="none"/>
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
            <i className="fa fa-3x fa-database" style={{ color: 'purple'}}></i>
          </div>
        )
      case 'time':
        return (
          <div style={{ height: height, width: '100%', textAlign: 'center', color: 'black' }}>
            <i className="fa fa-5x fa-clock-o" style={{ color: 'purple' }}></i>
          </div>
          // <svg height={ height } width="70%" style={{ marginLeft: '15%' }}>
          //   { Array.from(Array(10).keys()).map((i) => {
          //     return (
          //       <circle cx={ (Math.floor((Date.now() - this.startTime) / 1000)*20 + 50*i) % this.state.width } cy={ height / 2 } r={5} strokeWidth={10} stroke="#f00" fill="none" key={ i }/>
          //     )
          //   }) }
          // </svg>
        )
      default:
        return (
          <svg height={ height } width="100%">
          </svg>
        )
    }
  }


}



export default Panel


/*
let shapes = [{
  name: 'Circle',
  variables: ['radius']
}, {
  name: 'Slider',
  variables: ['value']
}]

shapes = [{
  name: 'Data',
  variables: ['month', 'temperature']
}, {
  name: 'Point',
  variables: ['x', 'y']
}]
*/