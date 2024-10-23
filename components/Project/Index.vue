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

    <ProjectLanding :data="data" :ready="isInProjectEntered" />
    <WebGLVideo
      v-if="data.assets[0]"
      :data="data.assets[0].video"
      :bg-color="data.secondaryColor"
      :ready="isInProjectEntered" />
  </div>
</template>

<script lang="ts" setup>
import { gsap } from 'gsap'
import { type Project } from '~/types/wordpress/project'
import useStore from '~/store/useStore'
import useScrollStore from '~/store/useScrollStore'
import { transitionFadeOut } from '~/utils/animations'
import { storeToRefs } from 'pinia'

defineProps<{
  data: Project
}>()

const router = useRouter()

const store = useStore()
const { updateCursor, updateSection } = store
const { isInProjectEntered } = storeToRefs(store)

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
  display: inline-block;
  white-space: nowrap;
  @include will-fade;

  &--entered {
    cursor: pointer;
  }

  > div {
    white-space: normal;
    display: inline-block;
    vertical-align: top;
    width: max-content;
  }

  &__landing {
    width: max-content;
    height: 100%;
  }

  // &__image {
  // }
}
</style>
