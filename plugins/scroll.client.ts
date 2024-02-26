import { storeToRefs } from 'pinia'
import useScrollStore from '~/store/useScrollStore'
export default defineNuxtPlugin(({ hook }) => {
  hook('page:transition:finish', async () => {
    const { scrollEl } = storeToRefs(useScrollStore())
    gsap.set(scrollEl.value, { scrollTo: 0 })
  })
})
