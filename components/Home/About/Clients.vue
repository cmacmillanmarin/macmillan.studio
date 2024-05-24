<template>
  <div class="home__about__clients">
    <div class="home__about__clients__headline">
      <Separator />

      <p class="home__about__clients__headline__title">{{ data.title }}</p>
    </div>
    <div class="home__about__clients__list">
      <Separator />

      <p class="home__about__clients__list__title">{{ data.hint }}</p>
      <div class="home__about__clients__list__content">
        <p v-for="client in data.list" class="home__about__clients__list__content__client">
          {{ client.label }}
        </p>
      </div>
    </div>

    <div class="home__about__clients__featured">
      <div class="home__about__clients__featured__client--center">
        <SvgSLS />
      </div>
    </div>
    <div class="home__about__clients__featured">
      <div class="home__about__clients__featured__client">
        <SvgNike />
      </div>
      <div class="home__about__clients__featured__client">
        <SvgBuff />
      </div>
    </div>
    <div class="home__about__clients__featured">
      <div class="home__about__clients__featured__client--center">
        <SvgNetflix />
      </div>
    </div>
    <div class="home__about__clients__featured">
      <div class="home__about__clients__featured__client">
        <SvgGoogle />
      </div>
      <div class="home__about__clients__featured__client">
        <SvgGorillaz />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { AboutClients } from '~/types/data'

defineProps<{
  data: AboutClients
}>()
</script>

<style lang="scss">
.home__about__clients {
  @include grid;
  margin-top: 12rem;

  &__headline {
    position: relative;

    @include columns(6, 'desktop');
    @include gap(6, 'left', 'desktop');

    &__title {
      @include t-b1;
      padding-top: 1.2rem;
      margin-bottom: 1.6rem;
    }
  }

  &__list {
    position: relative;

    @include columns(4, 'desktop');
    align-self: end;

    display: flex;
    column-gap: var(--layout-gap);

    &__title {
      @include t-b1;
      padding-top: 1.2rem;
      width: var(--layout-column-width);
    }

    &__content {
      padding-top: 1.2rem;
      &__client {
        @include t-b1;
      }
    }
  }

  &__featured {
    @include columns(2, 'desktop');
    aspect-ratio: 1 / 3;
    display: flex;
    flex-wrap: wrap;

    &__client {
      width: 100%;
      aspect-ratio: 1;
      height: max-content;
      align-self: start;

      background-color: var(--dark-grey);
      border-radius: 1.6rem;

      display: flex;
      justify-content: center;
      align-items: center;

      &:last-child {
        align-self: end;
      }

      &--center {
        @extend .home__about__clients__featured__client;
        align-self: center !important;
      }
    }
  }
}
</style>
