import { get } from '~/utils/fetch'
import { type Header, parseHeader } from '~/types/wordpress/navigation'

export default defineEventHandler(async (): Promise<Header> => {
  console.log('/api/wordpress/header')
  try {
    return parseHeader(await get(`/nav?slug=header`))
  } catch {
    console.warn('Error in /api/wordpress/header')
    return parseHeader()
  }
})
