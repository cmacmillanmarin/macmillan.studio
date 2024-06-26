import { storeToRefs } from 'pinia'
import useScrollStore from '~/store/useScrollStore'

export default function userVirtualScrollAndThreeTools() {
  const { onResize } = useResize()
  const { current, scrollUpdate } = storeToRefs(useScrollStore())

  const onReset = ref<number>(0)

  watch([onResize, scrollUpdate], update)
  onMounted(update)

  async function update() {
    await nextTick() // In default layout, both resize and scrollUpdate await a tick before scroll.update() call
    await nextTick() // After scroll.update() call
    onReset.value++
  }

  function getBounding(el: HTMLElement): {
    top: number
    bottom: number
    left: number
    right: number
  } {
    let top,
      bottom,
      left,
      right = 0

    const { positionTop, positionBottom, positionLeft, positionRight } = el.dataset
    if (positionTop && positionBottom && positionLeft && positionRight) {
      top = parseFloat(positionTop)
      bottom = parseFloat(positionBottom)
      left = parseFloat(positionLeft)
      right = parseFloat(positionRight)
    } else {
      const bounding = el.getBoundingClientRect()
      top = bounding.top + current.value
      bottom = bounding.top + bounding.height + current.value
      left = bounding.left
      right = bounding.left + bounding.width
    }
    return { top, bottom, left, right }
  }

  return {
    onReset,
    getBounding,
  }
}
