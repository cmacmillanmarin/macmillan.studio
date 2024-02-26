<template>
  <div class="debug-grid">
    <div class="grid">
      <ClientOnly>
        <div
          v-for="i in columns"
          class="grid__col grid__col-1--mobile grid__col-1--tablet grid__col-1--desktop" />
      </ClientOnly>
    </div>
  </div>
</template>

<script lang="ts" setup>
const columns = computed(() => 24)
</script>

<style lang="scss" scoped>
.debug-grid {
  position: fixed;
  pointer-events: none;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  .c-helper-grid-golden-ratio {
    position: absolute;
    top: 0;
    left: 0;
  }
  .grid {
    height: 100%;
    border-left: 1px solid #00ff47;
    border-right: 1px solid #00ff47;
    &__col {
      height: 100%;
      background: #00ff47;
      opacity: 0.2;
    }
  }
}
</style>
