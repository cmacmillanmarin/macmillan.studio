export default function useCustomCookie(name: string) {
  const cookie = useCookie<number | string>(name, { sameSite: true })
  const state = useState(name, () => cookie.value)

  watch(
    state,
    () => {
      cookie.value = state.value
    },
    { deep: true }
  )

  return state
}
