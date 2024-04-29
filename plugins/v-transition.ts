import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import { toPercentage } from '~/utils'
import type { IntersectObserverParams, Observers } from '~/types/front/transition'

const observers: Observers = []

function createIntersectionObserver(params: IntersectObserverParams): IntersectionObserver {
  const { el, observerEl, onIntersect } = params

  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          onIntersect({ el })
          observer.unobserve(entry.target)
        }
      })
    },
    {
      rootMargin: '0px',
      threshold: 0,
    }
  )

  observer.unobserve(observerEl)
  observer.observe(observerEl)
  return observer
}

export default defineNuxtPlugin(nuxtApp => {
  const store = useStore()
  const { isPreloaded } = storeToRefs(store)

  watch(isPreloaded, (): void => {
    for (const { observerEl, observer } of observers) {
      observer.unobserve(observerEl)
      observer.observe(observerEl)
    }
  })

  nuxtApp.vueApp.directive('transition', {
    async mounted(el: HTMLElement, binding): Promise<void> {
      await nextTick()

      let observerEl: HTMLElement = el

      if (binding.value.offset) {
        observerEl = document.createElement('div')
        observerEl.classList.add('observer-el')
        observerEl.style.top = toPercentage(parseFloat(binding.value.offset) * 100)
        el.appendChild(observerEl)
      }

      switch (binding.arg) {
        case 'in':
          observers.push({
            el,
            observerEl,
            observer: createIntersectionObserver({
              el: el,
              observerEl: observerEl,
              onIntersect: el => {
                if (!isPreloaded.value) return
                binding.value.callback(el)
              },
            }),
          })
          break
        case 'out':
          store.addPageTransition({
            el,
            transition: binding.value.callback,
            duration: parseFloat(binding.value.duration || '0'),
          })
          break
        default:
          console.warn(`v-transition :: undefined directive "${binding.arg}"`, el)
      }
    },
  })
})
