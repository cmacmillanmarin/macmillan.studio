<template>
  <SvgProjectWallpapers
    :animation="animation"
    :next="next"
    :color="color"
    @update-scroll="emit('update-scroll')" />
</template>

<script lang="ts" setup>
defineProps<{
  project: string
  next: boolean
  animation: boolean
  color?: string
}>()

const emit = defineEmits(['update-scroll'])
</script>
