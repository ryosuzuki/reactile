import React, { Component } from 'react'
import _ from 'lodash'
import 'createjs'

class Panel extends Component {
  constructor() {
    super()
    this.app = app
    window.panel = this
    this.state = {
      width: 260,
      height: 220,
      margin: 10,
      selected: []
    }
  }

  componentDidMount() {
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
    return (
      <div id="panel" className="panel">
        { this.props.mappings.map((mapping, index) => {
          let id0 = _.values(mapping[0]).join('-')
          let id1 = _.values(mapping[1]).join('-')
          return (
            this.drawConnector(id0, id1, index)
          )
        }) }
        { this.props.shapes.map((shape, index) => {
          return (
            <div className="ui card" key={ index } style={{ width: '100%', height: this.state.height, margin: `${this.state.margin}px 0` }}>
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
                      className={ `ui button ${ this.includes(this.state.selected, { shapeId: shape.id, variable: variable }) ? 'orange' : 'teal' }` }
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

        <div className="ui card" style={{ display: (this.props.mappings.length > 0) ? 'block' : 'none', width: '100%', height: this.state.height, marginTop: `${this.state.margin*5}px` }}>
          <div className="content">
            <div className="header">Mapping</div>
          </div>
          <div className="content">
            { this.props.mappings.map((mapping, index) => {
              let name0 = this.getName(mapping[0])
              let name1 = this.getName(mapping[1])
              return (
                <div key={ index }>
                  <span className="ui teal large label">{ name0 }</span>
                  <span> = </span>
                  <span className="ui teal large label">{ name1 }</span>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    )
  }

  getName(info) {
    let shape = this.props.shapes[info.shapeId]
    return `${shape.type}.${info.variable}`
  }

  drawConnector(id1, id2, index) {
    let el1 = $(`#${id1}`)
    let el2 = $(`#${id2}`)
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

    let offset = 20 * (index + 1)
    let left = info1.x + info1.width
    let top = info1.y
    let height = Math.abs(info1.y - info2.y)

    let connector = {
      position: 'absolute',
      width: 0,
      height: height + 5,
      left: left + offset,
      top: top,
      zIndex: 1000,
      borderRight: '10px solid teal'
    }
    let topOffset = {
      position: 'absolute',
      width: offset + 10,
      height: 0,
      left: left,
      top: top - 5,
      zIndex: 1000,
      borderTop: '10px solid teal'
    }
    let bottomOffset = {
      position: 'absolute',
      width: offset + 10,
      height: 0,
      left: left,
      top: top + height - 5,
      zIndex: 1000,
      borderBottom: '10px solid teal'
    }

    return (
      <div key={ index }>
        <div style={ topOffset }></div>
        <div style={ connector }></div>
        <div style={ bottomOffset }></div>
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