<template>
  <div class="grid">
    <ClientOnly>
      <div class="grid__columns">
        <div v-for="i in columns" class="grid__columns__column" />
      </div>
      <div class="grid__vertical">
        <div v-for="i in vertical" class="grid__vertical__line" />
      </div>
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
const { vh } = useResize()
const { isMobileLayout } = useDevice()
const columns = computed(() => (isMobileLayout.value ? 8 : 12))
const vertical = computed(() => Math.ceil(vh.value / 16))
</script>

<style lang="scss" scoped>
.grid {
  pointer-events: none;
  z-index: 999999;
  @include absolute-fill();
  &__vertical {
    @include absolute-fill();
    &__line {
      height: 1px;
      opacity: 0.4;
      background-color: magenta;
      margin-top: 15px;
    }
  }
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
