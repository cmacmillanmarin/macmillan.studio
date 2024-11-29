import {
  Vector2,
  PlaneGeometry,
  Mesh,
  ShaderMaterial,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
} from 'three'

import VS from './glsl/noise/vs.glsl'
import FS from './glsl/noise/fs.glsl'

class Noise {
  constructor() {
    this.debug = false

    this.ready = false
    this.canvas = null
    this.scene = null
    this.camera = null
    this.renderer = null
    this.noise = null

    this.z = 1000

    this.size = new Vector2()

    this.maxPixelRatio = 2
    this.rendering = false

    this.bind()
  }

  async create({ el, size }) {
    this.log(`create()`)

    this.canvas = el

    this.scene = new Scene()

    this.camera = new PerspectiveCamera(75, size.x / size.y, 100, 1250)
    this.camera.position.z = this.z

    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
    })
    this.renderer.setClearColor(0x000000, 0)

    this.createNoise()
    this.updateSize({ size })
    this.ready = true
  }

  render() {
    this.noise.material.uniforms.uFrame.value++
    this.noise.material.uniforms.uTime.value += 0.05

    this.renderer.render(this.scene, this.camera)
  }

  createNoise() {
    this.noise = new Mesh(
      new PlaneGeometry(1, 1),
      new ShaderMaterial({
        vertexShader: VS,
        fragmentShader: FS,
        uniforms: {
          uTime: { type: 'f', value: 0.0 },
          uFrame: { type: 'i', value: 0 },
          uOpacity: { type: 'f', value: 0.0 },
          uPlaneSize: { type: 'v2', value: new Vector2(1, 1) },
          uDevicePixelRatio: { type: 'f', value: 1.0 },
        },
        wireframe: false,
        transparent: true,
      })
    )
    this.scene.add(this.noise)
  }

  updateSize({ size }) {
    this.size = size
    this.camera.aspect = size.x / size.y
    this.camera.fov = 2 * Math.atan((size.y * 0.5) / this.z) * (180 / Math.PI)
    this.camera.updateProjectionMatrix()

    this.noise.scale.x = size.x
    this.noise.scale.y = size.y
    this.noise.scale.z = 1
    this.noise.material.uniforms.uPlaneSize.value.x = size.x
    this.noise.material.uniforms.uPlaneSize.value.y = size.y
    this.noise.material.uniforms.uDevicePixelRatio.value = this.getDevicePixelRatio()

    this.renderer.setSize(size.x, size.y)
    this.renderer.setPixelRatio(this.getDevicePixelRatio())

    this.log(`updateSize() w: ${size.x}, h: ${size.y}`)
  }

  getDevicePixelRatio() {
    return Math.min(window.devicePixelRatio, this.maxPixelRatio)
  }

  fromDomToCanvas({ x, y }) {
    const _x = x - this.size.x * 0.5
    const _y = -y + this.size.y * 0.5
    return { x: _x, y: _y }
  }

  updateOpacity(opacity) {
    this.noise.material.uniforms.uOpacity.value = opacity
  }

  toScale(n) {
    const mvw = Math.min(this.size.x, 1800)
    return (n * mvw) / (this.isMobileLayout ? 375 : 1440)
  }

  bind() {
    this._render = this.render.bind(this)
  }

  log(msg) {
    if (!this.debug) return
    console.log(`Scene ~ ${msg}`)
  }

  destroy() {
    this.log('destroy()')

    this.ready = false
    this.canvas.remove()
    this.canvas = null
    this.scene = null
    this.camera = null
    this.renderer = null
    this.noise = null
  }
}

export default Noise
