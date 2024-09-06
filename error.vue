<template>
  <div>
    <NuxtLayout>
      <main data-scroll class="__error">
        <pre>{{ error }}</pre>
      </main>
      <Footer data-scroll />
    </NuxtLayout>
  </div>
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
  pre {
    @include t-black;
    @include t-b1;
  }
}
</style>
