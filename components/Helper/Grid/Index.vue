<template>
  <div class="c-helper-grid">
    <ClientOnly>
      <div class="c-helper-grid__columns">
        <div v-for="i in columns" class="c-helper-grid__columns__column" />
      </div>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
const columns = computed(() => 24)
</script>

<style lang="scss" scoped>
.c-helper-grid {
  position: fixed;
  pointer-events: none;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999999;
  &__columns {
    @include grid();
    height: 100%;
    border-left: 1px solid magenta;
    border-right: 1px solid magenta;
    &__column {
      @include columns('1');
      @include columns('1', 'tablet--landscape');
      height: 100%;
      background: magenta;
      opacity: 0.2;
    }
  }
}
</style>
