import { type Data, parseData } from '~/types/data'

export default defineEventHandler(async (): Promise<Data> => {
  console.log('/api/data')

  return parseData({
    head: {
      title: 'MacMillan Studio',
      description: '',
      'og:image': '',
      'tw:image': '',
    },
  })
})
