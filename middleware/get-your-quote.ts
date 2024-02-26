import { storeToRefs } from 'pinia'
import useQuoteStore from '~/store/useQuoteStore'
import { type Screen, type Step, type Service } from '~/types/front/get-your-quote'
import { natural } from '~/utils'

export default defineNuxtRouteMiddleware(async (to, from) => {
  // skip middleware on server
  if (process.server) return

  const store = useQuoteStore()
  const { data } = store
  const { values } = storeToRefs(store)
  if (Object.keys(values.value).length === 0) store.create()

  if (to.params.slug) {
    const params = Array.isArray(to.params.slug) ? to.params.slug : [to.params.slug]

    const serviceIndex = natural(data.findIndex(({ slug }) => slug === params[0]))
    let service: Service = data[serviceIndex]
    let stepIndex = natural(service.steps.findIndex(({ slug }) => slug === params[1]))
    let step: Step = service.steps[stepIndex]
    let screenIndex = natural(step.screens.findIndex(({ slug }) => slug === params[2]))
    let screen: Screen = step.screens[screenIndex]

    let valid: boolean = true

    for (let j = 0; j < service.steps.length; j++) {
      step = service.steps[j]
      for (let k = 0; k < step.screens.length; k++) {
        screen = step.screens[k]
        valid = values.value[service.slug][step.slug][screen.slug].valid
        if (!valid || screen.slug === params[2]) break
      }
      if (!valid || step.slug === params[1]) break
    }

    const path = `/get-your-quote/${service.slug}/${step.slug}/${screen.slug}`
    if (to.fullPath !== path) return navigateTo(path)
  }
})
