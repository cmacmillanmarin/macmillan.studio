//
// requires:
// ~/composables/useResize
//

export default function useDevice() {
  const { onResize } = useResize()

  const dpr = ref<number>(1)

  const touch = ref<boolean>(false)
  const safari = ref<boolean>(false)

  // Breakpoint
  const breakpoint = ref<string>('')

  // Layout
  const isDesktop = ref<boolean>(false)
  const isTablet = ref<boolean>(false)
  const isTabletPortrait = ref<boolean>(false)
  const isTabletLandscape = ref<boolean>(false)
  const isMobile = ref<boolean>(false)
  const isMobileLayout = computed<boolean>(() => isMobile.value || isTabletPortrait.value)

  // Device
  const inAppBrowser = ref<boolean>(false)
  const isPhoneOrTablet = ref<boolean>(false)

  const hasWheelEvent = ref<boolean>(false)

  onBeforeMount(_init)
  onMounted(_update)
  watch(onResize, _update)

  function _init(): void {
    safari.value =
      navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') <= -1

    isPhoneOrTablet.value = _isPhoneOrTablet()
    inAppBrowser.value = _detectInAppBrowser()

    hasWheelEvent.value = 'onwheel' in document
  }

  function _detectInAppBrowser(): boolean {
    const { userAgent, vendor } = navigator
    return /FBAN|FBAV|Instagram|LinkedInApp|Messenger|TikTok|Twitter/.test(userAgent || vendor)
  }

  function _update(): void {
    safari.value =
      navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') <= -1

    breakpoint.value = window.getComputedStyle(document.body, '::after').getPropertyValue('content')
    isMobile.value = breakpoint.value.includes('mobile')
    isTablet.value = breakpoint.value.includes('tablet')
    isTabletPortrait.value =
      breakpoint.value.includes('tablet') && !breakpoint.value.includes('landscape')
    isTabletLandscape.value =
      breakpoint.value.includes('tablet') && breakpoint.value.includes('landscape')
    isDesktop.value = breakpoint.value.includes('desktop')

    dpr.value = window.devicePixelRatio || 1

    isPhoneOrTablet.value = _isPhoneOrTablet()

    touch.value = !!window.getComputedStyle(document.body, ':after').getPropertyValue('--touch')
  }

  function _isPhoneOrTablet(): boolean {
    if (
      navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/webOS/i) ||
      navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/iPod/i) ||
      navigator.userAgent.match(/BlackBerry/i) ||
      navigator.userAgent.match(/Windows Phone/i)
    ) {
      return true
    }
    return false
  }

  async function webpSupport(): Promise<boolean> {
    return new Promise(resolve => {
      const image = new Image()
      image.addEventListener('error', () => resolve(false))
      image.addEventListener('load', () => resolve(image.width === 1))
      image.src =
        'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA='
    })
  }

  async function avifSupport(): Promise<boolean> {
    return new Promise(resolve => {
      const image = new Image()
      image.addEventListener('error', () => resolve(false))
      image.addEventListener('load', () => resolve(image.width === 1))
      image.src =
        'data:image/avif;base64,AAAAHGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZgAAAPBtZXRhAAAAAAAAAChoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAbGliYXZpZgAAAAAOcGl0bQAAAAAAAQAAAB5pbG9jAAAAAEQAAAEAAQAAAAEAAAEUAAAAFQAAAChpaW5mAAAAAAABAAAAGmluZmUCAAAAAAEAAGF2MDFDb2xvcgAAAABoaXBycAAAAElpcGNvAAAAFGlzcGUAAAAAAAAAAQAAAAEAAAAOcGl4aQAAAAABCAAAAAxhdjFDgQAcAAAAABNjb2xybmNseAABAAEAAQAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB1tZGF0EgAKBxgADlgICAkyCB/xgAAghQm0'
    })
  }

  return {
    touch,
    safari,
    hasWheelEvent,
    inAppBrowser,
    isPhoneOrTablet,
    isMobile,
    isDesktop,
    isTablet,
    isTabletPortrait,
    isTabletLandscape,
    isMobileLayout,
    breakpoint,
    dpr,
    webpSupport,
    avifSupport,
  }
}
