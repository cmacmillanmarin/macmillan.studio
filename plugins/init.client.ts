import WebFont from 'webfontloader'
import useStore from '~/store/useStore'

import { gsap } from 'gsap/gsap-core'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { ease } from '~/utils/animations'

export default defineNuxtPlugin(async () => {
  console.log(
    '%cDeveloped at https://macmillan.studio',
    'background: black; color: white; padding: 16px 24px; line-height: 1.4'
  )

  const route = useRoute()
  const { slug } = route.params

  if (slug) {
    window.localStorage.removeItem(`project-ticker-${slug}`)
    window.localStorage.removeItem(`project-ticker-${slug}-first-line`)
    window.localStorage.removeItem(`project-ticker-${slug}-second-line`)
  }

  const store = useStore()

  gsap.registerPlugin(CustomEase, ScrollToPlugin)

  gsap.defaults({
    duration: 0.8,
    ease: ease(),
  })

  WebFont.load({
    custom: {
      families: ['HelveticaNowDisplayMedium', 'HelveticaNowDisplayBold'],
    },
    active: (): void => {
      store.updatePreloadedFonts(true)
    },
  })

  window.scrollTo({ top: 0 })
})
