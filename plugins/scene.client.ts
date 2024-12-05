import useStore from '~/store/useStore'
import Scene from '~/assets/js/three/Scene'
import Noise from '~/assets/js/three/scenes/noise/Index'

export default defineNuxtPlugin(nuxtApp => {
  const store = useStore()

  const scene = new Scene()
  scene.onPreloaded = () => {
    store.updatePreloadedTextures(true)
  }
  const noise = new Noise()
  nuxtApp.provide('scene', scene)
  nuxtApp.provide('noise', noise)
})
