<template>
  <ClientOnly>
    <Teleport :to="blend ? '#top-layer-blend' : '#top-layer'">
      <div
        ref="el"
        :class="['home__hero__player', { 'home__hero__player--blend': blend }]"
        v-transition:in="{ callback: shuffleIn }"
        @click="onClick">
        <transition
          mode="out-in"
          :css="false"
          :appear="true"
          @leave="transitionDone"
          @enter="delayedShuffleIn">
          <div
            v-if="!blend && !isMobileLayout"
            ref="closeEl"
            class="home__hero__player__close"
            @mouseenter="onButtonMouseEnter"
            @mouseleave="onButtonMouseLeave">
            <button @click="onCloseButtonClick">
              <SvgClose />
            </button>
          </div>
          <div v-else-if="!blend" ref="toggleEl" class="home__hero__player__toggle">
            <button @click="onToggleButtonClick">
              <transition
                mode="out-in"
                :css="false"
                :appear="true"
                @leave="transitionDone"
                @enter="transitionShuffleIn">
                <SvgLoading v-if="!ready" />
                <SvgPause v-else-if="playing" />
                <SvgPlay v-else />
              </transition>
            </button>
          </div>
        </transition>

        <transition
          mode="out-in"
          :css="false"
          :appear="true"
          @leave="transitionDone"
          @enter="transitionFadeIn">
          <div
            v-if="blend && ready"
            ref="timelineEl"
            class="home__hero__player__timeline"
            @click="onTimelineClick"
            @mouseenter="onTimelineMouseEnter"
            @mousemove="onTimelineMouseMove"
            @mouseleave="onTimelineMouseLeave">
            <div class="home__hero__player__timeline__progress">
              <div ref="barEl" class="home__hero__player__timeline__progress__bar">
                <SvgSquare />
              </div>
            </div>
          </div>
        </transition>

        <transition
          mode="out-in"
          :css="false"
          :appear="true"
          @leave="transitionDone"
          @enter="transitionShuffleIn">
          <div
            v-if="!blend && ready"
            ref="muteEl"
            class="home__hero__player__mute"
            @mouseenter="onButtonMouseEnter"
            @mouseleave="onButtonMouseLeave">
            <button @click="onMuteButtonClick">
              <SvgMute :state="muted || !playing || !ready" />
            </button>
          </div>
        </transition>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap/gsap-core'
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import { toPercentage } from '~/utils'
import { fadeIn, shuffleIn, fadeOut } from '~/utils/animations'

const props = defineProps<{
  ready: boolean
  progress: number
  blend?: boolean
}>()

const store = useStore()
const { updateCursor, updateCursorPosition } = store
const { cursor, headerMobileButtonClicked } = storeToRefs(store)

const { x, y } = useMouse()
const { addTicker, killTicker } = useRaf()
const { isMobileLayout } = useDevice()
const { toScale } = useCss()

const progress = ref<number>(0)
const visible = ref<boolean>(true)
const playing = ref<boolean>(true)
const muted = ref<boolean>(false)

const el = ref<HTMLElement>()
const barEl = ref<HTMLElement>()
const muteEl = ref<HTMLElement>()
const closeEl = ref<HTMLElement>()
const timelineEl = ref<HTMLElement>()

let _to: any

watch(headerMobileButtonClicked, () => {
  emit('close')
})

watch(
  [x, y, () => props.ready],
  () => {
    if (!props.ready) return
    visible.value = true
    _to && clearTimeout(_to)
    _to = setTimeout(() => {
      visible.value = cursor.value !== 'pause' || isMobileLayout.value
    }, 2000)
  },
  { immediate: true }
)

watch(visible, () => {
  const els: Array<HTMLElement> = []
  el.value && els.push(el.value)
  closeEl.value && els.push(closeEl.value)
  muteEl.value && els.push(muteEl.value)
  visible.value ? fadeIn({ el: els }) : fadeOut({ el: els })
  updateCursor(visible.value ? 'pause' : 'default')
})

watch([() => props.ready, playing], () => {
  updateCursor(!props.ready ? 'loading' : playing.value ? 'pause' : 'play')
})

onMounted(async () => {
  updateCursor('loading')
  addTicker(updateProgress)
  await nextTick()
  getKeyboardFocusableElements(el.value).forEach(el => {
    el.addEventListener('focus', onElementFocus)
  })
})

function onClick(e: MouseEvent) {
  if (isMobileLayout.value) return
  if (cursor.value === 'pause' || cursor.value === 'play') {
    e.preventDefault()
    e.stopPropagation()
    playing.value = !playing.value
    emit('toggle')
  }
}

function updateProgress() {
  if (!props.ready) return
  progress.value += (props.progress - progress.value) * 0.025
  barEl.value && gsap.set(barEl.value, { x: toPercentage(-100 + 100 * progress.value) })
}

function onTimelineClick(e: MouseEvent) {
  if (props.ready) {
    e.preventDefault()
    e.stopPropagation()
    const target = e.target as HTMLElement
    const { left, width } = target.getBoundingClientRect()
    const current = (e.clientX - left) / width
    progress.value = current
    emit('update', current)
  }
}

function onElementFocus() {
  visible.value = true
}

function onTimelineMouseEnter(e: MouseEvent) {
  if (props.ready) {
    updateCursor('default')
    onTimelineMouseMove(e)
  }
}

function onTimelineMouseMove(e: MouseEvent) {
  if (timelineEl.value && props.ready) {
    const { top } = timelineEl.value.getBoundingClientRect()
    updateCursorPosition({ x: e.clientX - toScale(12), y: top + toScale(16) })
  }
}

function onTimelineMouseLeave() {
  updateCursorPosition({ x: -1, y: -1 })
  updateCursor(!props.ready ? 'loading' : playing.value ? 'pause' : 'play')
}

function onButtonMouseEnter() {
  updateCursor('none')
}

function onButtonMouseLeave() {
  updateCursor(!props.ready ? 'loading' : playing.value ? 'pause' : 'play')
}

async function delayedShuffleIn(el: Element, done: Function) {
  await sleep(isMobileLayout.value ? 400 : 0)
  el && shuffleIn({ el: el as HTMLElement, done })
}

function onToggleButtonClick(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  playing.value = !playing.value
  emit('toggle')
}

function onCloseButtonClick(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  emit('close')
}

function onMuteButtonClick(e: MouseEvent) {
  e.preventDefault()
  e.stopPropagation()
  muted.value = !muted.value
  emit('mute')
}

onBeforeUnmount(() => {
  _to && clearTimeout(_to)
  killTicker(updateProgress)
  getKeyboardFocusableElements(el.value).forEach(el => {
    el.removeEventListener('focus', onElementFocus)
  })
})

const emit = defineEmits(['close', 'pause', 'toggle', 'mute', 'update'])
</script>

<style lang="scss">
.home__hero__player {
  width: 100%;
  height: var(--vh);
  z-index: 9999999;
  pointer-events: auto;
  @include will-fade;
  @include absolute-center;

  &--blend {
    pointer-events: none;
  }

  &__close,
  &__mute,
  &__toggle {
    position: absolute;
    @include will-fade;

    button {
      position: relative;
      width: toScale(5.6rem, 37.5rem);
      height: toScale(5.6rem, 37.5rem);
      background-color: black;
      border: none;
      padding: 0;
      border-radius: 100%;

      @include from__tablet--landscape {
        width: toScale(5.6rem);
        height: toScale(5.6rem);
      }
    }
  }

  &__toggle {
    right: var(--layout-margin);
    top: var(--layout-margin);
    button {
      svg {
        @include will-fade;
        @include absolute-center;
      }
      .svg__play {
        transform: translate(-35%, -50%);
      }
    }
  }

  &__close {
    top: var(--layout-margin);
    right: var(--layout-margin);

    @include from__tablet--landscape {
      padding-left: toScale(3rem);
      padding-bottom: toScale(3rem);
    }

    @include from__desktop--x-large {
      right: calc((100% - var(--layout-max-width)) * 0.5 + var(--layout-margin));
    }

    button {
      rotate: 45deg;

      .svg__close {
        width: toScale(2.4rem, 37.5rem);
        height: auto;
        @include absolute-center;
        @include from__tablet--landscape {
          width: toScale(3.2rem);
        }
      }
    }
  }

  &__mute {
    top: var(--layout-margin);
    left: var(--layout-margin);
    @include from__tablet--landscape {
      padding-bottom: toScale(3rem);
      padding-right: toScale(3rem);
    }

    @include from__desktop--x-large {
      left: calc((100% - var(--layout-max-width)) * 0.5 + var(--layout-margin));
    }

    button {
      svg {
        @include absolute-center;
      }
    }
  }

  &__timeline {
    pointer-events: auto;
    width: calc(100% - var(--layout-margin) * 2);
    height: toScale(6rem, 37.5rem);
    overflow: var(--overflow--hidden);
    will-change: opacity;
    @include will-fade;
    @include absolute-center;

    @include from__tablet--landscape {
      height: toScale(6rem);
      max-width: calc(180rem - 180rem * 0.062);
      width: calc(93.8%);
    }

    &__progress {
      width: 100%;
      height: toScale(0.2rem, 37.5rem);
      background-color: rgba(255, 255, 255, 0.5);
      @include absolute-center;

      @include from__tablet--landscape {
        height: toScale(0.2rem);
      }

      &::before {
        content: ' ';
        position: absolute;
        left: 0;
        bottom: 0.1rem;
        width: toScale(0.2rem, 37.5rem);
        height: toScale(0.8rem, 37.5rem);
        background-color: white;
        @include from__tablet--landscape {
          width: toScale(0.2rem);
          height: toScale(1.2rem);
        }
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
          bottom: toScale(0.2rem, 37.5rem);
          @include from__tablet--landscape {
            bottom: toScale(0.2rem);
          }
          rect {
            fill: white;
          }
        }
      }
    }
  }
}
</style>
