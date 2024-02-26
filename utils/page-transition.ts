import { type TransitionProps } from 'vue'
import useStore from '~/store/useStore'
import { InView } from '~/utils'

export default <TransitionProps>{
  css: false,
  mode: 'out-in',
  onLeave(el: HTMLElement, done: () => void) {
    const store = useStore()

    let transitionDuration: number = 0

    for (const { transition, el, duration } of store.pageTransitions) {
      if (el && InView(el)) {
        if (duration > transitionDuration) transitionDuration = duration
        transition({ el })
      }
    }

    setTimeout(async (): Promise<void> => {
      done()
      await nextTick()

      store.updatePageTransition()
    }, transitionDuration * 1000)
  },

  onBeforeEnter(el: HTMLElement) {
    const store = useStore()
    const route = useRoute()
    store.updateRouteTo(route.fullPath)
  },

  onEnter(el: HTMLElement, done: () => void) {
    done()
  },

  onAfterEnter(el: HTMLElement) {
    const store = useStore()
    const route = useRoute()
    store.updateRouteEntered(route.fullPath)
  },
}
