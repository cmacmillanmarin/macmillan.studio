<template>
  <SvgProjectWallpapersGoogle
    v-if="!isMobileLayout"
    v-transition:in="{ callback: animation ? shuffleIn : () => {} }" />
  <Ticker
    v-else
    :drag-on-target="true"
    :ignore-update-scroll="true"
    class="svg__project__wallpapers__ticker"
    @update="emit('update-scroll')">
    <div v-for="i in 2" :key="i">
      <SvgProjectWallpapersGoogle
        v-transition:in="{ callback: animation ? shuffleIn : () => {} }" />
    </div>
  </Ticker>
  <SvgProjectWallpapersPixels v-transition:in="{ callback: animation ? shuffleIn : () => {} }" />
</template>

<script lang="ts" setup>
import { shuffleIn } from '~/utils/animations'

defineProps<{
  animation: boolean
}>()

const { isMobileLayout } = useDevice()

const emit = defineEmits(['update-scroll'])
</script>

<style lang="scss">
.svg__project__wallpapers__ticker {
  margin-bottom: var(--layout-gutter);
  > div {
    padding-right: toScale(3.2rem, 37.5rem);
  }
}
.svg__project__wallpapers__pixels {
  margin: 0 auto;
  @include from__tablet--landscape {
    margin: 0;
  }
}
</style>
