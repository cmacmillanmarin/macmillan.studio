<template>
  <div class="project__recognitions">
    <div class="project__recognitions__content">
      <div class="project__recognitions__content__list">
        <Separator :left="0" :start="true" />
        <p v-for="recognition in data" class="project__recognitions__content__list__label">
          {{ recognition }}
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  data: Array<string>
}>()
</script>

<style lang="scss">
.project__recognitions {
  &__content {
    height: var(--vh);
    display: flex;
    align-items: flex-end;
    padding: 0 12rem 4.4rem 16rem;
    &__list {
      max-width: 36rem;
      position: relative;
      padding-top: 1rem;
      &__label {
        @include t-b3;
      }
    }
  }
}
</style>
