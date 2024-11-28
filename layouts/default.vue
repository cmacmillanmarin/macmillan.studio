<template>
  <div ref="el" class="__layout">
    <Header />
    <slot />
    <Three />

    <ClientOnly>
      <Cursor v-if="!touch" />
      <div class="__layout__top-layer" id="top-layer" />
      <div class="__layout__top-layer--blend" id="top-layer-blend" />
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'

const store = useStore()
const { updateLoading } = store
const { isPreloaded, isInProject } = storeToRefs(store)

const scroll = useScroll()

const { touch } = useDevice()

const el = ref<HTMLElement>()

watch(isPreloaded, () => {
  init()
})

onMounted(() => {
  isPreloaded.value && init()
})

async function init() {
  await nextTick()
  isInProject.value && updateLoading(false)
  el.value && scroll.init({ el: el.value })
}
</script>

<style lang="scss">
.__layout {
  .header {
    position: absolute;
    z-index: 10;
    bottom: 0;
    left: 50%;
    width: 100%;
    transform: translateX(-50%);
  }

  .three {
    z-index: 6;
    @include absolute-fill();
  }

  .cursor {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 11;
  }

  &__top-layer {
    z-index: 7;
    pointer-events: none;
    overflow: var(--overflow--hidden);
    @include absolute-fill();
    &--blend {
      @extend .__layout__top-layer;
      mix-blend-mode: difference;
      z-index: 8;
    }
  }
}
</style>
