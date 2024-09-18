<template>
  <div class="home__about__gallery__image">
    <div class="home__about__gallery__image__content">
      <p>{{ pos }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  pos: number
  columns: number
}>()
</script>

<style lang="scss">
.home__about__gallery__image {
  padding-right: var(--layout-gutter);

  &__content {
    width: toColumns(v-bind(columns));
    aspect-ratio: 1;
    background-color: var(--light-grey);
    border-radius: toScale(1.6rem);
    display: flex;
    justify-content: center;
    align-items: center;
    @include t-h1;
  }
}
</style>
