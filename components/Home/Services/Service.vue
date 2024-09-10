<template>
  <div ref="el" class="home__services__service">
    <Separator />
    <div class="home__services__service__content">
      <div class="home__services__service__content__title">
        <h3 class="home__services__service__content__title__label">{{ data.title }}</h3>
      </div>
      <div class="home__services__service__content__description" v-html="data.description" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Service } from '~/types/wordpress/service'

defineProps<{
  index: number
  data: Service
}>()
</script>

<style lang="scss">
.home__services__service {
  position: relative;
  max-width: var(--layout-max-width);
  padding-top: 4rem;
  margin: 0 auto;

  &:last-child {
    .home__services__service__content {
      padding-bottom: 18rem;
    }
  }

  .separator {
    z-index: 2;
    top: 4rem;
    left: calc(var(--layout-column-width) * 2 + var(--layout-gutter) * 3);
    width: calc(var(--layout-column-width) * 10 + var(--layout-gutter) * 9);
  }

  &__content {
    position: relative;
    z-index: 1;

    background-color: var(--light-grey);
    padding-top: 1.2rem;

    @include grid;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      transform: translateY(100%);
      height: 10.4rem;
      background-color: var(--light-grey);
    }

    &__title {
      @include t-b1;
      @include gap(2, 'left', 'desktop');
      @include columns(4, 'desktop');
    }
    &__description {
      @include t-b1;
      @include columns(6, 'desktop');
    }
  }
}
</style>
