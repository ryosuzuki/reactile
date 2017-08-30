import 'semantic-ui-css/semantic.js'
import './style.css'

import React from 'react'
import { render } from 'react-dom'
import App from './components/App'
import configureStore from './redux/store'
import { Provider } from 'react-redux'


let initialStore = {
  markers: []
}

let store = configureStore(initialStore)

render(
  <Provider store={store}>
    <App store={store}/>
  </Provider>,
  document.getElementById('react-app')
)



$('#button').click((event) => {
  // if (window.markers.length === 0) return
  // let val = $('input').val()
  // let x = parseInt(val.split(',')[0])
  // let y = parseInt(val.split(',')[1])
  // console.log(x, y)
  // if (isNaN(x) || isNaN(y)) return
  let x = 10
  let y = 10
  let data = JSON.stringify({ x: x, y: y })
  $.ajax({
    type: 'POST',
    url: '/move',
    dataType: 'JSON',
    contentType: 'application/json',
    data: data,
    success: (data) => {
      console.log(data)
    }
  })
})


// socket.on('rect', (data) => {
//   let points = data.rect.map((point) => {
//     return { x: Math.floor(point.x), y: Math.floor(point.y) }
//   })
//   $('#rect').text(JSON.stringify(points, 2, null))
// })

