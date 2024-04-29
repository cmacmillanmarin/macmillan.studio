import { storeToRefs } from 'pinia'
import useScrollStore from '~/store/useScrollStore'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const { el } = storeToRefs(useScrollStore())
  if (!el?.value && to.hash) {
    return navigateTo(to.fullPath.replace(to.hash, ''))
  }
})
