<template>
  <div class="project__video">
    <video
      ref="videoEl"
      class="project__video__el"
      :width="data.width"
      :height="data.height"
      muted
      loop
      v-intersect="{ callback: onIntersect }"
      @playing="enter">
      <source :src="data.src" :type="data.mime" />
    </video>
  </div>
</template>

<script lang="ts" setup>
import type { Video } from '~/types/wordpress'
import { fadeIn } from '~/utils/animations'

const props = defineProps<{
  data: Video
  ready?: boolean
  layout?: 'full' | 'top' | 'bottom' | 'scroll'
  bgColor: string
}>()

const { vh } = useResize()
const { toScale } = useCss()

const gap = computed<number>(() =>
  props.layout === 'top' || props.layout === 'bottom' ? toScale(260) : 0
)

const height = computed<string>(() => toPx(vh.value - gap.value))
const width = computed<string>(() =>
  toPx(((vh.value - gap.value) * props.data.width) / props.data.height)
)

const videoEl = ref<HTMLVideoElement>()

const inView = ref<boolean>(false)
const playing = ref<boolean>(false)

watch([() => props.ready, inView], () => {
  if (props.ready && inView.value) {
    videoEl.value?.play()
  } else if (playing.value) {
    videoEl.value?.pause()
  }
})

watch([width, height], async () => {
  await nextTick()
  emit('update-scroll')
})

function onIntersect(el: HTMLElement, visible: boolean) {
  inView.value = visible
}

function enter() {
  playing.value = true
  fadeIn({ el: videoEl.value })
}

const emit = defineEmits(['update-scroll'])
</script>

<style lang="scss">
.project__video {
  background-color: v-bind(bgColor);
  &__el {
    display: block;
    width: v-bind(width);
    height: v-bind(height);
    @include will-fade;
  }
}
</style>
