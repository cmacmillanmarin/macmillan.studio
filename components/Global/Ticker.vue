<template>
  <div ref="el" class="ticker" :style="{ height }" v-intersect="{ callback: onIntersect }">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'
import { storeToRefs } from 'pinia'
import { toPx } from '~/utils/index'
import useScrollStore from '~/store/useScrollStore'
import type { TickerItems, TickerItem } from '~/types/front'

const scrollStore = useScrollStore()
const { updateScroll } = scrollStore
const { scrollUpdated, scrollDirection, scrollSpeed } = storeToRefs(scrollStore)

const { onResize } = useResize()
const { onEnter } = useKeyboard()
const { addTicker, killTicker } = useRaf()
const { init, onPan, panStart, panEnd, panHorizontal, panHorizontalDirection } = useSwipe({
  preventLeft: true,
  preventRight: true,
})

const el = ref<HTMLElement>()

const minHeight = ref<number>(0)
const height = computed(() => (minHeight.value !== 0 ? toPx(minHeight.value) : 'auto'))

const items = ref<TickerItems>([])
const firstItem = computed<TickerItem | undefined>(() => items.value[0])
const lastItem = computed<TickerItem | undefined>(() => items.value[items.value.length - 1])

let _current: number = 0
let _target: number = 0
let _direction: number = -1
let _speed: number = 2
let _speedInit: number = _speed
let _panInit: number = 0
let _panSpeed: number = 0
let _containerWidth: number = 0
let _moving: boolean = false

watch(scrollUpdated, () => {
  update({ ignoreUpdateScroll: true })
})

watch(onResize, () => {
  update()
})

watch(onEnter, () => {
  if (_moving) {
    killTicker(move)
    _moving = false
  } else {
    addTicker(move)
  }
})

// watch(scrollSpeed, () => {
//   if (!onPan.value) _speed = _speedInit + scrollSpeed.value * 0.025
// })

// watch(scrollDirection, () => {
//   if (!onPan.value) _direction = scrollDirection.value === 'up' ? 1 : -1
// })

watch(panStart, () => {
  _panInit = _current
  _target = _current
})

watch(panHorizontal, () => {
  _target = _panInit - panHorizontal.value
})

watch(panEnd, () => {
  _panSpeed = Math.abs(_target - _current) * 0.12
})

onMounted(async () => {
  await nextTick()
  await nextTick()
  update()
  init({ el: el.value as HTMLElement, cursor: true })
})

function onIntersect(el: HTMLElement, visible: boolean) {
  visible ? addTicker(move) : killTicker(move)
}

function move() {
  _moving = true
  if (!firstItem.value || !lastItem.value) return
  if (onPan.value) {
    _direction = panHorizontalDirection.value
  } else {
    _panSpeed += (0 - _panSpeed) * 0.1
    _target += _direction * (_speed + _panSpeed)
  }
  _current += (_target - _current) * 0.1
  const orderedItems = _direction === -1 ? [...items.value] : [...items.value].reverse()
  for (let i = 0; i < orderedItems.length; i++) {
    const item = orderedItems[i]
    const x = item.init + _current
    if (_direction === -1) {
      if (x < item.width * -1) {
        const edge = lastItem.value.init + lastItem.value.width
        item.init = edge + item.reset
      }
    } else if (x > _containerWidth) {
      const edge = firstItem.value.init - lastItem.value.width
      const position = lastItem.value.reset - item.reset
      item.init = edge - position
    }
    gsap.set(item.el, { x })
  }
}

function update(params?: { ignoreUpdateScroll: boolean }) {
  if (!el.value) return

  let maxHeight = 0
  items.value.splice(0, items.value.length)

  const children: NodeListOf<HTMLElement> = el.value.querySelectorAll(':scope > *')
  for (const child of children) {
    const width = child.clientWidth
    const height = child.clientHeight
    if (height > maxHeight) maxHeight = height
    items.value.push({ el: child, width: Math.ceil(width), position: 0, init: 0, reset: 0 })
  }
  for (let i = 0; i < items.value.length; i++) {
    const item = items.value[i]
    for (let j = 0; j < i; j++) {
      item.init += items.value[j].width
      item.reset = item.init
    }

    gsap.set(item.el, { x: item.init })
  }
  minHeight.value = maxHeight
  _containerWidth = el.value.clientWidth

  console.log(items.value)

  !params?.ignoreUpdateScroll && updateScroll()
}

onBeforeUnmount(() => {
  killTicker(move)
})
</script>

<style lang="scss">
.ticker {
  position: relative;
  overflow: var(--overflow--hidden);
  > * {
    position: absolute;
    top: 0;
    left: 0;
    will-change: transform;
    pointer-events: none;
  }
}
</style>
