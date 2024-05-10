<template>
  <div class="services" id="services-target" data-scroll-target-top>
    <div class="services__hint">
      <h2 class="services__hint__label">{{ data.hint }}</h2>
    </div>
    <Service v-for="(service, i) in data.list" :index="i" :data="service" data-scroll-sticky />
  </div>
</template>

<script lang="ts" setup>
import type { Services } from '~/types/data'

defineProps<{
  data: Services
}>()
</script>

<style lang="scss">
.services {
  background-color: grey;
  padding: 4rem 0;

  &__hint {
    @include grid;

    h2 {
      @include columns(8, 'desktop');
      @include gap(4, 'left', 'desktop');
      @include t-h2;
      padding: 2rem 0;
    }
  }
}
</style>
