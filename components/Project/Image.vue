<template>
  <div
    ref="el"
    class="project__image"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    v-intersect="{ callback: onIntersect }">
    <CustomImage
      :data="data"
      :thumbnail="layout === 'scroll'"
      :size="{ d: 1, t: 1, m: 1 }"
      :lazy="true"
      @load="onLoaded" />
    <div ref="bgEl" class="project__image__bg" />
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap/gsap-core'
import useStore from '~/store/useStore'
import type { Image } from '~/types/wordpress'
import type { ProjectAssetLayoutType } from '~/types/wordpress/project'
import { Swiper } from '~/utils/swiper'

const props = defineProps<{
  data: Image
  ready?: boolean
  transparent?: boolean
  mobile?: boolean
  layout?: ProjectAssetLayoutType
  bgColor: string
  first?: boolean
}>()

const store = useStore()
const { updateCursor } = store

const { vw, vh } = useResize()
const { toScale } = useCss()
const { isMobileLayout } = useDevice()
const { addTicker, killTicker } = useRaf()

const el = ref<HTMLElement>()
const bgEl = ref<HTMLElement>()

const loaded = ref<boolean>(false)
const inView = ref<boolean>(false)
const entered = ref<boolean>(false)

const background = ref<string>(props.transparent ? 'transparent' : props.bgColor)

const _Swiper = new Swiper({})

let _onPan: boolean = false
let _panInit: number = 0
let _target: number = 0
let _current: number = 0
let _rendering: boolean = false

const gap = computed<number>(() => {
  if (props.layout === 'top' || props.layout === 'bottom') {
    return toScale(isMobileLayout.value ? 60 : 260)
  }

  if (props.layout === 'scroll') {
    return toScale(isMobileLayout.value ? 32 + 90 : 260)
  }

  return props.layout === 'center' && !(props.mobile && isMobileLayout.value)
    ? toScale(isMobileLayout.value ? 120 : 260)
    : toScale(isMobileLayout.value && props.first ? 32 : 0)
})

const normalized = ref<number>(props.mobile ? 0.368 : 1)

const mobileNormalizer = computed<number>(() => 1)

const height = computed<string>(() => {
  if (isMobileLayout.value)
    return toPx(
      Math.ceil(
        ((vw.value - gap.value) * mobileNormalizer.value * props.data.height) / props.data.width
      )
    )
  if (props.layout === 'scroll')
    return toPx(
      Math.ceil(
        ((((vh.value - gap.value) * 16) / 9) * normalized.value * props.data.height) /
          props.data.width
      )
    )
  return toPx(Math.ceil(vh.value - gap.value))
})
const heightNumber = computed<number>(() => parseInt(height.value))
const width = computed<string>(() => {
  if (isMobileLayout.value) return toPx(Math.ceil(vw.value - gap.value) * mobileNormalizer.value)
  if (props.layout === 'scroll')
    return toPx(Math.ceil((((vh.value - gap.value) * 16) / 9) * normalized.value))
  return toPx(Math.ceil(((vh.value - gap.value) * props.data.width) / props.data.height))
})

watch([width, height], async () => {
  await nextTick()
  emit('update-scroll')
})

watch([loaded, () => props.ready], async () => {
  await nextTick()
  emit('update-scroll')
})

watch([loaded, inView, () => props.ready], async () => {
  const img = el.value?.querySelector('.custom-image')
  if (props.ready && loaded.value && img && inView.value && !entered.value) {
    entered.value = true
    await fadeIn({ el: img })
    fadeOut({ el: bgEl.value })
  }
})

function onLoaded() {
  loaded.value = true
}

function onIntersect(el: HTMLElement, visible: boolean) {
  inView.value = visible
  if (props.layout === 'scroll' && visible && _target === 0 && !isMobileLayout.value) {
    gsap.set(el, { y: toScale(130) })
    gsap.to(el, { y: 0, duration: 1 })
  }
}

function onMouseEnter() {
  if (props.layout !== 'scroll') return
  updateCursor('drag-vertical')
  !isMobileLayout.value && _Swiper.init({ el: el.value, cursor: true, onPanMove, onPanEnd })
}

function clamp(value: number): number {
  return Math.max(0, Math.min(value, heightNumber.value - (vh.value - gap.value)))
}

function onPanMove(params: PanParams) {
  !_rendering && addTicker(move)
  const { xDiff, yDiff, inertia } = params
  if (Math.abs(xDiff) >= Math.abs(yDiff)) return
  if (!_onPan) {
    _panInit = _current
    _target = _current
  }
  _onPan = true
  _target = clamp(_panInit - yDiff * (1 + inertia))
}

function onPanEnd() {
  _onPan = false
}

function move() {
  _rendering = true
  _current += (_target - _current) * 0.1
  if (Math.abs(_target - _current) < 0.05) {
    _current = _target
    _rendering = false
    killTicker(move)
  }
  el.value && gsap.set(el.value, { y: _current * -1 })
}

function onMouseLeave() {
  if (props.layout !== 'scroll') return
  updateCursor('close')
  _Swiper.destroy()
}

onBeforeUnmount(() => {
  _Swiper.destroy()
  killTicker(move)
})

const emit = defineEmits(['update-scroll'])
</script>

<style lang="scss">
.project__image {
  position: relative;
  width: v-bind(width);
  height: v-bind(height);
  &__bg {
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    background-color: v-bind(background);
    will-change: opacity;
    width: 100%;
    height: 100%;
  }
  .custom-image {
    position: relative;
    z-index: 2;
    pointer-events: none;
    display: block;
    width: v-bind(width);
    height: v-bind(height);
    opacity: 0.000001;
    will-change: opacity, transform;
    user-select: none;
  }
}
</style>
