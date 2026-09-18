import useStore from '~/store/useStore'

import { gsap } from 'gsap/gsap-core'
import { CustomEase } from 'gsap/CustomEase'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { ease } from '~/utils/animations'

export default defineNuxtPlugin(async () => {
  console.log(
    '%c{{}} Developed by https://macmillan.studio',
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

  // No gsap.ticker.fps() cap: the loop runs at the display refresh rate and per-tick
  // motion is normalised with deltaRatio()/lerp() from utils/animations instead.

  // Native font loading (replaces webfontloader): the <link rel="preload"> hints in
  // nuxt.config start the downloads with the HTML, this just waits for them. Never
  // block the site on a failed or slow font: fall back to system fonts after 3s.
  const fonts = ['HelveticaNowDisplayMedium', 'HelveticaNowDisplayBold'].map(family =>
    document.fonts.load(`1em ${family}`)
  )
  const timeout = new Promise(resolve => setTimeout(resolve, 3000))
  Promise.race([Promise.all(fonts), timeout])
    .catch(() => {})
    .then(() => store.updatePreloadedFonts(true))

  window.scrollTo({ top: 0 })
})
