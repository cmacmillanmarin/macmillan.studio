import { Query } from '~/types/wordpress/index'
import type { Cookie } from '~/types/front/store/auth'

export function apiCall(data: { call: string; page?: number }): string {
  const { call, page } = data
  const per_page: number = 25

  const operator: string = call.includes('?') ? '&' : '?'
  const pagination: string = page ? `&page=${page}&per_page=${per_page}` : ''
  const apiCall: string = `${getBaseUrl(call)}${operator}${Query}${pagination}&date=${Date.now()}`

  // console.log(apiCall)
  return apiCall
}

export function getBaseUrl(call: string): string {
  const config = useRuntimeConfig()
  const { BE_API_URL } = config.public
  return `${BE_API_URL}${call}`
}

export async function get(call: string): Promise<any> {
  return new Promise(async (resolve): Promise<any> => {
    try {
      const data = await fetch(apiCall({ call })).then(r => r.json())
      resolve(data[0])
    } catch (error) {
      resolve(error)
    }
  })
}

interface PostRequest {
  call: string
  data: any
}
export async function post(req: PostRequest): Promise<any> {
  return new Promise(async (resolve): Promise<any> => {
    const cookie = useCookie<Cookie | undefined>('wp_session', { sameSite: true })
    const data = await $fetch(getBaseUrl(req.call), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cookie.value?.token}`,
      },
      body: {
        ...req.data,
      },
    })
    resolve(data)
  })
}

export async function getList(call: string): Promise<any> {
  return new Promise(async (resolve): Promise<any> => {
    let data: Array<any> = []

    let res = await fetch(apiCall({ call, page: 1 }))
    data = [...(await res.json())]

    const totalPages: number = parseInt(res.headers.get('x-wp-totalpages') || '0')

    for (let page: number = 2; page <= totalPages; page++) {
      let res = await fetch(apiCall({ call, page }))
      data = [...data, ...(await res.json())]
    }

    resolve(data)
  })
}
