const socket = io.connect('http://localhost:8080/')

socket.on('buffer', function (buffer) {
  const canvas = document.getElementById('canvas-video')
  const context = canvas.getContext('2d')
  const img = new Image()
  const uint8Arr = new Uint8Array(buffer);
  const str = String.fromCharCode.apply(null, uint8Arr);
  const base64String = btoa(str);
  img.onload = function () {
    context.drawImage(this, 0, 0, canvas.width, canvas.height)
  }
  img.src = 'data:image/png;base64,' + base64String
})
