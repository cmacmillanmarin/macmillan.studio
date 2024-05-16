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

export interface Hero {
  title: string
  hint: string
}

export interface Service {
  title: string
  description: string
}

export interface Services {
  title: string
  hint: string
  list: Array<Service>
}

export interface About {
  title: string
  hint: string
  credit: string
  detail: string
}

export interface Data {
  head: Head
  hero: Hero
  services: Services
  about: About
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
    hero: {
      title: data?.hero.title || '',
      hint: data?.hero.hint || '',
    },
    services: {
      title: data?.services.title || '',
      hint: data?.services.hint || '',
      list: data?.services.list || [],
    },
    about: {
      title: data?.about.title || '',
      hint: data?.about.hint || '',
      credit: data?.about.credit || '',
      detail: data?.about.detail || '',
    },
  }
}
