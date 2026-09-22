// import { trimFilenameToBytes } from '~/utils'
import { Query } from '~/types/wordpress/index'
import fs from 'fs'

const RETRIES: number = 3
const RETRY_DELAY: number = 1000
const TIMEOUT: number = 20000

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

// A transient WordPress hiccup during the build used to be swallowed and turned into an
// empty page, so every request is retried and anything still broken is thrown.
async function fetchJson(url: string): Promise<{ data: any; headers: Headers }> {
  let lastError: string = 'unknown error'

  for (let attempt: number = 1; attempt <= RETRIES; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT) })
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)

      return { data: await res.json(), headers: res.headers }
    } catch (error) {
      lastError = (error as Error)?.message || `${error}`
      console.warn(`[fetch] attempt ${attempt}/${RETRIES} failed for ${url}: ${lastError}`)

      if (attempt < RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt))
      }
    }
  }

  throw new Error(`[fetch] ${url} failed after ${RETRIES} attempts: ${lastError}`)
}

export async function get(call: string): Promise<any> {
  const config = useRuntimeConfig()
  const { IS_OFFLINE } = config.public

  if (IS_OFFLINE) {
    console.log(pathFrom({ call }))
    return getData({ call: pathFrom({ call }) })
  }

  const { data } = await fetchJson(apiCall({ call }))
  const item = Array.isArray(data) ? data[0] : undefined

  if (!item) throw new Error(`[fetch] ${call} returned no post`)

  saveData({ call: pathFrom({ call }), data: item })

  return item
}

export async function getRankMath(link?: string): Promise<any> {
  const config = useRuntimeConfig()
  const { BE_BASE_URL, IS_OFFLINE } = config.public

  const call: string = '/rankmath' + (link || '').replace(BE_BASE_URL, '').slice(0, -1)

  if (IS_OFFLINE) return getData({ call })

  const { data } = await fetchJson(
    `${BE_BASE_URL}/wp-json/rankmath/v1/getHead?url=${link}&date=${Date.now()}`
  )
  saveData({ call, data })

  return data
}

export async function getList(call: string): Promise<any> {
  const config = useRuntimeConfig()
  const { IS_OFFLINE } = config.public

  if (IS_OFFLINE) return getData({ call: pathFrom({ call }) })

  const first = await fetchJson(apiCall({ call, page: 1 }))
  if (!Array.isArray(first.data)) throw new Error(`[fetch] ${call} did not return a list`)

  let data: Array<any> = [...first.data]

  const totalPages: number = parseInt(first.headers.get('x-wp-totalpages') || '0')

  for (let page: number = 2; page <= totalPages; page++) {
    const next = await fetchJson(apiCall({ call, page }))
    if (!Array.isArray(next.data)) throw new Error(`[fetch] ${call} page ${page} is not a list`)

    data = [...data, ...next.data]
  }

  data = data.filter(item => !!item)

  saveData({ call: pathFrom({ call }), data })

  return data
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
