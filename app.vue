<template>
  <main
    class="__main"
    :class="[{ '__main--loading': isLoading }, { '__main--native-scroll': !isVirtualScroll }]">
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
const { isVirtualScroll } = storeToRefs(useScrollStore())

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
      &::-webkit-scrollbar {
        width: default;
        height: default;
      }
      .c-page {
        height: max-content;
      }
    }
  }
}
</style>
