import {
  Box3,
  Vector2,
  Vector3,
  Vector4,
  Raycaster,
  TextureLoader,
  PlaneGeometry,
  Mesh,
  ShaderMaterial,
  VideoTexture,
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  DirectionalLight,
} from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { gsap } from 'gsap/gsap-core'
import { round, slugify, videoLoaded } from '~/utils'

import VS from './glsl/vs.glsl'
import FS from './glsl/fs.glsl'

class Controller {
  constructor() {
    this.debug = false

    this.ready = false
    this.active = false
    this.canvas = null
    this.scene = null
    this.camera = null
    this.renderer = null
    this.main = null
    this.frame = 0
    this.isMobileLayout = false

    this.logo = null
    this.logoScene = null
    this.logoCamera = null
    this.logoLight = null
    this.logoSize = 160
    this.logoScale = 1
    this.logoAnimation = {
      value: 0,
    }
    this.logoMargin =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--layout-margin')) *
      10

    this.touch = !!window.getComputedStyle(document.body, ':after').getPropertyValue('--touch')
    this.touchStartX = 0
    this.touchStartY = 0
    this.touchTime = 0

    this.bounding = 0
    this.scrollBounding = 0

    this._onClick = null
    this._onMouseMovement = null

    this.z = 1000

    this.size = new Vector2()
    this.mouse = new Vector2(-1000, -1000)
    this.raycaster = new Raycaster()
    this.loader = new TextureLoader()
    this.loadedTextures = []
    this.loadedTexturesCount = 0
    this.onPreloaded = () => {
      console.log('Textures preloaded!')
    }
    this.updateCursor = value => {
      console.log(`Update cursor to ${value}`)
    }

    this.maxPixelRatio = 2
    this.rendering = false
    this.needsUpdate = false

    this.geometries = {
      plane: new PlaneGeometry(1, 1, 32, 32),
    }

    this.colors = {
      white: new Vector4(1.0, 1.0, 1.0, 1.0),
      lime: new Vector4(197.0 / 255.0, 255.0 / 255.0, 32.0 / 255.0, 1.0),
      lightGrey: new Vector4(211.0 / 255.0, 214.0 / 255.0, 218.0 / 255.0, 1.0),
      darkGrey: new Vector4(129.0 / 255.0, 131.0 / 255.0, 136.0 / 255.0, 1.0),
    }

    this.maxPlanes = 10
    this.batch = []
    this.loaderRequests = 0

    this.objects = []

    this.intersects = []

    this.bind()
  }

  async create({ el, size, onPreloaded, updateCursor }) {
    this.log(`create()`)

    this.main = document.querySelector('main')

    this.canvas = el

    this.scene = new Scene()
    this.logoScene = new Scene()

    this.camera = new PerspectiveCamera(75, size.x / size.y, 100, 1250)
    this.camera.position.z = this.z

    this.logoCamera = new PerspectiveCamera(75, size.x / size.y, 100, 1250)
    this.logoCamera.position.z = this.z

    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
      sortObjects: true,
    })
    this.renderer.setClearColor(0x000000, 0)
    this.renderer.autoClear = false

    this.onPreloaded = onPreloaded || this.onPreloaded
    this.updateCursor = updateCursor || this.updateCursor

    this.updateSize({ size })
    this.addListeners()
    this.generatePlanesBatch()
    this.ready = true

    const loader = new GLTFLoader()
    loader.load('./assets/gltf/logo.gltf', async gltf => {
      this.logo = gltf.scene.children[0].children[0].children[0]
      this.logo.scale.set(1, 1, 1)
      this.logo.rotation.set(0, 0, 0)
      this.logo.position.set(0, 0, 0)
      this.updateLogoScale()

      this.logoLight = new DirectionalLight(0xffffff, 0)
      this.logoLight.position.set(1, 1, 1)

      this.logoScene.add(this.logoLight)
      this.logoScene.add(this.logo)
      this.onPreloaded()
    })
  }

  preload(img) {
    const src = img.src || img.currentSrc
    const id = slugify(src)
    const exists = this.loadedTextures.find(t => t.id === id)
    if (img && !exists && this.loaderRequests < 2) {
      this.loaderRequests++
      this.loadedTextures.push({
        id,
        ready: false,
        txt: this.loader.load(img.src || img.currentSrc, async texture => {
          await this.renderer.initTexture(texture)
          this.loaderRequests--
          const loadedTexture = this.loadedTextures.find(t => t.id === id)
          loadedTexture.ready = true
          this.loadedTexturesCount++
          // if (this.loadedTexturesCount === this.loadedTextures.length) this.onPreloaded()
        }),
      })
    }
  }

  addObject(object) {
    this.log('addObject()')

    object.onClick = object.onClick || null
    object.onIntersect = object.onIntersect || null
    object.border = object.border || 0
    object.fade = object.fade || false
    object.position = object.position || { x: 0, y: 0 }
    object.parallax = object.parallax || { x: 0, y: 0 }
    object.size = object.size || { x: 0, y: 0, z: 1 }
    object.rotate = object.rotate || { x: 0, y: 0, z: 0 }
    object.zoom = object.zoom || 1
    object.order = object.order || 0
    object.cursor = object.cursor || 'plus'
    object.opacity = object.opacity !== undefined ? object.opacity : 1
    object.textureFade = object.textureFade !== undefined ? object.textureFade : null
    object.multiplyColor = object.multiplyColor || null
    object.color = object.color || null
    object.noPixel = !!object.noPixel
    object.blackAndWhite = !!object.blackAndWhite
    this.objects.push(object)
  }

  getObject(id) {
    return this.objects.find(obj => obj.id === id)
  }

  updateObject({
    id,
    fixed,
    position,
    parallax,
    opacity,
    rotate,
    zoom,
    size,
    cursor,
    fade,
    img,
    video,
    border,
    order,
    multiplyColor,
    color,
    textureFade,
    noPixel,
    blackAndWhite,
    forcePixelated,
    onClick,
    onIntersect,
  }) {
    this.log(`updateObject() ${id}`)
    const object = this.getObject(id)
    if (object) {
      object.zoom = zoom !== undefined ? zoom : object.zoom
      object.border = border !== undefined ? border : object.border
      object.position = position || object.position
      object.parallax = parallax || object.parallax
      object.rotate = rotate || object.rotate
      object.img = img || object.img
      object.video = video || object.video
      object.size = size || object.size
      object.fade = fade !== undefined ? fade : object.fade
      object.fixed = fixed || object.fixed
      object.order = order !== undefined ? order : object.order
      object.opacity = opacity !== undefined ? opacity : object.opacity
      object.onClick = onClick !== undefined ? onClick : object.onClick
      object.multiplyColor = multiplyColor || object.multiplyColor
      object.color = color || object.color
      object.textureFade = textureFade !== undefined ? textureFade : object.textureFade
      object.cursor = cursor || object.cursor
      object.noPixel = noPixel !== undefined ? noPixel : object.noPixel
      object.blackAndWhite = blackAndWhite !== undefined ? blackAndWhite : object.blackAndWhite
      object.forcePixelated = forcePixelated !== undefined ? forcePixelated : object.forcePixelated
      object.onIntersect = onIntersect !== undefined ? onIntersect : object.onIntersect
    }
  }

  removeObject({ id }) {
    if (!this.objects) return
    const index = this.objects.findIndex(object => object.id === id)
    const object = this.objects[index]
    if (!object) return
    if (object.mesh) {
      gsap.killTweensOf(object.mesh.material.uniforms.uFade)
      gsap.to(object.mesh.material.uniforms.uFade, {
        value: 0.0,
        duration: 0.2,
        ease: 'power1.out',
        onComplete: () => {
          const index = this.objects.findIndex(object => object.id === id)
          const object = this.objects[index]
          this.releasePlane(object.meshId)
          this.objects.splice(index, 1)
        },
      })
    } else if (index !== -1) {
      this.objects.splice(index, 1)
    }
  }

  updateY(y) {
    this.y = y
    this.camera.position.y = this.y * -1
    this.raycaster.setFromCamera(this.mouse, this.camera)
  }

  updateObjects() {
    this.needsUpdate = false

    for (const object of this.objects) {
      object.inView = this.inView(object)
      let texture = null

      if (object.inView) {
        if (!object.mesh) {
          const availablePlane = this.getAvailablePlane(object.id)
          if (!availablePlane) {
            console.warn(`No available planes for ${object.id}`)
            continue
          }

          object.mesh = availablePlane.mesh
          object.meshId = availablePlane.id
          object.mesh.material.uniforms.uNoise.value = object.id === 'noise' ? 1 : 0
          object.mesh.material.uniforms.uTextureFade.value = 0
          object.mesh.material.uniforms.uTextureLoaded.value = 0
          object.mesh.material.uniforms.uBlackAndWhite.value = object.blackAndWhite ? 1 : 0

          object.firstFrame = true
          object.wasPixelated = false
          object.wasHovered = false
          object.wasClickable = false
          object.previousCursor = object.cursor
          object.videoAssigned = object.imgAssigned = false

          if (object.fade) this.planeIn(object.mesh.material.uniforms.uFade)
          else object.mesh.material.uniforms.uFade.value = 1
        }

        if (object.video && !object.videoAssigned) {
          object.videoAssigned = true
          object.mesh.material.uniforms.uTextureType.value = 0
          object.mesh.material.uniforms.uTextureVideo.value.image = object.video
          object.mesh.material.uniforms.uTextureSize.value.x = object.size.x
          object.mesh.material.uniforms.uTextureSize.value.y =
            (object.size.x * object.video.height) / object.video.width
          object.mesh.material.uniforms.uTextureLoaded.value =
            videoLoaded(object.video) && object.firstFrame ? 1 : 0
        } else if (object.img && !object.imgAssigned) {
          object.imgAssigned = true
          object.mesh.material.uniforms.uTextureType.value = 1
          object.mesh.material.uniforms.uTextureSize.value.x = object.img.width
          object.mesh.material.uniforms.uTextureSize.value.y = object.img.height
          if (this.imageLoaded(object.img) && object.firstFrame) {
            object.mesh.material.uniforms.uTextureLoaded.value = 1
            texture = this.loadedTextures.find(t => t.id === slugify(object.img.currentSrc))
            object.mesh.material.uniforms.uTextureImage.value = texture.txt
          }
        }

        const { uniforms } = object.mesh.material

        let isLoaded = 0
        if (uniforms.uTextureLoaded.value === 1 || object.id === 'noise') isLoaded = 1
        else if (object.video) isLoaded = videoLoaded(object.video) ? 1 : 0
        else if (object.img) {
          isLoaded = this.imageLoaded(object.img)
          if (isLoaded) {
            texture = this.loadedTextures.find(t => t.id === slugify(object.img.currentSrc))
            uniforms.uTextureImage.value = texture.txt
          } else this.preload(object.img)
        }

        if (isLoaded && uniforms.uTextureFade.value === 0) {
          const fade = isLoaded !== uniforms.uTextureLoaded.value
          uniforms.uTextureLoaded.value = 1
          gsap.killTweensOf(uniforms.uTextureFade)
          gsap[fade ? 'to' : 'set'](uniforms.uTextureFade, { value: 1 })
        }

        this.needsUpdate = true

        const position = this.fromDomToCanvas({
          x: object.position.x,
          y: object.position.y + this.getFixedY(object.fixed),
        })
        object.mesh.renderOrder = object.order
        object.mesh.position.x = position.x + object.size.x * 0.5
        object.mesh.position.y = position.y - object.size.y * 0.5
        object.mesh.position.z = object.position.z || 0
        object.mesh.rotation.x = object.rotate.x
        object.mesh.rotation.y = object.rotate.y
        object.mesh.rotation.z = object.rotate.z
        object.mesh.scale.x = object.size.x
        object.mesh.scale.y = object.size.y
        object.mesh.scale.z = object.size.z

        uniforms.uFrame.value = this.frame
        uniforms.uColor.value = object.color || this.colors.lightGrey
        uniforms.uMultiplyColor.value = object.multiplyColor || this.colors.white
        uniforms.uOpacity.value = object.opacity !== undefined ? object.opacity : 1

        uniforms.uBorderRadius.value = object.border
        uniforms.uTime.value += 0.05
        const xPixelRatio = object.size.x / round(object.size.x / this.toScale(18))
        const yPixelRatio = object.size.y / round(object.size.y / this.toScale(18))
        uniforms.uPixelSize.value.x = object.size.x / xPixelRatio
        uniforms.uPixelSize.value.y = object.size.y / yPixelRatio
        uniforms.uParallax.value.x = object.parallax.x
        uniforms.uParallax.value.y = object.parallax.y
        uniforms.uPlaneSize.value.x = object.size.x
        uniforms.uPlaneSize.value.y = object.size.y
        uniforms.uTextureVideo.value.needsUpdate =
          object.video?.readyState >= object.video?.HAVE_CURRENT_DATA
        uniforms.uDevicePixelRatio.value = this.getDevicePixelRatio()
        if (object.textureFade) uniforms.uTextureFade.value = object.textureFade
        if (object.onIntersect) object.onIntersect(hovered)

        const hovered =
          this.intersects.includes(object.mesh) && (!this.touch || object.blackAndWhite)
        const clickable = hovered && object.onClick
        const pixelated = (clickable && !object.noPixel) || object.forcePixelated
        const wasPixelated = uniforms.uPixel.value === 1
        const wasntPixelated = uniforms.uPixel.value === 0
        const pixelatedTransition = (pixelated && wasntPixelated) || (!pixelated && wasPixelated)

        if (hovered !== object.wasHovered && object.blackAndWhite) {
          gsap.killTweensOf(uniforms.uBlackAndWhite)
          gsap.to(uniforms.uBlackAndWhite, {
            value: hovered ? 0 : 1,
            duration: 0.4,
          })
        }

        if (pixelatedTransition || pixelated !== object.wasPixelated) {
          gsap.killTweensOf(uniforms.uPixel)
          gsap.to(uniforms.uPixel, { value: pixelated ? 1 : 0, duration: 0.4 })
        }

        if (!clickable && object.wasClickable) {
          // gsap.killTweensOf(uniforms.uZoom)
          // gsap.to(uniforms.uZoom, {
          //   value: object.zoom,
          //   duration: 0.4,
          //   onStart: () => {
          //     object.inZoomTransition = true
          //   },
          //   onComplete: () => {
          //     object.inZoomTransition = false
          //   },
          // })
          if (this.intersects.length === 0) {
            this.updateCursor('default')
            this.main.classList.remove('__main--pointer')
            if (this.logo) {
              gsap.killTweensOf(this.logo.rotation)
              gsap.to(this.logo.rotation, { y: Math.PI, onUpdate: this.updateLogoLight.bind(this) })
            }
          }
        } else if (clickable && (!object.wasClickable || object.cursor !== object.previousCursor)) {
          // if (clickable && !object.wasClickable) {
          //   gsap.to(uniforms.uZoom, {
          //     value: object.zoom,
          //     // value: object.img ? object.zoom + 0.2 : object.zoom,
          //     duration: 1,
          //     onStart: () => {
          //       object.inZoomTransition = true
          //     },
          //     onComplete: () => {
          //       object.inZoomTransition = false
          //     },
          //   })
          // }
          this.main.classList.add('__main--pointer')
          this.updateCursor(object.cursor)
          if (this.logo) {
            gsap.killTweensOf(this.logo.rotation)
            gsap.to(this.logo.rotation, {
              y: Math.PI * 2,
              onUpdate: this.updateLogoLight.bind(this),
            })
          }
        } else if (!clickable && !object.inZoomTransition) {
          uniforms.uZoom.value = object.zoom
        }
        object.firstFrame = false
        object.wasPixelated = pixelated
        object.wasHovered = hovered
        object.wasClickable = clickable
        object.previousCursor = object.cursor
      } else if (object.mesh && object.type === 'plane') {
        object.mesh.material.uniforms.uFade.value = 0.0
        this.releasePlane(object.meshId)
        object.mesh = null
      }
    }
  }

  inView({ fixed, position, size, opacity }) {
    const y = position.y + this.getFixedY(fixed)
    const limitTop = y - this.y >= size.y * -1
    const limitRight = position.x < this.size.x
    const limitBottom = y - this.y < this.size.y
    const limitLeft = position.x + size.x > 0

    return (
      limitTop && limitRight && limitBottom && limitLeft && size.x > 0 && size.y > 0 && opacity > 0
    )
  }

  getFixedY(fixed) {
    if (fixed && this.y >= fixed.from) {
      const { from, to } = fixed
      return Math.min(this.y - from, to - from)
    }
    return 0
  }

  render() {
    this.frame++
    this.renderer.clear()

    this.intersects = this.raycaster
      .intersectObjects(this.scene.children, false)
      .map(i => i.object)
      .filter(o => o.position.z === 0)

    this.updateObjects()

    if (this.needsUpdate) {
      this.log('render()')
      this.renderer.setViewport(0, 0, this.size.x, this.size.y)
      this.renderer.render(this.scene, this.camera)
    }

    this.logo && this.renderLogo()
  }

  renderLogo() {
    let scrollTarget = this.size.y
    let scrollProgress = Math.min(1, this.y / scrollTarget)

    let scrollLeaveInit = this.scrollBounding - this.size.y
    let scrollLeaveEnd = !this.isMobileLayout
      ? this.scrollBounding - this.logoMargin * 2 - 160
      : this.scrollBounding - 16 - 56
    let scrollLeaveProgress = Math.max(
      0,
      Math.min(1, (this.y - scrollLeaveInit) / (scrollLeaveEnd - scrollLeaveInit))
    )
    let scrollLeaveGap = Math.max(0, this.y - scrollLeaveEnd)

    let scrollDistance = 0
    let scrollGap = 0
    let logoCurrentScale = 1 - (1 - this.logoTargetScale) * scrollProgress
    let logoGap = 0
    let screenGap = 0
    let xOffset = 0
    let yOffset = 0

    if (!this.isMobileLayout) {
      logoCurrentScale += (1 - this.logoTargetScale) * scrollLeaveProgress
      if (scrollLeaveProgress === 0) {
        scrollDistance = this.size.y - this.logoSize * this.logoTargetScale - this.logoMargin * 2
      } else {
        scrollDistance = this.size.y - this.logoSize * logoCurrentScale - this.logoMargin * 2
      }

      scrollGap = scrollDistance * scrollProgress - 8 + 4 * scrollProgress - 4 * scrollLeaveProgress
      logoGap = this.logoSize * logoCurrentScale * 0.5 + this.logoMargin
      screenGap = Math.max(0, this.size.x - 1800) * 0.5
      xOffset = -logoGap - screenGap
      yOffset = logoGap + scrollGap + scrollLeaveGap
    } else {
      const mobileHeaderTop = this.toScale(67) + this.logoSize * 0.5 + this.toScale(20)
      const mobileInitY = mobileHeaderTop
      const scrollDistanceX =
        this.size.x * 0.5 - this.logoSize * this.logoTargetScale * 0.5 - this.logoMargin
      const scrollGapX = scrollDistanceX * scrollProgress
      scrollDistance =
        this.size.y - mobileInitY - this.logoSize * this.logoTargetScale * 0.5 - this.logoMargin
      scrollGap = scrollDistance * scrollProgress

      const leaveGap = this.y > scrollLeaveEnd ? this.y - scrollLeaveEnd : 0

      xOffset = this.size.x * -0.5 + scrollGapX
      yOffset = mobileInitY + scrollGap + leaveGap
    }

    this.logo.scale.set(
      this.logoScale * logoCurrentScale * this.logoAnimation.value,
      this.logoScale * logoCurrentScale * this.logoAnimation.value,
      this.logoScale * logoCurrentScale * this.logoAnimation.value * 0.5
    )

    this.renderer.setViewport(
      this.size.x * 0.5 + xOffset,
      this.size.y * -0.5 + yOffset,
      this.size.x,
      this.size.y
    )
    this.renderer.render(this.logoScene, this.logoCamera)
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
    plane.mesh.scale.x = 0
    plane.mesh.scale.y = 0
    plane.available = true
    plane.mesh.visible = false
    plane.video = null
    plane.img = null
  }

  generatePlanesBatch() {
    const video = document.createElement('video')

    for (let id = 0; id < this.maxPlanes; id++) {
      const available = true
      const mesh = new Mesh(
        this.geometries.plane,
        new ShaderMaterial({
          vertexShader: VS,
          fragmentShader: FS,
          uniforms: {
            uNoise: { type: 'i', value: 0 },
            uFrame: { type: 'i', value: 0 },
            uTime: { type: 'f', value: 0.0 },
            uFade: { type: 'f', value: 0.0 },
            uZoom: { type: 'f', value: 1.0 },
            uPixel: { type: 'f', value: 0.0 },
            uBlackAndWhite: { type: 'f', value: 0.0 },
            uParallax: { type: 'v2', value: new Vector2(0, 0) },
            uOpacity: { type: 'f', value: 1.0 },
            uBorderRadius: { type: 'f', value: 16.0 },
            uPixelSize: { type: 'v2', value: new Vector2(1, 1) },
            uTextureType: { type: 'i', value: 0 }, // 0 Video, 1 Image
            uTextureFade: { type: 'f', value: 0.0 },
            uTextureLoaded: { type: 'i', value: 0 },
            uTextureImage: { type: 't', value: null },
            uTextureVideo: { type: 't', value: new VideoTexture(video) },
            uTextureSize: { type: 'v2', value: new Vector2(1, 1) },
            uPlaneSize: { type: 'v2', value: new Vector2(1, 1) },
            uDevicePixelRatio: { type: 'f', value: 1.0 },
            uColor: { type: 'v4', value: this.colors.lightGrey },
            uMultiplyColor: { type: 'v4', value: this.colors.lime },
          },
          wireframe: false,
          transparent: true,
          depthTest: false,
          depthWrite: false,
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

    this.logoCamera.aspect = size.x / size.y
    this.logoCamera.fov = 2 * Math.atan((size.y * 0.5) / this.z) * (180 / Math.PI)
    this.logoCamera.updateProjectionMatrix()
    this.logoMargin =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--layout-margin')) *
      10

    this.touch = !!window.getComputedStyle(document.body, ':after').getPropertyValue('--touch')

    this.updateLogoScale()

    this.renderer.setSize(size.x, size.y)
    this.renderer.setPixelRatio(this.getDevicePixelRatio())

    this.bounding = this.renderer.domElement.getBoundingClientRect()

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

  toScale(n) {
    const mvw = Math.min(this.size.x, 1920) // Check layout max width
    return (n * mvw) / 1440
  }

  planeIn(prop) {
    gsap.killTweensOf(prop)
    const duration = 1.2
    gsap.fromTo(prop, { value: 0 }, { value: 1, duration, delay: 0.1 })
  }

  updateLogoState(value) {
    if (this.logo) {
      gsap.killTweensOf(this.logo.rotation)
      gsap.killTweensOf(this.logoAnimation)
      gsap.to(this.logoAnimation, { value: value ? 1 : 0 })
      gsap.to(this.logo.rotation, {
        y: value ? Math.PI : 0,
        onUpdate: this.updateLogoLight.bind(this),
      })
    }
  }

  updateLogoScale() {
    if (this.logo) {
      this.logo.scale.set(1, 1, 1)
      const box = new Box3().setFromObject(this.logo)
      const size = box.getSize(new Vector3())
      this.logoScale = this.logoSize / size.x
    }
  }

  updateMobileLayout(value) {
    this.isMobileLayout = value
    this.logoSize = value ? 96 : 160
    this.logoTargetScale = value ? 0.416666 : 0.25
  }

  updateLogoLight() {
    if (!this.logo) return
    const maxIntensity = 0.25
    const rotation = this.logo.rotation.y % Math.PI
    const distanceToMiddlePoint = Math.abs(rotation - Math.PI * 0.5) / (Math.PI * 0.5)
    this.logoLight.intensity = maxIntensity - distanceToMiddlePoint * maxIntensity
  }

  updateScrollBounding(value) {
    this.scrollBounding = value
  }

  toScale(n) {
    const mvw = Math.min(this.size.x, 1800)
    return (n * mvw) / (this.isMobileLayout ? 375 : 1440)
  }

  imageLoaded(img) {
    const { currentSrc } = img
    const id = slugify(currentSrc)
    const texture = this.loadedTextures.find(t => t.id === id)
    if (texture?.ready) return 1
    return 0
  }

  onClick(e) {
    for (const mesh of this.intersects) {
      const object = this.objects.find(obj => obj.mesh === mesh)
      if (object && object.onClick) {
        object.onClick()
        return
      }
    }
  }

  onMouseMovement(e) {
    if (!this.bounding || this.touch) return
    this.updateRaycaster(e)
  }

  updateRaycaster(e) {
    this.mouse.x =
      ((e.clientX - this.bounding.left) / (this.bounding.right - this.bounding.left)) * 2 - 1
    this.mouse.y =
      -((e.clientY - this.bounding.top) / (this.bounding.bottom - this.bounding.top)) * 2 + 1

    this.raycaster.setFromCamera(this.mouse, this.camera)
  }

  onTouchStart(e) {
    const { clientX, clientY } = this.getTouch(e)
    this.touchStartX = clientX
    this.touchStartY = clientY
    this.touchTime = Date.now()
  }

  onTouchEnd(e) {
    const { clientX, clientY } = this.getTouch(e)
    const touchDifferenceX = Math.abs(clientX - this.touchStartX)
    const touchDifferenceY = Math.abs(clientY - this.touchStartY)
    const touchTime = Date.now() - this.touchTime
    if (touchDifferenceX < 10 && touchDifferenceY < 10 && touchTime < 200) {
      this.updateRaycaster({ clientX, clientY })
      this.intersects = this.raycaster
        .intersectObjects(this.scene.children, false)
        .map(i => i.object)
        .filter(o => o.position.z === 0)
    }
  }

  getTouch(e) {
    const touch = e.changedTouches || e.touches || (e.originalEvent && e.originalEvent.touches)
    return touch && touch.length ? touch[0] : e
  }

  bind() {
    this._render = this.render.bind(this)
    this._onClick = this.onClick.bind(this)
    this._onMouseMovement = this.onMouseMovement.bind(this)
    this._onTouchStart = this.onTouchStart.bind(this)
    this._onTouchEnd = this.onTouchEnd.bind(this)
  }

  addListeners() {
    window.addEventListener('click', this._onClick)
    window.addEventListener('mousemove', this._onMouseMovement)
    window.addEventListener('touchstart', this._onTouchStart)
    window.addEventListener('touchend', this._onTouchEnd)
  }

  removeListeners() {
    window.removeEventListener('click', this._onClick)
    window.removeEventListener('mousemove', this._onMouseMovement)
    window.removeEventListener('touchstart', this._onTouchStart)
    window.removeEventListener('touchend', this._onTouchEnd)
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
    this.logo = null
    this.logoScene = null
    this.logoCamera = null
    this.logoLight = null
    this.renderer = null
    this.objects = []
    for (const i in this.batch) {
      this.batch[i] = null
      delete this.batch[i]
    }

    this.removeListeners()
  }
}

export default Controller
