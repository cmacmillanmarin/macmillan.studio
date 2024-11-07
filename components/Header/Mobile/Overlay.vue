<template>
  <div
    ref="el"
    :class="['header__mobile__overlay', { 'header__mobile__overlay--bg': !transition }]">
    <PixelTransition v-if="transition" @done="enter" />
    <div v-if="!transition" class="header__mobile__overlay__content">
      <Ticker :drag-on-target="true">
        <div v-for="i in 2" :key="i"><SvgMacMillan /></div>
      </Ticker>
      <SvgStudio />
      <nav class="header__mobile__overlay__content__nav">
        <ul class="header__mobile__overlay__content__nav__list">
          <li
            v-for="{ label, slug } in data"
            class="header__mobile__overlay__content__nav__list__item">
            <NuxtLink
              class="header__mobile__overlay__content__nav__list__item__anchor"
              :to="`/#${slug}`"
              v-text="label" />
          </li>
        </ul>
      </nav>
      <p class="header__mobile__overlay__content__hint">Independent<br />Tech Lead—Developer</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import useScrollStore from '~/store/useScrollStore'
import { type HeaderLinks } from '~/types/front'
import { fadeIn, shuffleElsIn } from '~/utils/animations'

defineProps<{
  data: HeaderLinks
}>()

const route = useRoute()

const scrollStore = useScrollStore()
const { disableScroll } = scrollStore

const transition = ref<boolean>(true)

const el = ref<HTMLElement>()

watch(
  () => route.fullPath,
  () => {
    emit('close')
  }
)

async function enter() {
  transition.value = false
  await nextTick()
  const links = el.value?.querySelectorAll('a')
  const hint = el.value?.querySelector('.header__mobile__overlay__content__hint')
  shuffleElsIn({ els: links })
  hint && fadeIn({ el: hint, delay: 0.2 })
}

onBeforeMount(() => {
  disableScroll(true)
})

onBeforeUnmount(() => {
  disableScroll(false)
})

const emit = defineEmits(['close'])
</script>

<style lang="scss">
.header__mobile__overlay {
  position: absolute;
  z-index: 2;
  bottom: 0;
  left: 0;
  width: 100%;
  height: var(--vh);
  pointer-events: auto;
  padding-top: var(--layout-margin);

  &--bg {
    background-color: var(--lime);
  }

  .pixel-transition {
    position: absolute;
    z-index: 1;
    top: auto;
    pointer-events: none;
  }

  &__content {
    position: relative;
    z-index: 2;

    .ticker {
      position: relative;
      z-index: 3;
      > div {
        padding-right: toScale(3.2rem, 37.5rem);
        svg {
          display: block;
          width: 146.65vw;
          height: auto;
        }
      }
    }

    .svg__studio {
      display: block;
      width: calc(100vw - var(--layout-margin) * 2);
      margin: var(--layout-gutter) auto 0;
    }

    &__nav {
      height: calc(
        var(--vh) - toScale(14rem, 37.5rem) - var(--layout-gutter) - var(--layout-margin) * 2 -
          toScale(5.6rem, 37.5rem) - toScale(6.4rem, 37.5rem)
      );
      padding-top: 15%;
      padding-bottom: 15%;
      display: flex;
      align-items: center;

      &__list {
        width: 100%;
        height: 100%;
        max-height: 32rem;
        display: flex;
        flex-wrap: wrap;
        flex-direction: column;
        justify-content: space-around;
        align-items: center;

        &__item {
          &__anchor {
            @include will-fade;
            @include t-black;
            @include t-h3;
          }
        }
      }
    }

    &__hint {
      text-align: center;
      @include will-fade;
      @include t-black;
      @include t-b1;
    }
  }
}
</style>
