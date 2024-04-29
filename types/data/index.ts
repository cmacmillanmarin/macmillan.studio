export interface Error {
  data: null
  error: {
    status: number
  }
}

export interface Head {
  title: string
  description: string
  'og:image': string
  'tw:image': string
}

export interface Data {
  head: Head
}

export function parseHead(data?: Head): Head {
  return {
    title: data?.title || '',
    description: data?.description || '',
    'og:image': data?.['og:image'] || '',
    'tw:image': data?.['tw:image'] || '',
  }
}

export function parseData(data?: Data): Data {
  return {
    head: parseHead(data?.head),
  }
}
