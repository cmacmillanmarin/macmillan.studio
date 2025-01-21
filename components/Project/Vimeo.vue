<template>
  <div class="project__vimeo" v-intersect="{ callback: onIntersect }">
    <iframe
      ref="iframeEl"
      :src="`${src}?title=0&byline=0&portrait=0&controls=0`"
      frameborder="0"
      allow="fullscreen; picture-in-picture; autoplay"
      allowfullscreen
      class="project__vimeo__iframe" />
    <div
      ref="overlayEl"
      class="project__vimeo__overlay"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
      @click="onClick">
      <button v-if="touch && !playing" class="project__vimeo__overlay__button">
        <SvgPlay />
      </button>
      <SvgVimeo />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { loadScript } from '~/utils'
import useStore from '~/store/useStore'

const props = defineProps<{
  src: string
  mobile: boolean
}>()

const { updateCursor } = useStore()

const { vw, vh } = useResize()
const { toScale } = useCss()
const { touch } = useDevice()
const { isMobileLayout } = useDevice()

const gap = computed<number>(() => toScale(isMobileLayout.value ? (props.mobile ? 0 : 32) : 260))

const overlayEl = ref<HTMLDivElement>()
const iframeEl = ref<HTMLIFrameElement>()

const playing = ref<boolean>(false)
const cursorOnHover = ref<'play' | 'pause'>('play')

let _player: any

const height = computed<string>(() => {
  if (isMobileLayout.value) return toPx(Math.ceil(((vw.value - gap.value) * 9) / 16))
  return toPx(Math.ceil(vh.value - gap.value))
})

const width = computed<string>(() => {
  if (isMobileLayout.value) return toPx(Math.ceil(vw.value - gap.value))
  return toPx(Math.ceil(((vh.value - gap.value) * 16) / 9))
})

watch(playing, () => {
  if (playing.value) {
    cursorOnHover.value = 'pause'
  } else {
    cursorOnHover.value = 'play'
  }
})

watch(cursorOnHover, () => {
  updateCursor(cursorOnHover.value)
})

watch([width, height], async () => {
  await nextTick()
  emit('update-scroll')
})

function onClick() {
  playing.value ? pause() : play()
}

async function play() {
  if (!_player) {
    await loadScript({ src: 'https://player.vimeo.com/api/player.js', name: 'Vimeo' })
    _player = new Vimeo.Player(iframeEl.value)
    _player.on('play', () => {
      playing.value = true
      fadeOut({ el: overlayEl.value })
    })
    _player.on('pause', () => {
      playing.value = false
      fadeIn({ el: overlayEl.value })
    })
    _player.on('ended', () => {
      playing.value = false
      fadeIn({ el: overlayEl.value })
    })
  }
  _player.play()
}

function pause() {
  if (!_player) return
  _player.pause()
}

function onMouseEnter() {
  updateCursor(cursorOnHover.value)
}

function onMouseLeave() {
  updateCursor('close')
}

function onIntersect(el: HTMLElement, visible: boolean) {
  if (playing.value && !visible) pause()
}

onBeforeUnmount(() => {
  if (_player) _player.destroy()
})

const emit = defineEmits(['update-scroll'])
</script>

<style lang="scss">
.project__vimeo {
  position: relative;
  &__iframe {
    display: block;
    width: v-bind(width);
    height: v-bind(height);
  }
  &__overlay {
    background-color: rgba(0, 0, 0, 0.6);
    will-change: opacity;
    @include absolute-fill;
    &__button {
      display: block;
      padding: 0;
      margin: 0;
      background-color: var(--black);
      border-radius: 100%;
      width: toScale(5.6rem, 37.5rem);
      height: toScale(5.6rem, 37.5rem);
      @include absolute-center;
      @include from__tablet--landscape {
        width: toScale(8rem);
        height: toScale(8rem);
      }
      svg {
        left: 55% !important;
        @include absolute-center;
      }
    }
    .svg__vimeo {
      position: absolute;
      bottom: toScale(1.2rem, 37.5rem);
      left: toScale(1.2rem, 37.5rem);
      @include from__tablet--landscape {
        bottom: toScale(3.2rem);
        left: toScale(3.2rem);
      }
    }
  }
}
</style>
