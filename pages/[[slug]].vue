<template>
  <div v-if="data" ref="el" class="home">
    <CustomHead :head="data.head" />

    <Project
      v-if="project"
      :key="project.slug"
      :data="project"
      :list="projectList"
      :next-project="nextProject"
      @mounted="onProjectMounted"
      @entered="onProjectEntered"
      @next="onNextProject"
      @closed="onProjectClosed" />

    <HomeHero data-scroll data-scroll-continuous :data="data.hero" />

    <HomeProjects
      v-if="data.projects.list.length"
      data-scroll
      :data="data.projects"
      @update-list="onProjectListUpdated" />

    <HomeServices v-if="data.services.list.length" data-scroll :data="data.services" />

    <HomeAbout data-scroll :data="data.about" />

    <Footer data-scroll />

    <div class="home__bg--lime" />
    <div class="home__bg--dark-grey" />
    <div class="home__bg--light-grey" />
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'
import { type Homepage } from '~/types/wordpress/homepage'
import { type Project } from '~/types/wordpress/project'
import useStore from '~/store/useStore'
import { storeToRefs } from 'pinia'

const route = useRoute()
const { data } = await useFetch<Homepage>('/api/data')

const store = useStore()
const { updateInProject, updateInProjectEntered } = store
const { section } = storeToRefs(store)

const el = ref<HTMLElement>()
const bgColor = ref<string>('light-grey')

const inProject = ref<boolean>(false)
const inProjectEntered = ref<boolean>(false)
const projectList = ref<'selected' | 'all'>('selected')
const projectSlug = computed<string>(() => `${route.params.slug}`)
const project = computed<Project | undefined>(() => {
  return data.value?.projects.list.find(project => project.slug === projectSlug.value)
})
const nextProject = computed<Project | undefined>(() => {
  const list =
    projectList.value === 'selected'
      ? data.value?.projects.list.filter(p => p.selected)
      : data.value?.projects.list
  const index = list?.findIndex(p => p.slug === projectSlug.value)
  if (index !== undefined && index >= 0) return list?.[index + 1]
  return undefined
})

watch(inProject, () => {
  updateInProject(inProject.value)
})

watch(inProjectEntered, () => {
  updateInProjectEntered(inProjectEntered.value)
})

watch(section, () => {
  if (!el.value) return

  let color = 'light-grey'
  if (section.value === 'reel' || section.value === 'projects' || section.value === 'projects-bg')
    color = 'dark-grey'
  else if (section.value === 'services') color = 'light-grey'
  else if (section.value === 'about') color = 'lime'
  else if (section.value === 'about-testimonials') color = 'dark-grey'
  bgColor.value = color
})

watch(bgColor, () => {
  if (!el.value) return
  const bgs = el.value.querySelectorAll(
    '.home__bg--lime, .home__bg--light-grey, .home__bg--dark-grey'
  )
  const active = `.home__bg--${bgColor.value}`
  const activeBg = el.value.querySelector(active)
  gsap.set(bgs, { zIndex: 1 })
  fadeOut({ el: bgs })
  gsap.killTweensOf(activeBg)
  gsap.set(activeBg, { zIndex: 0, opacity: 1 })
})

function onProjectListUpdated(value: 'all' | 'selected') {
  projectList.value = value
}

function onProjectMounted() {
  inProject.value = true
}

function onProjectEntered() {
  inProjectEntered.value = true
}

function onNextProject() {
  inProjectEntered.value = false
}

function onProjectClosed() {
  inProject.value = false
  inProjectEntered.value = false
}

definePageMeta({
  key: 'home',
})
</script>

<style lang="scss">
.home {
  @include page;

  &__hero,
  &__projects,
  &__services,
  &__about,
  .footer {
    position: relative;
    z-index: 2;
  }

  .project {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 3;
  }

  &__bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: var(--vh);
    z-index: 0;
    &--lime,
    &--light-grey,
    &--dark-grey {
      @extend .home__bg;
      @include will-fade;
    }
    &--lime {
      background-color: var(--lime);
    }
    &--light-grey {
      opacity: 1;
      background-color: var(--light-grey);
    }
    &--dark-grey {
      background-color: var(--dark-grey);
    }
  }
}
</style>
