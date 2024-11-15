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
import { gsap } from 'gsap'
import { storeToRefs } from 'pinia'
import { toPx, round } from '~/utils/index'
import useScrollStore from '~/store/useScrollStore'
import type { TickerItems, TickerItem } from '~/types/front'
import { Swiper, type PanParams } from '~/utils/swiper'

const props = defineProps<{
  planesId?: string
  dragOnTarget?: boolean
  ignoreUpdateScroll?: boolean
  startingPoint?: number
  startingDirection?: number
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

let _current: number = 0
let _target: number = 0
let _direction: number = -1
let _speed: number = 1.25
let _panInit: number = 0
let _panSpeed: number = 0
let _containerWidth: number = 0
let _moving: boolean = false
let _onPan: boolean = false
let _panDirection: number = 0

const _Swiper = new Swiper({
  preventLeft: true,
  preventRight: true,
  dragOnTarget: !!props.dragOnTarget,
})

watch(onResize, () => {
  update()
})

watch(scrollUpdated, () => {
  update({ ignoreUpdateScroll: true })
  move()
})

watch(inView, () => {
  if (inView.value && el.value) {
    _Swiper.init({ el: el.value, cursor: true, onPanStart, onPanMove, onPanEnd })
    addRenderCallback(move)
  } else {
    removeRenderCallback(move)
    _Swiper.destroy()
  }
})

onMounted(async () => {
  if (props.startingDirection !== undefined && props.startingPoint !== undefined) {
    _direction = props.startingDirection || -1
    _target = _current = props.startingPoint || 0
    update()
    move()
  } else {
    await nextTick()
    await nextTick()
    update()
  }
})

function onPanStart() {
  // _panInit = _current
  // _target = _current
}

function onPanMove(params: PanParams) {
  if (Math.abs(params.yDiff) >= Math.abs(params.xDiff)) return
  if (!_onPan) {
    _panInit = _current
    _target = _current
  }
  _onPan = true
  _target = _panInit - params.xDiff
  _panDirection = params.xDir
}

function onPanEnd() {
  _panSpeed = Math.abs(_target - _current) * 0.12
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
    // if not in view
    if (x < item.width * -1 || x > _containerWidth) {
      x = _containerWidth
    }
    x = round(x, isMobileLayout.value ? 1 : 0)
    if (props.planesId) {
      const { $scene }: any = useNuxtApp()
      const index = items.value.indexOf(item)
      // const totalDistance = _containerWidth + item.width
      // const current = x + item.width
      // const progress = current / totalDistance
      // const distanceToCenter = distanceToMidpoint(progress)
      $scene.updateObject({
        id: `${props.planesId}-${index + 1}`,
        position: { x: x, y: y.value },
        zoom: 1,
      })
    }
    gsap.set(item.el, { x })
    item.x = x
  }
}

function distanceToMidpoint(value: number): number {
  return Math.abs(value - 0.5)
}

async function update(params?: { ignoreUpdateScroll: boolean }) {
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
    for (let j = 0; j < i; j++) {
      item.init += items.value[j].width
      item.reset = item.init
    }

    gsap.set(item.el, { x: item.init })
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

function get(): { point: number; direction: number } {
  return {
    point: _current,
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
  get,
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
