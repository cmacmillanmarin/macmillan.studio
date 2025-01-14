<template>
  <div class="project__video">
    <video
      ref="videoEl"
      class="project__video__el"
      :width="data.width"
      :height="data.height"
      :alt="data.alt"
      muted
      loop
      playsinline
      v-intersect="{ callback: onIntersect }"
      @playing="enter">
      <source :src="data.webm" type="video/webm" />
      <source :src="data.mp4" type="video/mp4" />
    </video>
  </div>
</template>

<script lang="ts" setup>
import type { FileVideo } from '~/types/wordpress'
import { fadeIn } from '~/utils/animations'

const props = defineProps<{
  data: FileVideo
  ready?: boolean
  layout?: 'full' | 'top' | 'bottom' | 'center' | 'scroll'
  transparent: boolean
  bgColor: string
  first?: boolean
}>()

const { vw, vh } = useResize()
const { toScale } = useCss()
const { isMobileLayout } = useDevice()

const gap = computed<number>(() =>
  props.layout === 'top' || props.layout === 'bottom' || props.layout === 'center'
    ? toScale(isMobileLayout.value ? 150 : 260)
    : toScale(isMobileLayout.value && !!props.first ? 32 : 0)
)

const height = computed<string>(() => {
  if (isMobileLayout.value)
    return toPx(((vw.value - gap.value) * props.data.height) / props.data.width)
  return toPx(vh.value - gap.value)
})

const width = computed<string>(() => {
  if (isMobileLayout.value) return toPx(vw.value - gap.value)
  return toPx(((vh.value - gap.value) * props.data.width) / props.data.height)
})

const videoEl = ref<HTMLVideoElement>()

const active = ref<boolean>(false)
const inView = ref<boolean>(false)
const playing = ref<boolean>(false)
const background = ref<string>(props.transparent ? 'transparent' : props.bgColor)

let playPromise: Promise<void> | undefined = undefined

watch([() => props.ready, active, inView], () => {
  if (!active.value) return
  if (props.ready && inView.value) {
    playPromise = videoEl.value?.play()
  } else if (playing.value) {
    if (playPromise) {
      playPromise.then(() => {
        videoEl.value?.pause()
      })
    }
  }
})

watch([width, height], async () => {
  await nextTick()
  emit('update-scroll')
})

onMounted(() => {
  active.value = true
  console.log(props.data)
})

function onIntersect(el: HTMLElement, visible: boolean) {
  inView.value = visible
}

function enter() {
  playing.value = true
  fadeIn({ el: videoEl.value })
}

onBeforeUnmount(() => {
  active.value = false
  if (playPromise) {
    playPromise.then(() => {
      videoEl.value?.pause()
    })
  }
})

const emit = defineEmits(['update-scroll'])
</script>

<style lang="scss">
.project__video {
  background-color: v-bind(background);
  &__el {
    display: block;
    width: v-bind(width);
    height: v-bind(height);
    @include will-fade;
  }
}
</style>
