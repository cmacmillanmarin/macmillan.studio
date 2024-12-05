<template>
  <div
    ref="el"
    class="ticker"
    data-scroll-set-position
    :style="{ height }"
    v-intersect="{ callback: onIntersect }">
    <slot />
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap/gsap-core'
import { storeToRefs } from 'pinia'
import { toPx, round } from '~/utils/index'
import useScrollStore from '~/store/useScrollStore'
import type { TickerItems, TickerItem } from '~/types/front'
import { Swiper, type PanParams } from '~/utils/swiper'
import type { NextProjectTicker, NextProjectTickerItem } from '~/types/front/store'

const props = defineProps<{
  planesId?: string
  dragOnTarget?: boolean
  ignoreUpdateScroll?: boolean
  ticker?: NextProjectTicker
}>()

const scrollStore = useScrollStore()
const { updateScroll, addRenderCallback, removeRenderCallback } = scrollStore
const { scrollUpdated } = storeToRefs(scrollStore)

const { isMobileLayout } = useDevice()
const { onResize } = useResize()
const { getBounding } = useVirtualScrollAndThreeTools()

const el = ref<HTMLElement>()
const inView = ref<boolean>(false)

const minHeight = ref<number>(0)
const height = computed(() => (minHeight.value !== 0 ? toPx(minHeight.value) : 'auto'))

const y = ref<number>(0)
const items = ref<TickerItems>([])
const firstItem = computed<TickerItem | undefined>(() => items.value[0])
const lastItem = computed<TickerItem | undefined>(() => items.value[items.value.length - 1])

let _current: number = props.ticker?.current || 0
let _target: number = props.ticker?.target || 0
let _direction: number = props.ticker?.direction || -1
let _speed: number = props.ticker?.speed || 1.25
let _panInit: number = 0
let _panSpeed: number = 0
let _containerWidth: number = 0
let _moving: boolean = false
let _onPan: boolean = false
let _panDirection: number = 0

const _Swiper = new Swiper({
  dragOnTarget: !!props.dragOnTarget,
})

watch(onResize, () => {
  update()
})

watch(scrollUpdated, () => {
  update({ ticker: props.ticker, ignoreUpdateScroll: true })
})

watch(inView, () => {
  if (inView.value && el.value) {
    _Swiper.init({ el: el.value, cursor: true, onPanMove, onPanEnd })
    addRenderCallback(move)
  } else {
    removeRenderCallback(move)
    _Swiper.destroy()
  }
})

onMounted(async () => {
  if (props.ticker?.items.length) {
    update({ ticker: props.ticker })
  } else {
    await nextTick()
    await nextTick()
    update()
  }
})

function onPanMove(params: PanParams) {
  const { xDir, xDiff, yDiff, inertia } = params
  if (Math.abs(yDiff) >= Math.abs(xDiff)) return
  if (!_onPan) {
    _panInit = _current
    _target = _current
  }
  _onPan = true
  _target = _panInit - xDiff * (0.25 + inertia)
  _panDirection = xDir
}

function onPanEnd() {
  // _panSpeed = Math.abs(_target - _current) * 0.12
  _onPan = false
}

function onIntersect(el: HTMLElement, visible: boolean) {
  inView.value = visible
}

function move() {
  _moving = true
  if (!firstItem.value || !lastItem.value) return
  if (_onPan) {
    _direction = _panDirection
  } else {
    _panSpeed += (0 - _panSpeed) * 0.1
    _target += _direction * (_speed + _panSpeed)
  }
  _current += (_target - _current) * 0.1
  const orderedItems = _direction === -1 ? [...items.value] : [...items.value].reverse()
  for (let i = 0; i < orderedItems.length; i++) {
    const item = orderedItems[i]
    let x = item.init + _current
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
    const inView = x >= item.width * -1 && x <= _containerWidth
    if (!inView) {
      x = _direction === -1 ? _containerWidth : item.width * -1
    }
    if (inView || x !== item.x) {
      x = round(x, 2)
      if (props.planesId) {
        const { $three }: any = useNuxtApp()
        const index = items.value.indexOf(item)
        const id = `${props.planesId}-${index + 1}`
        // const totalDistance = _containerWidth + item.width
        // const current = x + item.width
        // const progress = current / totalDistance
        // const distanceToCenter = distanceToMidpoint(progress)
        $three.planes.updateObject({ id, position: { x: x, y: y.value }, zoom: 1 })
      }
      gsap.set(item.el, { x })
    }
    item.x = x
  }
}

function distanceToMidpoint(value: number): number {
  return Math.abs(value - 0.5)
}

async function update(params?: { ticker?: NextProjectTicker; ignoreUpdateScroll?: boolean }) {
  if (!el.value) return

  const { top } = getBounding(el.value)
  y.value = top

  let maxHeight = 0
  items.value.splice(0, items.value.length)

  const children: NodeListOf<HTMLElement> = el.value.querySelectorAll(':scope > *')
  for (const child of children) {
    const width = child.clientWidth
    const height = child.clientHeight
    if (height > maxHeight) maxHeight = height
    items.value.push({ el: child, width: Math.ceil(width), position: 0, init: 0, reset: 0, x: 0 })
  }

  for (let i = 0; i < items.value.length; i++) {
    const item = items.value[i]
    const nextProjectItem = props.ticker?.items[i]
    if (nextProjectItem) {
      item.x = nextProjectItem.x
      item.init = nextProjectItem.init
      item.reset = nextProjectItem.reset
      item.width = nextProjectItem.width
      item.position = nextProjectItem.position
      gsap.set(item.el, { x: item.x })
    } else {
      for (let j = 0; j < i; j++) {
        item.init += items.value[j].width
        item.reset = item.init
      }
      gsap.set(item.el, { x: item.init })
    }
  }
  minHeight.value = maxHeight
  _containerWidth = el.value.clientWidth

  if (!(params?.ignoreUpdateScroll || props.ignoreUpdateScroll)) updateScroll()
  await nextTick()
  emit('update')
}

function pause() {
  removeRenderCallback(move)
}

function getNextProjectTicker(): NextProjectTicker {
  const _items: Array<NextProjectTickerItem> = []
  for (const item of items.value) {
    _items.push({
      width: item.width,
      position: item.position,
      init: item.init,
      reset: item.reset,
      x: item.x,
    })
  }
  return {
    items: _items,
    target: _target,
    speed: _speed,
    current: _current,
    direction: _direction,
  }
}

onBeforeUnmount(() => {
  _Swiper.destroy()
  removeRenderCallback(move)
})

defineExpose({
  update,
  pause,
  getNextProjectTicker,
})

const emit = defineEmits(['update'])
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
