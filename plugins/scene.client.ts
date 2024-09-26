import useStore from '~/store/useStore'
import Scene from '~/assets/js/three/Scene'

export default defineNuxtPlugin(nuxtApp => {
  const store = useStore()

  const scene = new Scene()
  scene.onPreloaded = () => {
    store.updatePreloadedTextures(true)
  }
  nuxtApp.provide('scene', scene)
})
