<template>
  <div ref="el" class="home__about__clients">
    <div class="home__about__clients__headline">
      <Separator :left="isMobileLayout ? 8 : 4" />
      <p class="home__about__clients__headline__title">{{ data.title }}</p>
    </div>

    <ClientOnly>
      <div v-if="isMobileLayout" class="home__about__clients__featured-mobile">
        <div class="home__about__clients__featured-mobile__client">
          <SvgNike />
        </div>
        <div class="home__about__clients__featured-mobile__client">
          <SvgGoogle />
        </div>
        <div
          class="home__about__clients__featured-mobile__client"
          v-transition:in="{ callback: enterMobileLogos }">
          <SvgNetflix />
        </div>
        <div class="home__about__clients__featured-mobile__client">
          <SvgWWF />
        </div>
        <div class="home__about__clients__featured-mobile__client">
          <SvgGorillaz />
        </div>
      </div>
    </ClientOnly>

    <div class="home__about__clients__list">
      <Separator :left="isMobileLayout ? 8 : 4" />
      <p class="home__about__clients__list__title">{{ data.hint }}</p>
      <div class="home__about__clients__list__content">
        <template v-for="client in data.list">
          <p v-if="!client.featured" class="home__about__clients__list__content__client">
            {{ client.name }}
          </p>
        </template>
      </div>
    </div>

    <div v-show="!isMobileLayout" class="home__about__clients__featured">
      <div class="home__about__clients__featured__client--center">
        <!-- <SvgSLS /> -->
        <SvgWWF />
      </div>
    </div>

    <div v-show="!isMobileLayout" class="home__about__clients__featured">
      <div class="home__about__clients__featured__client">
        <SvgNike />
      </div>
      <div
        class="home__about__clients__featured__transition-in"
        v-transition:in="{ callback: enterLogos }" />
      <div class="home__about__clients__featured__client">
        <SvgBuff />
      </div>
    </div>

    <div v-show="!isMobileLayout" class="home__about__clients__featured">
      <div class="home__about__clients__featured__client--center">
        <SvgNetflix />
      </div>
    </div>

    <div v-show="!isMobileLayout" class="home__about__clients__featured">
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
import { shuffleElsIn } from '~/utils/animations'
import type { HomepageAboutClients } from '~/types/wordpress/homepage'

defineProps<{
  data: HomepageAboutClients
}>()

const { isMobileLayout } = useDevice()

const el = ref<HTMLElement>()

function enterLogos(params: { el: HTMLElement }) {
  shuffleElsIn({ els: el.value?.querySelectorAll('.home__about__clients__featured svg') })
}

function enterMobileLogos(params: { el: HTMLElement }) {
  shuffleElsIn({ els: el.value?.querySelectorAll('.home__about__clients__featured-mobile svg') })
}
</script>

<style lang="scss">
.home__about__clients {
  margin-top: toScale(7.2rem, 37.5rem);
  @include grid;

  @include from__tablet--landscape {
    margin-top: toScale(12rem);
  }

  &__headline {
    position: relative;
    @include columns(8, 'mobile');

    @include from__tablet--landscape {
      @include columns(6, 'desktop');
      @include gap(6, 'left', 'desktop');
    }

    &__title {
      padding-top: 1.2rem;
      margin-bottom: 1.6rem;
      @include t-b1;
    }
  }

  &__list {
    position: relative;

    align-self: end;
    display: flex;
    column-gap: var(--layout-gutter);
    margin-bottom: toScale(7.2rem, 37.5rem);

    @include columns(8, 'mobile');

    @include from__tablet--landscape {
      margin-bottom: 0;
      @include columns(4, 'desktop');
    }

    &__title {
      padding-top: 1.2rem;
      width: toColumns(4);
      @include t-b1;
      @include from__tablet--landscape {
        width: var(--layout-column-width);
      }
    }

    &__content {
      padding-top: 1.2rem;
      &__client {
        @include t-b1;
      }
    }
  }

  &__featured-mobile {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    margin-bottom: toScale(7.2rem, 37.5rem);
    &__client {
      width: 33.333333%;
      background-color: var(--dark-grey);
      aspect-ratio: 1;
      border-radius: toScale(0.8rem, 37.5rem);
      display: flex;
      justify-content: center;
      align-items: center;
      &:nth-child(1),
      &:nth-child(4) {
        margin-right: 33.333333%;
      }
      &:nth-child(3) {
        margin-left: 33.333333%;
        margin-right: 33.333333%;
      }
      svg {
        @include will-fade;
      }
    }
  }

  &__featured {
    position: relative;
    aspect-ratio: 1 / 3;
    display: flex;
    flex-wrap: wrap;
    @include columns(2, 'desktop');

    &__transition-in {
      position: absolute;
      top: 50%;
      left: 0;
      width: 100%;
      height: 1px;
    }

    &__client {
      position: relative;
      width: 100%;
      aspect-ratio: 1;
      height: max-content;
      align-self: start;

      background-color: var(--dark-grey);
      border-radius: 1.6rem;

      display: flex;
      justify-content: center;
      align-items: center;

      svg {
        @include will-fade;
      }

      &:last-child {
        align-self: end;
      }

      &--center {
        align-self: center !important;
        @extend .home__about__clients__featured__client;
      }
    }
  }
}
</style>
