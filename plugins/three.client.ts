import useStore from '~/store/useStore'
import Three from '~/assets/js/three/Index'

export default defineNuxtPlugin(nuxtApp => {
  const store = useStore()
  const { updateCursor, updatePreloadedThree } = store

  const three = new Three({
    updateCursor,
    onPreloaded: () => {
      updatePreloadedThree(true)
    },
  })
  nuxtApp.provide('three', three)
})
