<template>
  <div :class="['svg__project__wallpapers', { 'svg__project__wallpapers--animation': animation }]">
    <template v-if="isMobileLayout">
      <Ticker
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
      <SvgProjectWallpapersPixels
        v-transition:in="{ callback: animation ? shuffleIn : () => {} }" />
    </template>
    <template v-else>
      <SvgProjectWallpapersGoogle
        v-transition:in="{ callback: animation ? shuffleIn : () => {} }" />
      <div class="svg__project__wallpapers__flex">
        <SvgProjectWallpapersPixels
          v-transition:in="{ callback: animation ? shuffleIn : () => {} }" />
        <SvgProjectWallpapersPixels
          v-transition:in="{ callback: animation ? shuffleIn : () => {} }" />
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import useStore from '~/store/useStore'
import { shuffleIn } from '~/utils/animations'
import Ticker from '~/components/Global/Ticker.vue'
import { storeToRefs } from 'pinia'

const props = defineProps<{
  next: boolean
  animation: boolean
  color?: string
}>()

const store = useStore()
const { updateInProjectNextProjectTicker } = store
const { inProjectNextProjectTicker } = storeToRefs(store)

const { isMobileLayout } = useDevice()

const tickerEl = ref<typeof Ticker>()

const fill = computed(() => props.color || 'var(--black)')

onBeforeUnmount(() => {
  if (props.next && tickerEl.value) {
    tickerEl.value.pause()
    updateInProjectNextProjectTicker(tickerEl.value.getNextProjectTicker())
  }
})

const emit = defineEmits(['update-scroll'])
</script>

<style lang="scss">
.svg__project__wallpapers {
  &--animation {
    svg {
      > path,
      > g {
        @include will-fade;
      }
    }
  }
  &__ticker {
    margin-bottom: var(--layout-gutter);
    > div {
      padding-right: toScale(3.2rem, 37.5rem);
    }
  }
  &__flex {
    display: flex;
    column-gap: toScale(3.2rem);
    margin-top: toScale(1.2rem);
  }
  &__pixels {
    margin: 0 auto;
    @include from__tablet--landscape {
      margin: 0;
    }
  }
  svg path {
    fill: v-bind(fill);
  }
}
</style>
