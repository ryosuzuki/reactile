const munkres = require('munkres-js');


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
