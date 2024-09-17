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
          <p
            v-if="active !== 0 && section === 'projects'"
            :key="activeListProjects.length"
            class="home__projects__index">
            <SvgSquare />
            <span
              v-html="`{${startWithZero(active)}—${startWithZero(activeListProjects.length)}}`" />
          </p>
        </transition>
      </Teleport>
      <Teleport to=".header__bottom">
        <transition
          mode="out-in"
          :css="false"
          @enter="transitionShuffleIn"
          @leave="transitionShuffleOut">
          <p v-if="section === 'projects'" class="home__projects__date">
            <span>{2024—2013}</span>
          </p>
        </transition>
      </Teleport>
    </ClientOnly>

    <div class="home__projects__buttons" data-scroll-sticky>
      <button class="home__projects__buttons__button" @click="updateActiveList('selected')">
        <span class="home__projects__buttons__button__label">
          <transition
            mode="out-in"
            :css="false"
            @enter="transitionShuffleIn"
            @leave="transitionShuffleOut">
            <SvgSquare v-if="activeList === 'selected'" />
          </transition>
          Selected projects
          <span
            class="home__projects__buttons__button__label__count"
            v-html="`{${startWithZero(selectedProjectsList.length)}}`" />
        </span>
      </button>
      <div class="home__projects__buttons__separator" />
      <button class="home__projects__buttons__button" @click="updateActiveList('all')">
        <span class="home__projects__buttons__button__label">
          <transition
            mode="out-in"
            :css="false"
            @enter="transitionShuffleIn"
            @leave="transitionShuffleOut">
            <SvgSquare v-if="activeList === 'all'" />
          </transition>
          All projects
          <span
            class="home__projects__buttons__button__label__count"
            v-html="`{${startWithZero(data.list.length)}}`" />
        </span>
      </button>
    </div>

    <div class="home__projects__intersect" v-intersect="{ callback: onIntersect }" />

    <HomeProjectsProject
      v-for="(project, i) in activeListProjects"
      :key="`${activeListProjects.length}-${project.slug}`"
      :list="activeList"
      :i="i"
      :of="activeListProjects.length - 1"
      :data="project"
      :top="top"
      :bottom="bottom"
      :side-x="i % 2 === 0 ? -1 : 1"
      :side-y="-1"
      @update-active="updateActive" />
  </div>
</template>

<script lang="ts" setup>
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import { transitionShuffleIn, transitionShuffleOut } from '~/utils/animations'
import { type HomepageProjects } from '~/types/wordpress/homepage'
import { storeToRefs } from 'pinia'
import type { Projects } from '~/types/wordpress/project'

const props = defineProps<{
  data: HomepageProjects
}>()

const store = useStore()
const { updateSection } = store
const { section } = storeToRefs(store)

const scrollStore = useScrollStore()
const { disableScroll, updateScroll, updateScrollTargetId } = scrollStore
const { current, inTarget } = storeToRefs(scrollStore)

const { vh } = useResize()

const { onReset, getBounding } = useVirtualScrollAndThreeTools()

const top = ref<number>(0)
const bottom = ref<number>(0)

const el = ref<HTMLElement>()

const active = ref<number>(0)

let _to: any
let _current: number = 0
const waitInTarget = ref<boolean>(false)

const activeList = ref<'selected' | 'all'>('selected')
const selectedProjectsList = ref<Projects>(props.data.list.filter(project => project.selected))
const activeListProjects = ref<Projects>(selectedProjectsList.value)

watch(onReset, () => {
  updateBounding()
})

watch(activeList, () => {
  _current = current.value
  disableScroll(true)
  updateScrollTargetId('projects')
  waitInTarget.value = true
  _to = setTimeout(() => {
    _current === current.value && updateActiveListProjects()
  }, 10)
})

watch(inTarget, () => {
  if (inTarget.value && waitInTarget.value) {
    updateActiveListProjects()
  }
})

watch(activeListProjects, async () => {
  await nextTick()
  waitInTarget.value = false
  disableScroll(false)
  updateScroll()
  updateBounding()
})

function updateActive(value: number) {
  active.value = value + 1
}

function onIntersect(el: HTMLElement, visible: boolean) {
  visible && updateSection('projects')
}

async function updateActiveList(value: 'selected' | 'all') {
  activeList.value = value
}

function updateActiveListProjects() {
  activeListProjects.value =
    activeList.value === 'selected' ? selectedProjectsList.value : props.data.list
}

function updateBounding() {
  const bounding = getBounding(el.value as HTMLElement)
  top.value = bounding.top
  bottom.value = bounding.bottom - vh.value
}

onBeforeUnmount(() => {
  _to && clearTimeout(_to)
})

defineEmits(['update-active'])
</script>

<style lang="scss">
.home__projects {
  position: relative;
  padding-bottom: calc(var(--vh) * 0.25);

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

  &__buttons {
    z-index: 9;
    position: absolute;
    top: 0;
    left: 0;
    width: 100vw;
    height: var(--vh);
    display: flex;
    justify-content: space-around;
    align-items: center;

    &__button {
      width: max-content;
      width: 40rem;
      border: none;
      &__label {
        position: relative;
        @include t-black;
        @include t-b1;
        .svg__square {
          position: absolute;
          top: 50%;
          left: 0;
          transform: translate(calc(-100% - 0.8rem), -50%);
        }
        &__count {
          position: absolute;
          transform: translate(0.4rem, 0);
          @include t-b2;
        }
      }
    }
  }

  &__intersect {
    position: absolute;
    top: calc(var(--vh));
    left: 0;
    width: 100%;
  }
}
</style>
