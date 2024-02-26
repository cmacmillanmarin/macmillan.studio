//
// requires:
// ~/composables/useResize
//

import { storeToRefs } from 'pinia'
import useScrollStore from '~/store/useScrollStore'

export default function useNativeScrollTracker() {
  const scrollStore = useScrollStore()
  const { scrollUpdate } = storeToRefs(scrollStore)
  const { onResize, vh } = useResize()

  watch([scrollUpdate, onResize], reset)

  const bounding: { top: number; height: number } = { top: 0, height: 0 }

  function updateBounding(el: HTMLElement): void {
    const { top, height } = el.getBoundingClientRect()
    bounding.top = top + scrollStore.scrollPosition
    bounding.height = height
  }

  function track(el: HTMLElement): { current: number; progress: number } {
    if (bounding.height === 0) updateBounding(el)
    const { scrollPosition } = scrollStore
    const current = Math.max(0, scrollPosition - bounding.top + vh.value)
    const progress = (scrollPosition - bounding.top + vh.value) / (bounding.height + vh.value)
    return {
      current: round(current),
      progress: parseFloat(Math.max(0, Math.min(progress, 1)).toFixed(2)),
    }
  }

  function reset(): void {
    bounding.height = 0
  }

  return { track }
}
