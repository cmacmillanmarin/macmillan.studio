<template>
  <div ref="el" class="project" :style="{ backgroundColor: data.color }">
    <ClientOnly>
      <Teleport to="#top-layer">
        <transition @leave="transitionFadeOut">
          <ProjectTransition v-if="transition" :color="data.color" @done="enter" />
        </transition>
      </Teleport>
    </ClientOnly>

    <h1>{{ data.title }}</h1>
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'
import { type Project } from '~/types/data'
import useScrollStore from '~/store/useScrollStore'
import { transitionFadeOut } from '~/utils/animations'

defineProps<{
  data: Project
}>()

const { disableScroll } = useScrollStore()

const el = ref<HTMLElement>()
const transition = ref<boolean>(true)

onMounted(() => {
  disableScroll(true)
  emit('mounted')
})

function enter() {
  if (!el.value) return
  emit('entered')

  gsap.set(el.value, {
    opacity: 1,
    delay: 0.1,
    onComplete: () => {
      transition.value = false
    },
  })
}

onBeforeUnmount(() => {
  disableScroll(false)
})

const emit = defineEmits(['mounted', 'entered'])
</script>

<style lang="scss">
.project {
  @include will-fade;
}
</style>
