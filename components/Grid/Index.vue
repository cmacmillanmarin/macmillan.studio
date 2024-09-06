<template>
  <div class="grid">
    <ClientOnly>
      <div class="grid__columns">
        <div v-for="i in columns" class="grid__columns__column" />
      </div>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
const columns = computed(() => 12)
</script>

<style lang="scss" scoped>
.grid {
  position: absolute;
  pointer-events: none;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 999999;
  &__columns {
    height: 100%;
    border-left: 1px solid magenta;
    border-right: 1px solid magenta;
    @include grid();
    &__column {
      height: 100%;
      background: magenta;
      opacity: 0.2;
      @include columns('1');
      @include columns('1', 'tablet--landscape');
    }
  }
}
</style>
