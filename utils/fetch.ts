import fs from 'fs'

export function getApiCall(call: string): string {
  const config = useRuntimeConfig()
  const { BE_API_URL } = config.public
  return `${BE_API_URL}${call}`
}

export async function get(call: string): Promise<any> {
  return new Promise(async (resolve): Promise<any> => {
    const config = useRuntimeConfig()
    const { IS_OFFLINE } = config.public

    if (IS_OFFLINE) return resolve(getData({ call }))

    try {
      const data = await fetch(getApiCall(call)).then(r => r.json())
      saveData({ call, data: data[0] })

      return resolve(data[0])
    } catch (error) {
      return resolve(error)
    }
  })
}

export async function saveData(params: { call: string; data: any }): Promise<void> {
  const config = useRuntimeConfig()
  const { IS_DEV } = config.public
  if (IS_DEV) {
    let path: string = './public/data'
    const chunks = params.call.split('/')
    for (let i: number = 1; i < chunks.length - 1; i++) {
      if (!fs.existsSync(`${path}/${chunks[i]}`)) {
        fs.mkdirSync(`${path}/${chunks[i]}`)
      }
      path = `${path}/${chunks[i]}`
    }
    fs.writeFileSync(
      `${path}/${chunks[chunks.length - 1]}.json`,
      JSON.stringify(params.data),
      'utf8'
    )
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
