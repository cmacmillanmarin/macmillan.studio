import WebFont from 'webfontloader'
import useStore from '~/store/useStore'
import { ease } from '~/utils/animations'

export default defineNuxtPlugin(async nuxtApp => {
  console.log(
    '%cDeveloped at https://macmillan.studio',
    'background: black; color: white; padding: 16px 24px; line-height: 1.4'
  )

  const store = useStore()
  const route = useRoute()
  store.defineEntryRoute(route.fullPath)

  gsap.defaults({
    duration: 0.8,
    ease: ease(),
  })

  WebFont.load({
    custom: {
      families: [
        // 'HelveticaNowTextBold',
        // 'HelveticaNowTextMedium',
        'HelveticaNowDisplayBold',
        'HelveticaNowDisplayMedium',
        // 'NeuePixelRegular',
      ],
    },
    active: (): void => {
      store.updatePreloaded(true)
    },
  })

  window.scrollTo({ top: 0 })
})
