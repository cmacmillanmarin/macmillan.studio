<template>
  <div ref="el" class="__layout">
    <Header />
    <slot />

    <Three />

    <ClientOnly>
      <Cursor />

      <div class="__layout__top-layer" id="top-layer" />
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'

const store = useStore()
const { isPreloaded } = storeToRefs(store)

const scroll = useScroll()

const el = ref<HTMLElement>()

watch(isPreloaded, () => {
  el.value && init()
  store.updateLoading(false)
})

onMounted(async (): Promise<void> => {
  if (isPreloaded.value) {
    // Await ClientOnly Template
    await nextTick()
    init()
  }
})

function init() {
  el.value && scroll.init({ el: el.value })
}

onUnmounted(() => {})
</script>

<style lang="scss">
.__layout {
  .header {
    position: absolute;
    z-index: 9;
    bottom: 0;
    left: 50%;
    width: 100%;
    transform: translateX(-50%);
  }
  .three {
    @include absolute-fill();
    z-index: 7;
  }
  .cursor {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 9;
  }
  &__top-layer {
    @include absolute-fill();
    z-index: 8;
    pointer-events: none;
    overflow: var(--overflow--hidden);
  }
}
</style>
