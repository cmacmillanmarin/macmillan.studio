<template>
  <component
    :is="componentType"
    :to="isInternal ? to : undefined"
    :href="isInternal ? undefined : to"
    :target="isInternal ? undefined : '_blank'"
    :rel="isInternal ? undefined : 'noreferrer noopener'"
    :aria-label="!to ? undefined : label"
    :data-tab-fixed="tabFixed ? '' : undefined"
    class="custom-link"
    @click="onClick">
    <template v-if="content">
      <slot />
    </template>
    <template v-else-if="letters">
      <span v-for="letter in label" class="custom-link__letter">{{ letter }}</span>
    </template>
    <template v-else>
      {{ label }}
    </template>
  </component>
</template>

<script lang="ts" setup>
import useScrollStore from '~/store/useScrollStore'

const props = defineProps<{
  to?: string
  label?: string
  type?: any
  tabFixed?: boolean
  content?: boolean
  letters?: boolean
}>()

const { updateScrollTargetId } = useScrollStore()

const route = useRoute()
const router = useRouter()

const isInternal = ref<boolean>(props.type !== 'external')

const componentType = computed(() => {
  if (props.to === '') return 'button'
  if (!isInternal.value) return 'a'
  return resolveComponent('NuxtLink')
})

async function onClick(): Promise<void> {
  if (props.type === 'referral') {
    if (props.to === route.fullPath) updateScrollTargetId(props.to.replace('/#', ''))
    else if (props.to) router.push(props.to)
  }
  if (route.fullPath === props.to) emit('active-clicked')
}

const emit = defineEmits<{
  (e: 'active-clicked'): void
}>()
</script>

<style lang="scss" scoped>
button {
  padding: 0;
  margin: 0;
  border: none;
  &__letter {
    will-change: opacity;
  }
}
</style>
