<template>
  <CustomLink class="decorative-link" :to="to" :type="type" :content="true">
    <span>{{ label }}</span>
    <SvgArrow />
  </CustomLink>
</template>

<script lang="ts" setup>
defineProps<{
  label: string
  to: string
  type: string
}>()
</script>

<style lang="scss">
.decorative-link {
  .svg__arrow {
    margin-left: 0.8rem;
  }
}
</style>
