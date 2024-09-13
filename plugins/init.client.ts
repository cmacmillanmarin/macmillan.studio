import WebFont from 'webfontloader'
import useStore from '~/store/useStore'

import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

export default defineNuxtPlugin(async () => {
  console.log(
    '%cDeveloped at https://macmillan.studio',
    'background: black; color: white; padding: 16px 24px; line-height: 1.4'
  )

  const store = useStore()

  gsap.registerPlugin(CustomEase, ScrollToPlugin)

  gsap.defaults({
    duration: 0.8,
    ease: CustomEase.create('custom', 'M0,0 C0.53,0.24 0.08,0.99 1,1'),
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
