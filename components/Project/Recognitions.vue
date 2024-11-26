<template>
  <div class="project__recognitions">
    <div class="project__recognitions__content">
      <div class="project__recognitions__content__list">
        <ClientOnly>
          <Separator :left="isMobileLayout ? 8 : 3" />
        </ClientOnly>

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

const { isMobileLayout } = useDevice()
</script>

<style lang="scss">
.project__recognitions {
  &__content {
    display: flex;
    align-items: flex-end;
    padding: toScale(6rem, 37.5rem) var(--layout-margin) toScale(8.8rem, 37.5rem);
    @include from__tablet--landscape {
      height: var(--vh);
      padding: 0 12rem 4.4rem 16rem;
    }
    &__list {
      width: 100%;
      position: relative;
      padding-top: 1rem;
      @include from__tablet--landscape {
        width: calc(var(--layout-column-width) * 3 + var(--layout-gutter) * 2);
        padding-top: 1rem;
      }
      &__label {
        @include t-b3;
      }
    }
  }
}
</style>
