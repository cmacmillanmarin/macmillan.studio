import Index from '~/assets/data/index.json'
import { type Data, parseData } from '~/types/data'

export default defineEventHandler(async (): Promise<Data> => {
  console.log('/api/data')
  return parseData(Index)
})
