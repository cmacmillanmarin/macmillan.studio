<template>
  <div class="project__youtube" v-intersect="{ callback: onIntersect }">
    <iframe
      v-if="loaded"
      ref="iframeEl"
      :src="embedURL"
      frameborder="0"
      allow="fullscreen; picture-in-picture; autoplay"
      allowfullscreen
      class="project__youtube__iframe" />
    <div
      ref="overlayEl"
      class="project__youtube__overlay"
      @mouseenter="onMouseEnter"
      @mouseleave="onMouseLeave"
      @click="onClick">
      <button v-if="touch && !playing" class="project__youtube__overlay__button">
        <SvgPlay />
      </button>
      <SvgYoutube />
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

const loaded = ref<boolean>(false)
const playing = ref<boolean>(false)
const cursorOnHover = ref<'play' | 'pause'>('play')

let _player: any
let _api: Promise<void> | null = null
let _resetting: boolean = false

// autoplay: the iframe is only mounted on click, so the player goes straight
// to playback and never paints its branded poster with the title and channel.
// controls: no ui, rel: no related videos from other channels,
// iv_load_policy: no annotations, cc_load_policy: no captions,
// disablekb + fs: no keyboard shortcuts nor fullscreen button.
const params: string = [
  'enablejsapi=1',
  'autoplay=1',
  'controls=0',
  'rel=0',
  'iv_load_policy=3',
  'cc_load_policy=0',
  'disablekb=1',
  'fs=0',
  'playsinline=1',
].join('&')

const videoId = computed<string>(() => {
  const src = (props.src || '').trim()
  const match = src.match(/(?:youtu\.be\/|\/embed\/|\/shorts\/|\/live\/|[?&]v=)([\w-]{11})/)
  return match ? match[1] : src
})

const embedURL = computed<string>(
  () => `https://www.youtube-nocookie.com/embed/${videoId.value}?${params}`
)

// Stacked backgrounds: maxres is missing on some videos and simply
// does not paint, so hq shows through as the fallback.
const poster = computed<string>(
  () =>
    `url(https://i.ytimg.com/vi/${videoId.value}/maxresdefault.jpg), url(https://i.ytimg.com/vi/${videoId.value}/hqdefault.jpg)`
)

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

// The iframe api script exposes window.YT before YT.Player is usable,
// so we also wait for the api ready callback.
function loadApi(): Promise<void> {
  if (!_api) {
    _api = new Promise(async resolve => {
      await loadScript({ src: 'https://www.youtube.com/iframe_api', name: 'YT' })
      if (window.YT?.Player) {
        resolve()
        return
      }
      const previous = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        previous && previous()
        resolve()
      }
    })
  }
  return _api
}

// Hiding the iframe uncovers the poster underneath, which keeps youtube
// from showing its own paused ui, and also covers the initial loading.
function updateState(state: number) {
  if (state === YT.PlayerState.PLAYING) {
    playing.value = true
    fadeIn({ el: iframeEl.value, duration: 0.4 })
    fadeOut({ el: overlayEl.value })
  } else if (state === YT.PlayerState.PAUSED) {
    playing.value = false
    fadeOut({ el: iframeEl.value, duration: 0.4 })
    fadeIn({ el: overlayEl.value })
  } else if (state === YT.PlayerState.ENDED) {
    playing.value = false
    fadeOut({ el: iframeEl.value, duration: 0.4 })
    fadeIn({ el: overlayEl.value })
    reset()
  }
}

function onStateChange(event: { data: number }) {
  // Ignore the states triggered by rewinding on ended.
  if (_resetting) {
    if (event.data === YT.PlayerState.PAUSED) _resetting = false
    return
  }
  updateState(event.data)
}

// Rewinding to the start hides the end screen with the suggested videos.
function reset() {
  _resetting = true
  _player.seekTo(0)
  _player.pauseVideo()
}

async function play() {
  _resetting = false
  if (!_player) {
    loaded.value = true
    await Promise.all([loadApi(), nextTick()])
    await new Promise<void>(resolve => {
      _player = new YT.Player(iframeEl.value, {
        events: {
          // Autoplay may have started before the listener was attached.
          onReady: () => {
            updateState(_player.getPlayerState())
            resolve()
          },
          onStateChange,
        },
      })
    })
  }
  _player.playVideo()
}

function pause() {
  if (!_player) return
  _player.pauseVideo()
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
.project__youtube {
  position: relative;
  width: v-bind(width);
  height: v-bind(height);
  background-color: var(--black);
  background-image: v-bind(poster);
  background-size: cover;
  background-position: center;
  &__iframe {
    display: block;
    width: 100%;
    height: 100%;
    opacity: 0;
    will-change: opacity;
    // The player is driven through the api, so blocking the pointer
    // keeps youtube from showing its title bar and buttons on hover.
    pointer-events: none;
    @include absolute-fill;
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
    .svg__youtube {
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
