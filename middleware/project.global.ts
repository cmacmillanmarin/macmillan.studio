import Data from '~/assets/data/index.json'
import { type Projects } from '~/types/data'

export default defineNuxtRouteMiddleware(async (to, from) => {
  const slug = `${to.params.slug}`
  const projects: Projects = Data.projects
  if (to.params.slug && !projects[slug]) {
    return navigateTo('/')
  }
})
