import { get } from '~/utils/fetch'
import { type Homepage, parseHomepage, type WP_Homepage } from '~/types/wordpress/homepage'

export default defineEventHandler(async (): Promise<Homepage> => {
  console.log('/api/wordpress/homepage')
  try {
    const homepage: WP_Homepage = await get(`/custom-page?slug=homepage`)

    return parseHomepage({ homepage })
  } catch {
    console.warn('Error in /api/wordpress/homepage')
    return parseHomepage()
  }
})
