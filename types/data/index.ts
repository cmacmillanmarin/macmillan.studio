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

export type Projects = { [key: string]: Project }
export interface Project {
  title: string
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

export interface AboutClient {
  label: string
  link?: string
}
export interface AboutClients {
  title: string
  hint: string
  list: Array<AboutClient>
}

export interface AboutTestimonial {
  quote: string
  credit: string
  thumbnail: string
}

export type AboutTestimonials = Array<AboutTestimonial>

export interface About {
  title: string
  hint: string
  credit: string
  detail: string
  clients: AboutClients
  collaborator: {
    title: string
    description: string
    credit: string
  }
  testimonials: AboutTestimonials
}

export interface Data {
  head: Head
  hero: Hero
  projects: Projects
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
    projects: data?.projects || {},
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
      clients: {
        title: data?.about.clients.title || '',
        hint: data?.about.clients.hint || '',
        list: data?.about.clients.list || [],
      },
      collaborator: {
        title: data?.about.collaborator.title || '',
        description: data?.about.collaborator.description || '',
        credit: data?.about.collaborator.credit || '',
      },
      testimonials: data?.about.testimonials || [],
    },
  }
}
