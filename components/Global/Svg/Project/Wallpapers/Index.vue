<template>
  <SvgProjectWallpapersGoogle
    v-if="!isMobileLayout"
    v-transition:in="{ callback: animation ? shuffleIn : () => {} }" />
  <Ticker
    v-else
    ref="tickerEl"
    :drag-on-target="true"
    :ignore-update-scroll="true"
    :ticker="!next ? inProjectNextProjectTicker : undefined"
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
import useStore from '~/store/useStore'
import { shuffleIn } from '~/utils/animations'
import Ticker from '~/components/Global/Ticker.vue'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  next: boolean
  animation: boolean
}>()

const store = useStore()
const { updateInProjectNextProjectTicker } = store
const { inProjectNextProjectTicker } = storeToRefs(store)

const { isMobileLayout } = useDevice()

const tickerEl = ref<typeof Ticker>()

onBeforeUnmount(() => {
  if (props.next && tickerEl.value) {
    tickerEl.value.pause()
    updateInProjectNextProjectTicker(tickerEl.value.getNextProjectTicker())
  }
})

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
