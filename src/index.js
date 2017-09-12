import 'semantic-ui-css/semantic.js'
// import 'maptastic/build/maptastic.js'
import 'jsplumb/dist/js/jsplumb.js'
import 'jsplumb/dist/css/jsplumbtoolkit-defaults.css'
import './style.css'

import React from 'react'
import { render } from 'react-dom'
import App from './components/App'
import configureStore from './redux/store'
import { Provider } from 'react-redux'


let initialStore = {
  markers: [],
  shapes: [],
  mappings: []
}

let store = configureStore(initialStore)

render(
  <Provider store={store}>
    <App store={store}/>
  </Provider>,
  document.getElementById('react-app')
)