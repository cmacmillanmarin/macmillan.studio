import Scene from '~/assets/js/three/Scene'

export default defineNuxtPlugin(nuxtApp => {
  const scene = new Scene()
  nuxtApp.provide('scene', scene)
})
