<template>
  <div ref="el" class="__layout __layout--lab">
    <slot />
    <ClientOnly>
      <Three :lab="true" />
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'

const store = useStore()
const { updateLoading } = store
const { isPreloaded } = storeToRefs(store)

const scroll = useScroll()

const el = ref<HTMLElement>()

watch(isPreloaded, () => {
  init()
})

onMounted(() => {
  isPreloaded.value && init()
})

async function init() {
  await nextTick()
  updateLoading(false)
  el.value && scroll.init({ el: el.value })
}

onBeforeUnmount(() => {
  scroll.destroy()
})
</script>

<style lang="scss">
.__layout {
  &--lab {
    position: relative;
    height: var(--vh);
    background-color: var(--black);
  }
  .three {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
}
</style>
