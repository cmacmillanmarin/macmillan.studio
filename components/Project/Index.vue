<template>
  <div
    ref="el"
    :class="['project', { 'project--entered': !transition }]"
    :style="{ backgroundColor: data.color }"
    @click="closeProject">
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
import { type Project } from '~/types/wordpress/project'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import { transitionFadeOut } from '~/utils/animations'

defineProps<{
  data: Project
}>()

const router = useRouter()

const store = useStore()
const { updateCursor, updateSection } = store

const { disableScroll } = useScrollStore()

const el = ref<HTMLElement>()
const transition = ref<boolean>(true)

onBeforeMount(() => {
  updateSection('projects')
})

onMounted(() => {
  disableScroll(true)
  emit('mounted')
})

function enter() {
  if (!el.value) return
  emit('entered')
  updateCursor('default')
  gsap.set(el.value, {
    opacity: 1,
    delay: 0.1,
    onComplete: () => {
      updateCursor('close')
      transition.value = false
    },
  })
}

onBeforeUnmount(() => {
  disableScroll(false)
})

function closeProject() {
  if (transition.value) return
  router.push('/')
}

const emit = defineEmits(['mounted', 'entered'])
</script>

<style lang="scss">
.project {
  @include will-fade;
  &--entered {
    cursor: pointer;
  }
  h1 {
    position: absolute;
    bottom: var(--layout-margin);
    left: var(--layout-margin);
    @include t-h1;
  }
}
</style>
