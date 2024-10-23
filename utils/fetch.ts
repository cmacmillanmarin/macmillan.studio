// import { trimFilenameToBytes } from '~/utils'
import { Query } from '~/types/wordpress/index'
import fs from 'fs'

export function apiCall(data: { call: string; page?: number }): string {
  const config = useRuntimeConfig()
  const { IS_PRODUCTION, DEPLOY_DATE } = config.public

  const { call, page } = data
  const per_page: number = 25

  const operator: string = call.includes('?') ? '&' : '?'
  const pagination: string = page ? `&page=${page}&per_page=${per_page}` : ''
  const date: string = `&date=${IS_PRODUCTION ? DEPLOY_DATE : Date.now()}`
  const apiCall: string = `${getBaseUrl(call)}${operator}${Query}${pagination}${date}`

  console.log(apiCall)
  return apiCall
}

export function getBaseUrl(call: string): string {
  const config = useRuntimeConfig()
  const { BE_API_URL } = config.public
  return `${BE_API_URL}${call}`
}

export function pathFrom(params: { call: string }): string {
  const path = params.call.replace('?slug=', '/')

  return path.substring(0, 50)
}

export async function get(call: string): Promise<any> {
  return new Promise(async (resolve): Promise<any> => {
    const config = useRuntimeConfig()
    const { IS_OFFLINE } = config.public

    if (IS_OFFLINE) {
      console.log(pathFrom({ call }))
      return resolve(getData({ call: pathFrom({ call }) }))
    }

    try {
      const data = await fetch(apiCall({ call })).then(r => r.json())
      saveData({ call: pathFrom({ call }), data: data[0] })

      return resolve(data[0])
    } catch (error) {
      return resolve(error)
    }
  })
}

export async function getRankMath(link?: string): Promise<any> {
  return new Promise(async (resolve): Promise<any> => {
    const config = useRuntimeConfig()
    const { BE_BASE_URL, IS_OFFLINE } = config.public

    const call: string = '/rankmath' + (link || '').replace(BE_BASE_URL, '').slice(0, -1)

    if (IS_OFFLINE) return resolve(getData({ call }))

    try {
      const data = await fetch(
        `${BE_BASE_URL}/wp-json/rankmath/v1/getHead?url=${link}&date=${Date.now()}`
      ).then(r => r.json())
      saveData({ call, data: data })

      resolve(data)
    } catch (error) {
      resolve(error)
    }
  })
}

export async function getList(call: string): Promise<any> {
  return new Promise(async (resolve): Promise<any> => {
    const config = useRuntimeConfig()
    const { IS_OFFLINE } = config.public

    if (IS_OFFLINE) return resolve(getData({ call: pathFrom({ call }) }))

    try {
      let data: Array<any> = []

      let res = await fetch(apiCall({ call, page: 1 }))
      data = [...(await res.json())]

      const totalPages: number = parseInt(res.headers.get('x-wp-totalpages') || '0')

      for (let page: number = 2; page <= totalPages; page++) {
        let res = await fetch(apiCall({ call, page }))
        data = [...data, ...(await res.json())]
      }

      data = data.filter(item => !!item)

      saveData({ call: pathFrom({ call }), data })

      return resolve(data)
    } catch (error) {
      return resolve(error)
    }
  })
}

export async function saveData(params: { call: string; data: any }): Promise<void> {
  const { PREVIEW, PRODUCTION } = process?.env || {}

  const IS_DEV: boolean = PRODUCTION != '1'
  const IS_PREVIEW: boolean = PREVIEW == '1'

  if (IS_DEV && !IS_PREVIEW) {
    let path: string = './public/data'
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path)
    }
    const chunks = params.call.split('/')
    for (let i: number = 1; i < chunks.length - 1; i++) {
      if (!fs.existsSync(`${path}/${chunks[i]}`)) {
        fs.mkdirSync(`${path}/${chunks[i]}`)
      }
      path = `${path}/${chunks[i]}`
    }
    if (params.data) {
      fs.writeFileSync(
        `${path}/${chunks[chunks.length - 1]}.json`,
        JSON.stringify(params.data),
        'utf8'
      )
    }
  }
}

export async function getData(params: { call: string }): Promise<any> {
  const data = fs.readFileSync(`./public/data${params.call}.json`, 'utf-8')
  if (!data)
    console.warn(
      `./public/data${params.call}.json not found. To enable OFFLINE mode, ensure that the required data is fetched online at least once.`
    )
  return data ? JSON.parse(data) : {}
}
