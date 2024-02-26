import useStore from '~/store/useStore'

export default function useKeyboard() {
  const store = useStore()

  const isPreloaded = ref<boolean>(false)

  watch(
    () => store.isPreloaded,
    (): void => {
      isPreloaded.value = store.isPreloaded
    }
  )

  onMounted((): void => {
    setTimeout((): void => {
      isPreloaded.value = store.isPreloaded
    }, 0)
  })

  return {
    isPreloaded,
  }
}
