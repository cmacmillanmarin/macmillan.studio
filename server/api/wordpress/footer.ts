import { get } from '~/utils/fetch'
import { type Footer, parseFooter } from '~/types/wordpress/navigation'

export default defineEventHandler(async (): Promise<Footer> => {
  console.log('/api/wordpress/footer')
  try {
    return parseFooter(await get(`/nav?slug=footer`))
  } catch {
    console.warn('Error in /api/wordpress/footer')
    return parseFooter()
  }
})
