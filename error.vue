<template>
  <main class="__error">
    <pre class="t-b1">{{ error }}</pre>
  </main>
</template>

<script lang="ts" setup>
import useStore from '~/store/useStore'

defineProps({
  error: Object,
})

const store = useStore()

onMounted(() => {
  store.updateLoading(false)
})
</script>

<style lang="scss">
.__error {
  display: flex;
  height: var(--vh);
  justify-content: center;
  align-items: center;
  p {
    max-width: 80%;
    text-align: center;
  }
}
</style>
