<template>
  <main
    :class="[
      '__main',
      { '__main--loading': isLoading },
      { '__main--preloading': !scrollMode },
      { '__main--native-scroll': !isVirtualScroll },
    ]">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <Grid v-if="gridType === 'default'" />
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
const { scrollMode, isVirtualScroll } = storeToRefs(useScrollStore())

const { keyPressed } = useKeyboard()

let index: number = 0
const grids: Array<GridType> = ['none', 'default', 'golden-ratio', 'rule-of-thirds']

watch(keyPressed, () => {
  if (!IS_PRODUCTION && (keyPressed.value === 'g' || keyPressed.value === 'G')) {
    index++
    store.updateGrid(grids[index % grids.length])
  }
})
</script>

<style lang="scss">
.__main {
  // Containing block for the header: without it `.header { bottom: 0 }` resolves against
  // the initial containing block, which mobile browsers size with their chrome retracted,
  // so the logo and the nav links landed below the visible area until the chrome collapsed.
  // The height is overwritten inline by the virtual scroller with the measured viewport;
  // this keeps the box defined on the frames before that runs.
  position: relative;
  height: var(--vh);

  // * {
  //   cursor: none !important;
  // }

  &--loading {
    * {
      cursor: progress !important;
    }
  }

  &--pointer {
    * {
      cursor: pointer !important;
    }
  }

  &--native-scroll {
    height: var(--vh);
    overflow: hidden;
    .__layout {
      height: var(--vh);
      overflow: scroll;
      &::-webkit-scrollbar {
        width: default;
        height: default;
      }
      .c-page {
        height: max-content;
      }
    }
  }

  &--preloading {
    height: var(--vh);
    overflow: hidden;
    .__layout {
      height: var(--vh);
      overflow: hidden;
    }
  }
}
</style>
