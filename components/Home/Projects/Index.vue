<template>
  <div
    ref="el"
    id="projects-target"
    class="home__projects"
    data-scroll-target-top
    data-scroll-set-position>
    <ClientOnly>
      <Teleport to=".header__top">
        <transition
          mode="out-in"
          :css="false"
          @enter="transitionShuffleIn"
          @leave="transitionShuffleOut">
          <p v-if="active !== 0" class="home__projects__index">
            <SvgSquare />
            <span v-html="`{${startWithZero(active)}—${startWithZero(data.list.length)}}`" />
          </p>
        </transition>
      </Teleport>
      <Teleport to=".header__bottom">
        <transition
          mode="out-in"
          :css="false"
          @enter="transitionShuffleIn"
          @leave="transitionShuffleOut">
          <p v-if="active !== 0" class="home__projects__date">
            <SvgSquare />
            <span>{2024—2013}</span>
          </p>
        </transition>
      </Teleport>
    </ClientOnly>

    <!-- <div ref="logoEl" data-scroll-sticky class="home__projects__logo">
      <SvgLogo />
      <div
        class="home__projects__logo__observer"
        v-intersect="{ callback: onIntersect, offset: 1 }" />
    </div> -->

    <HomeProjectsProject
      v-for="(project, i) in data.list"
      :i="i"
      :of="data.list.length - 1"
      :data="project"
      :top="top"
      :bottom="bottom"
      :side-x="i % 2 === 0 ? -1 : 1"
      :side-y="-1"
      @update-active="updateActive" />
  </div>
</template>

<script lang="ts" setup>
import { transitionShuffleIn, transitionShuffleOut } from '~/utils/animations'
import { type HomepageProjects } from '~/types/wordpress/homepage'

defineProps<{
  data: HomepageProjects
}>()

const { vh } = useResize()

const { onReset, getBounding } = useVirtualScrollAndThreeTools()

const top = ref<number>(0)
const bottom = ref<number>(0)

const el = ref<HTMLElement>()
const logoEl = ref<HTMLElement>()

const active = ref<number>(0)
const logoIntersected = ref<boolean>(false)

watch(logoIntersected, () => {
  if (!logoEl.value) return
  logoIntersected.value
    ? shuffleElsIn({ els: [logoEl.value] })
    : shuffleElsOut({ els: [logoEl.value] })
})

watch(onReset, () => {
  const bounding = getBounding(el.value as HTMLElement)
  top.value = bounding.top
  bottom.value = bounding.bottom - vh.value
})

function updateActive(value: number) {
  active.value = value + 1
}

function onIntersect(el: HTMLElement, visible: boolean) {
  logoIntersected.value = visible
}
</script>

<style lang="scss">
.home__projects {
  position: relative;
  padding-bottom: calc(var(--vh) * 0.25);
  background-color: var(--light-grey);

  &__index,
  &__date {
    display: flex;
    align-items: center;
    column-gap: 0.8rem;
    @include will-fade;
    @include t-number;
  }

  &__index {
    position: absolute;
    width: max-content;
  }

  &__logo {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: var(--vh);
    // @include will-fade;
    .svg__logo {
      width: calc(var(--vh) * 0.8);
      height: auto;
      @include absolute-center;
    }
    &__observer {
      position: absolute;
      left: 0;
      bottom: 0;
      height: 0.1rem;
      background-color: red;
      width: 100%;
    }
  }
}
</style>
