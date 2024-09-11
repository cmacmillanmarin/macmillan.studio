<template>
  <div
    ref="el"
    id="projects-target"
    class="home__projects"
    data-scroll-target-top
    data-scroll-set-position>
    <div class="home__projects__title">
      <p
        data-scroll-sticky
        class="home__projects__title__label"
        v-transition:in="{ callback: titleIn, offset: 1 }">
        Selected Work
      </p>
    </div>
    <div class="home__projects__date">
      <p
        class="home__projects__date__label"
        data-scroll-sticky
        v-transition:in="{ callback: titleIn, offset: 1 }">
        <SvgSquare />
        <span>{2024—2013}</span>
      </p>
    </div>
    <HomeProjectsProject
      v-for="(project, i) in data.list"
      :i="i"
      :data="project"
      :top="top"
      :bottom="bottom"
      :side-x="i % 4 === 0 || i % 4 === 3 ? -1 : 1"
      :side-y="i % 4 <= 1 ? -1 : 1" />
  </div>
</template>

<script lang="ts" setup>
import { shuffleElsIn } from '~/utils/animations'
import { type HomepageProjects } from '~/types/wordpress/homepage'

defineProps<{
  data: HomepageProjects
}>()

const { vh } = useResize()

const { onReset, getBounding } = useVirtualScrollAndThreeTools()

const top = ref<number>(0)
const bottom = ref<number>(0)
const el = ref<HTMLElement>()

watch(onReset, () => {
  const bounding = getBounding(el.value as HTMLElement)
  top.value = bounding.top
  bottom.value = bounding.bottom - vh.value
})

function titleIn(params: { el: HTMLElement }) {
  shuffleElsIn({ els: [params.el] })
}
</script>

<style lang="scss">
.home__projects {
  position: relative;
  padding-bottom: calc(var(--vh) * 0.25);
  background-color: var(--light-grey);

  &__title,
  &__date {
    position: absolute;
    top: 0;

    width: max-content;
    height: 100%;

    &__label {
      position: sticky;
      top: 0;
      height: var(--vh);
      @include will-fade;
    }
  }

  &__title {
    left: 0;
    margin-left: var(--layout-margin);

    &__label {
      padding-top: 0.8rem;
      @include t-h2;
    }
  }

  &__date {
    right: 0;
    margin-right: var(--layout-margin);

    &__label {
      padding-top: calc(var(--vh) - 5.2rem);

      display: flex;
      align-items: center;
      column-gap: 0.8rem;

      @include t-number;
    }
  }
}
</style>
