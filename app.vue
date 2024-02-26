<template>
  <main
    class="__main"
    :class="[{ '__main--loading': isLoading }, { '__main--native-scroll': !isVirtualScroll }]"
    style="opacity: 0"
    v-transition:in="{ callback: enter }">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <HelpersGrid v-if="gridType === 'default'" />
  </main>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useScrollStore from './store/useScrollStore'
import type { GridType } from '~/types/front/store'

const config = useRuntimeConfig()
const { IS_PRODUCTION } = config.public

const store = useStore()
const { isLoading, gridType } = storeToRefs(store)
const { isVirtualScroll } = storeToRefs(useScrollStore())

const { keyPressed } = useKeyboard()

watch(keyPressed, (): void => {
  if (!IS_PRODUCTION && (keyPressed.value === 'g' || keyPressed.value === 'G')) {
    const type: GridType =
      gridType.value === 'none' ? 'default' : gridType.value === 'default' ? 'golden' : 'none'
    store.updateGrid(type)
  }
})

function enter(params: { el: HTMLElement }) {
  gsap.set(params.el, { opacity: 1 })
}
</script>

<style lang="scss">
.__main {
  will-change: opacity;

  &--loading {
    * {
      cursor: progress !important;
    }
  }

  &--native-scroll {
    height: var(--vh);
    overflow: hidden;
    .__layout {
      height: var(--vh);
      overflow: scroll;
      .c-page {
        height: max-content;
      }
    }
  }
}
</style>
