<template>
  <ClientOnly>
    <Teleport to="#top-layer">
      <div
        ref="el"
        class="home__hero__player"
        v-transition:in="{ callback: shuffleIn }"
        @click="onClick">
        <div
          ref="closeEl"
          class="home__hero__player__close"
          @mouseenter="onButtonMouseEnter"
          @mouseleave="onButtonMouseLeave">
          <button @click="onCloseButtonClick">
            <SvgClose />
          </button>
        </div>
        <div
          ref="timelineEl"
          class="home__hero__player__timeline"
          @click="onTimelineClick"
          @mouseenter="onButtonMouseEnter"
          @mouseleave="onButtonMouseLeave">
          <div class="home__hero__player__timeline__progress">
            <div ref="barEl" class="home__hero__player__timeline__progress__bar">
              <SvgSquare />
            </div>
          </div>
        </div>
        <div
          ref="muteEl"
          class="home__hero__player__mute"
          @mouseenter="onButtonMouseEnter"
          @mouseleave="onButtonMouseLeave">
          <button @click="onMuteButtonClick">
            <SvgClose />
          </button>
        </div>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import { toPercentage } from '~/utils'
import { shuffleIn, shuffleElsIn, fadeOut } from '~/utils/animations'

const props = defineProps<{
  progress: number
}>()

const store = useStore()
const { updateCursor } = store
const { cursor } = storeToRefs(store)

const { x, y } = useMouse()
const { addTicker, killTicker } = useRaf()

const progress = ref<number>(0)
const visible = ref<boolean>(true)
const playing = ref<boolean>(true)

const el = ref<HTMLElement>()
const barEl = ref<HTMLElement>()
const muteEl = ref<HTMLElement>()
const closeEl = ref<HTMLElement>()
const timelineEl = ref<HTMLElement>()

let _to: any

watch(
  [x, y],
  () => {
    visible.value = true
    _to && clearTimeout(_to)
    _to = setTimeout(() => {
      visible.value = cursor.value !== 'pause'
    }, 2000)
  },
  { immediate: true }
)

watch(visible, () => {
  const els: Array<HTMLElement> = []
  el.value && els.push(el.value)
  closeEl.value && els.push(closeEl.value)
  muteEl.value && els.push(muteEl.value)
  visible.value ? shuffleElsIn({ els: els }) : fadeOut({ el: els })
  updateCursor(visible.value ? 'pause' : 'default')
})

watch(playing, () => {
  updateCursor(playing.value ? 'pause' : 'play')
})

onMounted(() => {
  updateCursor('pause')
  addTicker(updateProgress)
})

function onClick(e: MouseEvent) {
  if (cursor.value === 'pause' || cursor.value === 'play') {
    e.preventDefault()
    e.stopPropagation()
    playing.value = !playing.value
    emit('toggle')
  }
}

function updateProgress() {
  progress.value += (props.progress - progress.value) * 0.025
  barEl.value && gsap.set(barEl.value, { x: toPercentage(-100 + 100 * progress.value) })
}

function onTimelineClick(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  const target = e.target as HTMLElement
  const { left, width } = target.getBoundingClientRect()
  const current = (e.clientX - left) / width
  progress.value = current
  emit('update', current)
}

function onButtonMouseEnter() {
  updateCursor('default')
}

function onButtonMouseLeave() {
  updateCursor('pause')
}

function onCloseButtonClick(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  emit('close')
}

function onMuteButtonClick(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  emit('mute')
}

onBeforeUnmount(() => {
  _to && clearTimeout(_to)
  killTicker(updateProgress)
})

const emit = defineEmits(['close', 'toggle', 'mute', 'update'])
</script>

<style lang="scss">
.home__hero__player {
  z-index: 9999999;
  width: 100%;
  height: var(--vh);
  pointer-events: auto;
  @include absolute-center;
  @include will-fade;

  &__close,
  &__mute {
    position: absolute;
    will-change: opacity;
    button {
      position: relative;
      width: toScale(5.6rem);
      height: toScale(5.6rem);
      background-color: black;
      border: none;
      padding: 0;
      border-radius: 100%;

      svg {
        width: toScale(3.2rem);
        @include absolute-center;
      }
    }
  }

  &__close {
    top: var(--layout-margin);
    right: var(--layout-margin);
    padding-left: toScale(3rem);
    padding-bottom: toScale(3rem);
    button {
      rotate: 45deg;
    }
  }

  &__mute {
    left: var(--layout-margin);
    bottom: var(--layout-margin);
    padding-top: toScale(3rem);
    padding-right: toScale(3rem);
  }

  &__timeline {
    max-width: calc(180rem - 180rem * 0.062);
    width: calc(93.8%);
    height: toScale(6rem);
    overflow: var(--overflow--hidden);
    will-change: opacity;
    @include absolute-center;

    &__progress {
      width: 100%;
      height: toScale(0.2rem);
      background-color: rgba(255, 255, 255, 0.5);
      @include absolute-center;

      &::before {
        content: ' ';
        position: absolute;
        left: 0;
        bottom: 0.1rem;
        width: toScale(0.2rem);
        height: toScale(1.2rem);
        background-color: white;
      }

      &__bar {
        pointer-events: none;
        background-color: white;
        transform: translateX(-100%);
        will-change: transform;
        @include absolute-fill;
        .svg__square {
          position: absolute;
          right: 0;
          bottom: 0.2rem;
          rect {
            fill: white;
          }
        }
      }
    }
  }
}
</style>
