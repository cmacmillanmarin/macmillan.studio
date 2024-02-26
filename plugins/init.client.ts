import WebFont from 'webfontloader'
import useStore from '~/store/useStore'
import { ease } from '~/utils/animations'

export default defineNuxtPlugin(async nuxtApp => {
  console.log(
    '%cDeveloped at https://macmillan.studio',
    'background: black; color: white; padding: 15px 25px; line-height: 1.4'
  )

  const config = useRuntimeConfig()
  const { IS_PREVIEW } = config.public

  const store = useStore()
  const route = useRoute()
  store.defineEntryRoute(route.fullPath)

  IS_PREVIEW && store.updateLoading(true)

  // gsap.ticker.fps(60)

  gsap.defaults({
    duration: 0.8,
    ease: ease(),
  })

  WebFont.load({
    custom: {
      families: [
        't-correct-trial',
        't-haas-grotesk-ds-b',
        't-saol-display-bi',
        't-saol-text-bi',
        'b-haas-grotesk-tx-b',
        'b-haas-grotesk-tx-m',
        'b-haas-grotesk-tx-r',
      ],
    },
    active: (): void => {
      store.updatePreloaded(true)
    },
  })

  window.scrollTo({ top: 0 })
})
