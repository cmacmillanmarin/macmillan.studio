import { get } from '~/utils/fetch'
import { type Dictionary, type WP_Dictionary, parseDictionary } from '~/types/wordpress/dictionary'

export default defineEventHandler(async (): Promise<Dictionary> => {
  console.log('/api/wordpress/dictionary')
  try {
    const dictionary: WP_Dictionary = await get(`/dictionary`)

    return parseDictionary(dictionary)
  } catch {
    console.warn('Error in /api/wordpress/dictionary')
    return parseDictionary()
  }
})
