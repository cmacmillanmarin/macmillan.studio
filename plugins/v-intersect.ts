import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import type { IntersectObserverParams, Observers } from '~/types/front/intersect'

const observers: Observers = []

function createIntersectionObserver(params: IntersectObserverParams): IntersectionObserver {
  const { el, onIntersect } = params

  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        onIntersect(el, entry.isIntersecting)
      })
    },
    {
      rootMargin: '0px',
      threshold: 0,
    }
  )

  observer.unobserve(el)
  observer.observe(el)
  return observer
}

export default defineNuxtPlugin(nuxtApp => {
  const { isPreloaded } = storeToRefs(useStore())

  watch(isPreloaded, (): void => {
    for (const { el, observer } of observers) {
      observer.unobserve(el)
      observer.observe(el)
    }
  })

  nuxtApp.vueApp.directive('intersect', {
    async mounted(el: HTMLElement, binding): Promise<void> {
      await nextTick()

      const observer = createIntersectionObserver({
        el: el,
        onIntersect: (el, visible) => {
          if (!isPreloaded.value) return
          binding.value.callback(el, visible)
        },
      })
      observers.push({ el, observer })
    },
  })
})
