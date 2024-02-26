<template>
  <header
    ref="el"
    :class="[
      'c-header',
      { 'c-header--dark': headerTheme === 'dark' },
      { 'c-header--light': headerTheme === 'light' },
    ]">
    <nav class="c-header__nav">
      <ul class="c-header__nav__list--hint">
        <li class="c-header__nav__hint__item">
          <NuxtLink class="c-header__nav__list__item__anchor">
            Independent Development Studio
          </NuxtLink>
        </li>
      </ul>
      <ul class="c-header__nav__list--primary">
        <li class="c-header__nav__list__item">
          <NuxtLink class="c-header__nav__list__item__anchor" to="/#projects">Projects</NuxtLink>
        </li>
      </ul>
      <ul class="c-header__nav__list--secondary">
        <li class="c-header__nav__list__item">
          <NuxtLink class="c-header__nav__list__item__anchor" to="/#contact">Contact</NuxtLink>
        </li>
      </ul>
      <ul class="c-header__nav__list--logo">
        <li class="c-header__nav__list__item">
          <NuxtLink class="c-header__nav__list__item__anchor" to="/">Logo</NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'
import useHeaderStore from '~/store/useHeaderStore'

import useScrollStore from '~/store/useScrollStore'
import useDictionaryStore from '~/store/useDictionaryStore'
import type { Size } from '~/types/front/store/header'
import type { Button } from '~/types/wordpress'
import type { HeaderNavigation } from '~/types/wordpress/navigation'

defineProps<{
  navigation: HeaderNavigation
  buttons: Array<Button>
}>()

const store = useStore()
const { isLoading, isPreloaded, routeFrom, routeEntered } = storeToRefs(store)
const headerStore = useHeaderStore()
const { headerSize, headerTheme, headerEntered, headerVisibility, headerOverlay } =
  storeToRefs(headerStore)

const scrollStore = useScrollStore()
const { scrollPositionVertical } = storeToRefs(scrollStore)
const { get } = useDictionaryStore()

const el = ref<HTMLElement>()
const ctaEl = ref<HTMLElement>()
const linkEls = ref<Array<HTMLElement>>()
const linksContainerEl = ref<HTMLElement>()
const buttonsEl = ref<HTMLElement>()
const buttonsContainerEl = ref<HTMLElement>()

watch(headerSize, updateSize)

watch(scrollPositionVertical, (): void => {
  console.log(scrollPositionVertical.value)
})

watch(headerVisibility, (): void => {
  if (headerVisibility.value) enter()
  else leave()
})

watch([isLoading, isPreloaded], (): void => {
  if (isLoading.value || isPreloaded.value || !headerVisibility.value || headerEntered.value) return
  enter()
})

onMounted(async (): Promise<void> => {
  await nextTick()

  // if (isPreloaded.value) {
  //   headerVisibility.value ? enter() : leave()
  // }
  gsap.to(el.value, { opacity: 1 })
})

function enter(): void {
  headerStore.setEntered()
  if (headerVisibility.value) {
    const pointerEvents = 'auto'
    const els = [...(linkEls.value || []), ctaEl.value]
    gsap.killTweensOf([...els, buttonsEl.value])
    gsap.set([linksContainerEl.value, buttonsContainerEl.value], { pointerEvents })
    gsap.to(els, { y: 0, stagger: 0.1 })
    gsap.to(els, { opacity: 1, stagger: 0.1 })
    gsap.to(buttonsEl.value, { opacity: 1 })
    updateSize()
  }
}

function leave(): void {
  const pointerEvents = 'none'
  const els = [...(linkEls.value || []), ctaEl.value].reverse()
  gsap.killTweensOf([...els, buttonsEl.value])
  gsap.set([linksContainerEl.value, buttonsContainerEl.value], { pointerEvents })
  gsap.to(els, { y: -12, duration: 0.4, stagger: 0.1 })
  gsap.to(els, { opacity: 0, duration: 0.4, stagger: 0.1 })
  gsap.to(buttonsEl.value, { opacity: 0, duration: 0.4 })
  updateSize()
}

function updateSize(): void {
  const isSizeNormal = headerSize.value === 'normal'
  const x = isSizeNormal ? 62 : 0

  gsap.to(buttonsEl.value, { x, duration: 1 })
}
</script>

<style lang="scss">
.c-header {
  opacity: 0;
  will-change: transform, opacity;
  &__nav {
    @include grid();
    align-items: flex-end;

    &__list {
      &--hint,
      &--primary,
      &--secondary,
      &--logo {
        @extend .c-header__nav__list;
      }
      &--hint {
        @include columns(4);
        @include columns(6, 'desktop');
        // @include gap(2, 'left');
        // @include gap(0, 'left', 'desktop');
        // @include gap(2, 'right', 'desktop');
      }
      &--primary {
        @include columns(4, 'mobile');
        @include columns(6, 'desktop');
      }
      &--secondary {
        @include columns(4, 'mobile');
        @include columns(6, 'desktop');
      }
      &--logo {
        @include columns(4, 'mobile');
        @include columns(6, 'desktop');
      }
      &__item {
        &__anchor {
          @include t-b1;
          @include t-black;
        }
      }
    }
  }
}
</style>
