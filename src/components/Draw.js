
class Draw {
  constructor() {
    window.draw = this
  }

  init() {
    this.app = app
    this.drawing = false
    this.stroke = []
    this.detector = new ShapeDetector(ShapeDetector.defaultShapes)

    // this.detector.learn('triangle', triangle1)
    // this.detector.learn('triangle', triangle2)
    // this.detector.learn('triangle', triangle3)
    // this.detector.learn('triangle', triangle4)
    // this.detector.learn('triangle', triangle5)
    // this.detector.learn('triangle', triangle6)

    this.line = new createjs.Shape()
    this.app.stage.addChild(this.line)

    this.app.stage.on('stagemousedown', this.start.bind(this))
    this.app.stage.on('stagemousemove', this.draw.bind(this))
    this.app.stage.on('stagemouseup', this.end.bind(this))


  }

  start() {
    if (stroke) {
      let index = 0
      const timer = setInterval(() => {
        let prev = stroke[index]
        let current = stroke[index+1]
        this.line.graphics.beginStroke('#0f0')
        this.line.graphics.setStrokeStyle(3)
        this.line.graphics.moveTo(prev.x, prev.y)
        this.line.graphics.lineTo(current.x, current.y)
        this.app.update = true
        index++
        if (index >= stroke.length-1) {
          clearInterval(timer)
          this.line.graphics.endStroke()
          this.stroke = stroke
          this.beautify()
        }
      }, 15)
      return
    }


    if (this.app.state.mode === '') {
      console.log('click')
      shape.x = Math.round(this.app.stage.mouseX / this.app.offsetX)
      shape.y = Math.round(this.app.stage.mouseY / this.app.offsetY)
      shape.init()
    }

    if (this.app.state.mode === 'constraint') {

    }
    if (this.app.state.mode !== 'draw') return
    this.drawing = true
    this.stroke = []
    this.line.graphics.clear()
  }

  draw(event) {
    if (!this.drawing) return
    console.log('stage move')

    this.stroke.push({
      x: this.app.stage.mouseX,
      y: this.app.stage.mouseY
    })

    let prev = this.stroke.slice(-2)[0]
    let current = this.stroke.slice(-2)[1]
    if (!current) return

    this.line.graphics.beginStroke('#0f0')
    this.line.graphics.setStrokeStyle(3)
    this.line.graphics.moveTo(prev.x, prev.y)
    this.line.graphics.lineTo(current.x, current.y)
    this.app.update = true
  }

  end() {
    if (!this.drawing) return
    this.drawing = false
    this.prev = null
    this.line.graphics.endStroke()

    console.log(this.stroke)

    this.beautify()
  }

  beautify() {
    this.line.graphics.clear()
    this.app.update = true
    if (this.stroke.length < 2) return

    let detect = this.detector.spot(this.stroke)
    console.log(detect)

    let x = this.stroke.map(p => p.x)
    let y = this.stroke.map(p => p.y)
    let maxX = Math.max(...x)
    let minX = Math.min(...x)
    let maxY = Math.max(...y)
    let minY = Math.min(...y)

    // let shape = this.app.props.shapes[this.app.currentId]
    let shape = this.app.shape
    switch (detect.pattern) {
      case 'circle':
        let radius = (maxX + maxY - minX - minY) / 4
        let x = (maxX + minX) / 2
        let y = (maxY + minY) / 2
        shape.initFromCanvas({
          type: 'circle',
          radius: radius,
          x: x,
          y: y
        })
        break
      case 'square':
        let width = maxX - minX
        let height = maxY - minY
        shape.initFromCanvas({
          type: 'rect',
          x: minX,
          y: minY,
          width: width,
          height: height,
        })
        break
      case 'triangle':
        shape.initFromCanvas({
          type: 'triangle',
          x: (maxX + minX) / 2,
          y: (maxY + minY) / 2,
          points: [
            { x: (maxX + minX) / 2, y: minY },
            { x: minX, y: maxY },
            { x: maxX, y: maxY }
          ],
        })
        break
      default:
        break
    }
  }

}

export default Draw


let triangle1 = [{ x: 130, y: 131 }, { x: 129, y: 133 }, { x: 128, y: 135 }, { x: 126, y: 138 }, { x: 125, y: 140 }, { x: 123, y: 144 }, { x: 121, y: 147 }, { x: 119, y: 150 }, { x: 118, y: 152 }, { x: 115, y: 155 }, { x: 113, y: 158 }, { x: 110, y: 162 }, { x: 108, y: 164 }, { x: 105, y: 167 }, { x: 101, y: 172 }, { x: 98, y: 176 }, { x: 94, y: 181 }, { x: 91, y: 185 }, { x: 89, y: 188 }, { x: 85, y: 194 }, { x: 82, y: 196 }, { x: 80, y: 199 }, { x: 77, y: 202 }, { x: 74, y: 204 }, { x: 72, y: 207 }, { x: 68, y: 213 }, { x: 66, y: 215 }, { x: 64, y: 217 }, { x: 60, y: 222 }, { x: 58, y: 224 }, { x: 56, y: 226 }, { x: 55, y: 228 }, { x: 53, y: 230 }, { x: 55, y: 230 }, { x: 57, y: 229 }, { x: 59, y: 229 }, { x: 62, y: 229 }, { x: 64, y: 229 }, { x: 68, y: 227 }, { x: 73, y: 227 }, { x: 76, y: 227 }, { x: 79, y: 225 }, { x: 84, y: 223 }, { x: 94, y: 223 }, { x: 101, y: 221 }, { x: 107, y: 222 }, { x: 109, y: 222 }, { x: 118, y: 220 }, { x: 121, y: 220 }, { x: 132, y: 218 }, { x: 141, y: 217 }, { x: 152, y: 216 }, { x: 161, y: 215 }, { x: 167, y: 216 }, { x: 176, y: 218 }, { x: 182, y: 219 }, { x: 187, y: 219 }, { x: 191, y: 219 }, { x: 193, y: 219 }, { x: 195, y: 218 }, { x: 196, y: 216 }, { x: 197, y: 213 }, { x: 196, y: 211 }, { x: 194, y: 207 }, { x: 189, y: 200 }, { x: 187, y: 198 }, { x: 185, y: 196 }, { x: 178, y: 189 }, { x: 174, y: 184 }, { x: 167, y: 175 }, { x: 163, y: 168 }, { x: 157, y: 160 }, { x: 155, y: 157 }, { x: 149, y: 149 }, { x: 145, y: 141 }, { x: 142, y: 136 }, { x: 138, y: 131 }, { x: 136, y: 131 }]

let triangle2 = [{ x: 127, y: 138 }, { x: 127, y: 140 }, { x: 127, y: 143 }, { x: 126, y: 145 }, { x: 125, y: 148 }, { x: 124, y: 151 }, { x: 123, y: 154 }, { x: 121, y: 158 }, { x: 119, y: 163 }, { x: 116, y: 168 }, { x: 113, y: 173 }, { x: 109, y: 178 }, { x: 105, y: 183 }, { x: 104, y: 186 }, { x: 100, y: 191 }, { x: 98, y: 193 }, { x: 95, y: 197 }, { x: 91, y: 202 }, { x: 90, y: 205 }, { x: 88, y: 207 }, { x: 86, y: 210 }, { x: 82, y: 216 }, { x: 80, y: 220 }, { x: 78, y: 222 }, { x: 75, y: 227 }, { x: 73, y: 229 }, { x: 72, y: 232 }, { x: 70, y: 233 }, { x: 69, y: 235 }, { x: 67, y: 237 }, { x: 69, y: 239 }, { x: 71, y: 239 }, { x: 73, y: 238 }, { x: 79, y: 234 }, { x: 82, y: 233 }, { x: 89, y: 231 }, { x: 97, y: 229 }, { x: 103, y: 228 }, { x: 111, y: 228 }, { x: 118, y: 229 }, { x: 128, y: 230 }, { x: 135, y: 227 }, { x: 137, y: 226 }, { x: 143, y: 224 }, { x: 150, y: 222 }, { x: 157, y: 220 }, { x: 161, y: 221 }, { x: 166, y: 221 }, { x: 169, y: 222 }, { x: 171, y: 222 }, { x: 176, y: 224 }, { x: 178, y: 223 }, { x: 180, y: 223 }, { x: 182, y: 223 }, { x: 184, y: 222 }, { x: 183, y: 220 }, { x: 182, y: 218 }, { x: 180, y: 216 }, { x: 174, y: 210 }, { x: 170, y: 205 }, { x: 166, y: 199 }, { x: 160, y: 190 }, { x: 158, y: 184 }, { x: 156, y: 181 }, { x: 152, y: 176 }, { x: 148, y: 167 }, { x: 143, y: 160 }, { x: 141, y: 154 }, { x: 137, y: 150 }, { x: 134, y: 146 }, { x: 132, y: 144 }]

let triangle3 = [{ x: 139, y: 138 }, { x: 138, y: 140 }, { x: 138, y: 143 }, { x: 136, y: 146 }, { x: 135, y: 149 }, { x: 133, y: 152 }, { x: 132, y: 154 }, { x: 131, y: 157 }, { x: 130, y: 160 }, { x: 127, y: 164 }, { x: 124, y: 167 }, { x: 122, y: 171 }, { x: 120, y: 173 }, { x: 115, y: 179 }, { x: 111, y: 184 }, { x: 107, y: 188 }, { x: 104, y: 192 }, { x: 98, y: 198 }, { x: 97, y: 201 }, { x: 94, y: 204 }, { x: 91, y: 207 }, { x: 87, y: 211 }, { x: 85, y: 214 }, { x: 82, y: 217 }, { x: 80, y: 219 }, { x: 77, y: 222 }, { x: 75, y: 223 }, { x: 74, y: 225 }, { x: 72, y: 227 }, { x: 71, y: 229 }, { x: 71, y: 232 }, { x: 73, y: 232 }, { x: 75, y: 232 }, { x: 77, y: 232 }, { x: 80, y: 231 }, { x: 82, y: 232 }, { x: 85, y: 232 }, { x: 89, y: 231 }, { x: 94, y: 229 }, { x: 97, y: 229 }, { x: 103, y: 228 }, { x: 109, y: 227 }, { x: 116, y: 227 }, { x: 123, y: 226 }, { x: 126, y: 225 }, { x: 129, y: 225 }, { x: 136, y: 225 }, { x: 140, y: 224 }, { x: 143, y: 223 }, { x: 152, y: 223 }, { x: 158, y: 221 }, { x: 165, y: 221 }, { x: 170, y: 221 }, { x: 175, y: 221 }, { x: 180, y: 222 }, { x: 184, y: 221 }, { x: 189, y: 221 }, { x: 191, y: 221 }, { x: 193, y: 221 }, { x: 195, y: 221 }, { x: 194, y: 218 }, { x: 193, y: 216 }, { x: 191, y: 211 }, { x: 190, y: 209 }, { x: 186, y: 205 }, { x: 184, y: 202 }, { x: 178, y: 196 }, { x: 175, y: 191 }, { x: 168, y: 185 }, { x: 164, y: 180 }, { x: 157, y: 175 }, { x: 152, y: 169 }, { x: 149, y: 167 }, { x: 144, y: 159 }, { x: 141, y: 155 }, { x: 138, y: 151 }, { x: 136, y: 149 }, { x: 134, y: 148 }, { x: 133, y: 145 }]

let triangle4 = [{ x: 134, y: 127 }, { x: 132, y: 130 }, { x: 130, y: 132 }, { x: 128, y: 136 }, { x: 127, y: 138 }, { x: 125, y: 142 }, { x: 123, y: 145 }, { x: 122, y: 147 }, { x: 120, y: 149 }, { x: 118, y: 154 }, { x: 115, y: 157 }, { x: 112, y: 163 }, { x: 108, y: 166 }, { x: 105, y: 171 }, { x: 104, y: 173 }, { x: 100, y: 176 }, { x: 97, y: 180 }, { x: 93, y: 183 }, { x: 90, y: 187 }, { x: 87, y: 191 }, { x: 84, y: 194 }, { x: 78, y: 200 }, { x: 76, y: 203 }, { x: 73, y: 205 }, { x: 69, y: 211 }, { x: 66, y: 212 }, { x: 64, y: 216 }, { x: 63, y: 218 }, { x: 61, y: 220 }, { x: 59, y: 223 }, { x: 58, y: 225 }, { x: 55, y: 228 }, { x: 53, y: 230 }, { x: 52, y: 233 }, { x: 50, y: 235 }, { x: 53, y: 237 }, { x: 55, y: 236 }, { x: 57, y: 235 }, { x: 59, y: 235 }, { x: 61, y: 234 }, { x: 63, y: 234 }, { x: 67, y: 233 }, { x: 72, y: 232 }, { x: 78, y: 230 }, { x: 83, y: 229 }, { x: 90, y: 228 }, { x: 96, y: 229 }, { x: 103, y: 227 }, { x: 111, y: 227 }, { x: 118, y: 226 }, { x: 123, y: 226 }, { x: 127, y: 226 }, { x: 134, y: 225 }, { x: 144, y: 225 }, { x: 149, y: 225 }, { x: 152, y: 225 }, { x: 159, y: 225 }, { x: 167, y: 225 }, { x: 170, y: 225 }, { x: 177, y: 226 }, { x: 186, y: 227 }, { x: 191, y: 227 }, { x: 196, y: 228 }, { x: 198, y: 227 }, { x: 200, y: 226 }, { x: 205, y: 225 }, { x: 207, y: 225 }, { x: 209, y: 225 }, { x: 210, y: 223 }, { x: 209, y: 220 }, { x: 208, y: 218 }, { x: 207, y: 216 }, { x: 203, y: 210 }, { x: 200, y: 205 }, { x: 196, y: 200 }, { x: 192, y: 196 }, { x: 190, y: 194 }, { x: 184, y: 187 }, { x: 177, y: 182 }, { x: 169, y: 173 }, { x: 164, y: 169 }, { x: 159, y: 163 }, { x: 156, y: 159 }, { x: 151, y: 155 }, { x: 149, y: 153 }, { x: 147, y: 151 }, { x: 145, y: 148 }, { x: 143, y: 144 }, { x: 141, y: 142 }, { x: 139, y: 138 }, { x: 136, y: 136 }, { x: 134, y: 132 }, { x: 133, y: 129 }]

let triangle5 = [{ x: 140, y: 131 }, { x: 139, y: 133 }, { x: 138, y: 135 }, { x: 136, y: 138 }, { x: 135, y: 141 }, { x: 133, y: 144 }, { x: 131, y: 147 }, { x: 128, y: 149 }, { x: 127, y: 152 }, { x: 124, y: 157 }, { x: 122, y: 159 }, { x: 118, y: 164 }, { x: 114, y: 167 }, { x: 110, y: 171 }, { x: 107, y: 176 }, { x: 103, y: 179 }, { x: 100, y: 182 }, { x: 97, y: 185 }, { x: 94, y: 188 }, { x: 90, y: 191 }, { x: 89, y: 193 }, { x: 84, y: 200 }, { x: 81, y: 203 }, { x: 78, y: 206 }, { x: 74, y: 212 }, { x: 72, y: 214 }, { x: 69, y: 219 }, { x: 67, y: 222 }, { x: 65, y: 224 }, { x: 62, y: 227 }, { x: 60, y: 229 }, { x: 58, y: 232 }, { x: 56, y: 234 }, { x: 54, y: 237 }, { x: 52, y: 239 }, { x: 49, y: 243 }, { x: 47, y: 245 }, { x: 45, y: 247 }, { x: 47, y: 248 }, { x: 49, y: 247 }, { x: 52, y: 247 }, { x: 54, y: 245 }, { x: 57, y: 245 }, { x: 62, y: 243 }, { x: 64, y: 242 }, { x: 69, y: 240 }, { x: 75, y: 240 }, { x: 81, y: 239 }, { x: 88, y: 239 }, { x: 93, y: 238 }, { x: 102, y: 238 }, { x: 109, y: 237 }, { x: 117, y: 237 }, { x: 122, y: 235 }, { x: 132, y: 236 }, { x: 139, y: 235 }, { x: 147, y: 236 }, { x: 149, y: 237 }, { x: 156, y: 237 }, { x: 163, y: 238 }, { x: 170, y: 239 }, { x: 173, y: 238 }, { x: 179, y: 239 }, { x: 185, y: 239 }, { x: 193, y: 240 }, { x: 195, y: 241 }, { x: 198, y: 241 }, { x: 200, y: 241 }, { x: 204, y: 240 }, { x: 206, y: 240 }, { x: 206, y: 238 }, { x: 204, y: 236 }, { x: 201, y: 233 }, { x: 199, y: 230 }, { x: 195, y: 225 }, { x: 191, y: 220 }, { x: 186, y: 211 }, { x: 180, y: 203 }, { x: 177, y: 198 }, { x: 172, y: 192 }, { x: 170, y: 190 }, { x: 163, y: 184 }, { x: 159, y: 180 }, { x: 154, y: 176 }, { x: 149, y: 172 }, { x: 147, y: 170 }, { x: 143, y: 164 }, { x: 138, y: 157 }, { x: 135, y: 150 }, { x: 134, y: 148 }, { x: 131, y: 144 }, { x: 129, y: 142 }]

let triangle6 = [{ x: 141, y: 127 }, { x: 139, y: 129 }, { x: 138, y: 131 }, { x: 136, y: 133 }, { x: 134, y: 137 }, { x: 132, y: 140 }, { x: 130, y: 143 }, { x: 127, y: 146 }, { x: 124, y: 150 }, { x: 121, y: 155 }, { x: 118, y: 158 }, { x: 114, y: 163 }, { x: 110, y: 168 }, { x: 106, y: 173 }, { x: 99, y: 181 }, { x: 95, y: 186 }, { x: 89, y: 192 }, { x: 86, y: 197 }, { x: 81, y: 203 }, { x: 79, y: 205 }, { x: 73, y: 213 }, { x: 71, y: 215 }, { x: 69, y: 218 }, { x: 66, y: 222 }, { x: 64, y: 226 }, { x: 62, y: 228 }, { x: 59, y: 232 }, { x: 58, y: 234 }, { x: 57, y: 237 }, { x: 56, y: 239 }, { x: 55, y: 241 }, { x: 57, y: 243 }, { x: 59, y: 245 }, { x: 61, y: 245 }, { x: 64, y: 245 }, { x: 66, y: 245 }, { x: 68, y: 244 }, { x: 70, y: 243 }, { x: 75, y: 242 }, { x: 78, y: 242 }, { x: 81, y: 241 }, { x: 87, y: 241 }, { x: 94, y: 240 }, { x: 101, y: 240 }, { x: 108, y: 240 }, { x: 114, y: 239 }, { x: 121, y: 238 }, { x: 124, y: 238 }, { x: 130, y: 238 }, { x: 137, y: 239 }, { x: 144, y: 239 }, { x: 154, y: 237 }, { x: 161, y: 239 }, { x: 170, y: 238 }, { x: 176, y: 238 }, { x: 185, y: 239 }, { x: 190, y: 239 }, { x: 197, y: 239 }, { x: 200, y: 239 }, { x: 202, y: 239 }, { x: 204, y: 237 }, { x: 202, y: 235 }, { x: 201, y: 233 }, { x: 198, y: 227 }, { x: 195, y: 222 }, { x: 194, y: 220 }, { x: 191, y: 215 }, { x: 187, y: 210 }, { x: 185, y: 206 }, { x: 179, y: 198 }, { x: 176, y: 192 }, { x: 172, y: 184 }, { x: 167, y: 176 }, { x: 161, y: 170 }, { x: 157, y: 166 }, { x: 151, y: 160 }, { x: 147, y: 155 }, { x: 144, y: 147 }, { x: 141, y: 143 }, { x: 137, y: 138 }, { x: 136, y: 136 }, { x: 134, y: 134 }]
