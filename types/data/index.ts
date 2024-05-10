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

export interface Landing {
  hint: string
}

export interface Service {
  title: string
  description: string
}

export interface Services {
  hint: string
  list: Array<Service>
}

export interface Data {
  head: Head
  landing: Landing
  services: Services
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
    landing: {
      hint: data?.landing.hint || '',
    },
    services: {
      hint: data?.services.hint || '',
      list: data?.services.list || [],
    },
  }
}
