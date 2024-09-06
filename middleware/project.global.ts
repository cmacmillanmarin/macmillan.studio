import Data from '~/assets/data/index.json'

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (to.params.slug && !Data.projects[to.params.slug]) {
    return navigateTo('/')
  }
})
