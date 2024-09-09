import VS from './glsl/vs.glsl'
import FS from './glsl/fs.glsl'
import * as THREE from 'three'
import { round } from '~/utils'
import { gsap } from 'gsap'

class Scene {
  constructor() {
    this.debug = false

    this.ready = false
    this.canvas = null
    this.scene = null
    this.camera = null
    this.renderer = null

    this._play = null
    this._stop = null

    this.z = 1000

    this.size = new THREE.Vector2()
    this.mouse = new THREE.Vector2()
    this.raycaster = new THREE.Raycaster()
    this.loader = new THREE.TextureLoader()

    this.maxPixelRatio = 2
    this.rendering = false
    this.needsUpdate = false

    this.geometries = {
      plane: new THREE.PlaneGeometry(1, 1, 32, 32),
    }

    this.maxPlanes = 10
    this.batch = []

    this.objects = []

    this.bind()
  }

  async create({ el, size, play, stop }) {
    this.log(`create()`)

    this.canvas = el

    this._play = play
    this._stop = stop

    this.scene = new THREE.Scene()

    this.camera = new THREE.PerspectiveCamera(75, size.x / size.y, 100, 1250)
    this.camera.position.z = this.z

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
    })

    this.updateSize({ size })
    this.addListeners()
    this.ready = true
  }

  addObject(object) {
    this.log('addObject()')
    this.objects.push(object)
    !this.rendering && this.play()
  }

  getObject(id) {
    return this.objects.find(obj => obj.id === id)
  }

  updateObject({ id, fixed, position, size }) {
    this.log(`updateObject() ${JSON.stringify(position)}, ${JSON.stringify(size)}`)
    const object = this.getObject(id)
    if (object) {
      object.position = position || object.position
      object.size = size || object.size
      object.fixed = fixed || object.fixed
    }
  }

  removeObject(id) {
    const index = this.objects.findIndex(object => object.id === id)
    const object = this.objects[index]
    if (object?.mesh) {
      gsap.killTweensOf(object.mesh.material.uniforms.uOpacity)
      gsap.to(object.mesh.material.uniforms.uOpacity, {
        value: 0.0,
        duration: 0.2,
        ease: 'power1.out',
        onComplete: () => {
          object.mesh.geometry.dispose()
          object.mesh.material.dispose()
          this.scene.remove(object.mesh)
          this.renderer.renderLists.dispose()
          this.objects.splice(index, 1)
        },
      })
    }
    this.rendering && this.objects.length === 0 && this.stop()
  }

  updateY(y) {
    this.y = y
    this.camera.position.y = this.y * -1
  }

  updateObjects() {
    this.needsUpdate = false
    for (const object of this.objects) {
      if (object.inView) {
        this.needsUpdate = true
        if (!object.mesh) {
          if (object.type === 'plane') {
            const availablePlane = this.getAvailablePlane(object.id)
            if (!availablePlane) {
              console.warn(`No available planes for ${object.id}`)
              continue
            }
            object.mesh = availablePlane.mesh
            object.meshId = availablePlane.id
            object.mesh.material.uniforms.uNoise.value = object.id === 'noise' ? 1 : 0
            if (object.video) {
              object.mesh.material.uniforms.uTextureType.value = 0
              object.mesh.material.uniforms.uTextureVideo.value.image = object.video
              object.mesh.material.uniforms.uTextureSize.value.x = object.size.x
              object.mesh.material.uniforms.uTextureSize.value.y =
                (object.size.x * object.video.height) / object.video.width
            } else if (object.img) {
              object.mesh.material.uniforms.uTextureSize.value.x = object.img.width
              object.mesh.material.uniforms.uTextureSize.value.y = object.img.height
              object.mesh.material.uniforms.uTextureImage.value = this.loader.load(object.img.src)
              object.mesh.material.uniforms.uTextureType.value = 1
            }
          } else {
            object.mesh = this.getMesh(object.type)
            this.scene.add(object.mesh)
          }
          this.planeIn(object.mesh.material.uniforms.uOpacity)
        }

        const position = this.fromDomToCanvas({
          x: object.position.x,
          y: object.position.y + this.getFixedY(object.fixed),
        })

        object.mesh.position.x = position.x + object.size.x * 0.5
        object.mesh.position.y = position.y - object.size.y * 0.5
        object.mesh.scale.x = object.size.x
        object.mesh.scale.y = object.size.y
        object.mesh.scale.z = object.size.z
        object.mesh.material.uniforms.uTime.value += 0.05
        const xPixelRatio = object.size.x / round(object.size.x / this.toScale(18))
        const yPixelRatio = object.size.y / round(object.size.y / this.toScale(18))
        object.mesh.material.uniforms.uPixelSize.value.x = object.size.x / xPixelRatio
        object.mesh.material.uniforms.uPixelSize.value.y = object.size.y / yPixelRatio
        object.mesh.material.uniforms.uPlaneSize.value.x = object.size.x
        object.mesh.material.uniforms.uPlaneSize.value.y = object.size.y
        object.mesh.material.uniforms.uTextureVideo.value.needsUpdate =
          object.video?.readyState >= object.video?.HAVE_CURRENT_DATA
      } else if (object.mesh && object.type === 'plane') {
        object.mesh.material.uniforms.uOpacity.value = 0.0
        this.releasePlane(object.meshId)
        object.mesh = null
      }
      object.inView = this.inView(object)
    }
  }

  inView({ fixed, position, size }) {
    const y = position.y + this.getFixedY(fixed)
    const limitTop = y - this.y >= size.y * -1
    const limitRight = position.x < this.size.x
    const limitBottom = y - this.y < this.size.y
    const limitLeft = position.x + size.x > size.x * -1

    return limitTop && limitRight && limitBottom && limitLeft
  }

  getFixedY(fixed) {
    if (fixed && this.y >= fixed.from) {
      const { from, to } = fixed
      return Math.min(this.y - from, to - from)
    }
    return 0
  }

  render() {
    this.updateObjects()

    if (this.needsUpdate) {
      this.log('render()')
      this.renderer.render(this.scene, this.camera)
    }
  }

  play() {
    if (this.rendering) return
    this.log('play()')
    // this._play(this._render)
    this.rendering = true
  }

  stop() {
    if (!this.rendering) return
    this.log('stop()')
    // this._stop(this._render)
    this.rendering = false
  }

  getAvailablePlane(id) {
    if (this.batch.length === 0) {
      this.generatePlanesBatch()
    }
    if (id === 'noise') {
      const plane = this.batch[this.batch.length - 1]
      plane.available = false
      plane.mesh.visible = true
      return plane
    }
    for (let i = this.batch.length - 1; i >= 0; i--) {
      const plane = this.batch[i]
      if (plane.available) {
        this.log(`Object ${id} gets available plane ${plane.id}`)
        plane.available = false
        plane.mesh.visible = true
        return plane
      }
    }

    this.log('Error! NO PLANES AVAILABLE')
  }

  releasePlane(id) {
    this.log(`Plane ${id} released`)
    const plane = this.batch.find(p => p.id === id)
    plane.available = true
    plane.mesh.visible = false
  }

  generatePlanesBatch() {
    const video = document.createElement('video')
    const videoTexture = new THREE.VideoTexture(video)

    for (let id = 0; id < this.maxPlanes; id++) {
      const available = true
      const mesh = new THREE.Mesh(
        this.geometries.plane,
        new THREE.ShaderMaterial({
          vertexShader: VS,
          fragmentShader: FS,
          uniforms: {
            uNoise: { type: 'i', value: 0 },
            uTime: { type: 'f', value: 0.0 },
            uOpacity: { type: 'f', value: 0.0 },
            uPixel: { type: 'f', value: 0.0 },
            uPixelSize: { type: 'v2', value: new THREE.Vector2(1, 1) },
            uTextureType: { type: 'i', value: 0 }, // 0 Video, 1 Image
            uTextureImage: { type: 't', value: null },
            uTextureVideo: { type: 't', value: videoTexture },
            uTextureSize: { type: 'v2', value: new THREE.Vector2(1, 1) },
            uPlaneSize: { type: 'v2', value: new THREE.Vector2(1, 1) },
          },
          wireframe: false,
          transparent: true,
        })
      )
      mesh.visible = false
      this.scene.add(mesh)
      this.batch.push({ id, available, mesh })
    }
  }

  updateSize({ size }) {
    this.size = size
    this.camera.aspect = size.x / size.y
    this.camera.fov = 2 * Math.atan((size.y * 0.5) / this.z) * (180 / Math.PI)
    this.camera.updateProjectionMatrix()

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

  getMesh(type) {
    this.log(`getMesh(${type})`)
    return new THREE.Mesh(
      this.geometries[type],
      new THREE.ShaderMaterial({
        vertexShader: VS,
        fragmentShader: FS,
        uniforms: {
          uOpacity: { type: 'f', value: 0.0 },
        },
        wireframe: true,
        transparent: true,
      })
    )
  }

  toScale(n) {
    const mvw = Math.min(this.size.x, 1920) // Check layout max width
    return (n * mvw) / 1440
  }

  planeIn(prop) {
    gsap.killTweensOf(prop)
    const duration = 1
    gsap.to(prop, { value: 1, duration, ease: 'power1.in' })
  }

  onMouseMovement(e) {
    this.mouse.x = (e.clientX / this.size.x) * 2 - 1
    this.mouse.y = (e.clientY / this.size.y) * 2 - 1
    this.raycaster.setFromCamera(this.mouse, this.camera)
  }

  bind() {
    this._play = this.play.bind(this)
    this._stop = this.stop.bind(this)
    this._render = this.render.bind(this)
    this._onMouseMovement = this.onMouseMovement.bind(this)
  }

  addListeners() {
    // window.addEventListener('focus', this._play)
    // window.addEventListener('blur', this._stop)
    window.addEventListener('mousemove', this._onMouseMovement)
  }

  removeListeners() {
    // window.removeEventListener('focus', this._play)
    // window.removeEventListener('blur', this._stop)
    window.removeEventListener('mousemove', this._onMouseMovement)
  }

  log(msg) {
    if (!this.debug) return
    console.log(`Scene ~ ${msg}`)
  }

  destroy() {
    this.log('destroy()')

    this.ready = false
    this.stop()
    this.canvas.remove()
    this.canvas = null
    this.scene = null
    this.renderer = null
    this.camera = null
    this.objects = []
    for (const i in this.batch) {
      this.batch[i] = null
      delete this.batch[i]
    }

    this.removeListeners()
  }
}

export default Scene
