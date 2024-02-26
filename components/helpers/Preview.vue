<template>
  <div class="helpers-preview">
    <p class="t-b1 t-white">
      Site Preview <span>{{ isLoading ? '⏳' : '👀' }}</span>
    </p>
  </div>
</template>

<script lang="ts" setup>
import useStore from '~/store/useStore'

const store = useStore()
const isLoading = computed<boolean>(() => store.isLoading)
</script>

<style lang="scss">
.helpers-preview {
  position: fixed;
  z-index: 9999;
  bottom: var(--layout-indent);
  left: var(--layout-indent);
  background-color: var(--burgundy--dark);
  padding: 1.2rem 2rem;
  padding-right: 1.4rem;
  border-radius: var(--border-radius--m);
  border: 0.1rem solid var(--beige);
  span {
    display: inline-block;
    margin-left: 0.7rem;
  }
}
</style>
