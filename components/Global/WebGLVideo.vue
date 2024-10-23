<template>
  <div class="webgl-video">
    <video ref="videoEl" :width="data.width" :height="data.height" muted loop>
      <source :src="data.src" :type="data.mime" />
    </video>
  </div>
</template>

<script lang="ts" setup>
import type { Video } from '~/types/wordpress'

const props = defineProps<{
  data: Video
  ready: boolean
  bgColor: string
}>()

const { vh } = useResize()

const height = computed<string>(() => toPx(vh.value))
const width = computed<string>(() => toPx((vh.value * props.data.width) / props.data.height))

const videoEl = ref<HTMLVideoElement>()

watch(
  () => props.ready,
  () => {
    videoEl.value?.play()
  }
)
</script>

<style lang="scss">
.webgl-video {
  background-color: v-bind(bgColor);
  video {
    width: v-bind(width);
    height: v-bind(height);
  }
}
</style>
