<template>
  <Component
    :is="type"
    :animation="animation"
    :next="next"
    :color="color"
    @update-scroll="emit('update-scroll')" />
</template>

<script lang="ts" setup>
import { hyphensToCamelcase } from '~/utils'

const props = defineProps<{
  project: string
  next: boolean
  animation: boolean
  color?: string
}>()

const type = ref<string>(`SvgProject${hyphensToCamelcase(props.project)}`)

const emit = defineEmits(['update-scroll'])
</script>
