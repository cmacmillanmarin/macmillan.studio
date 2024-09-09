import { parseText } from '~/types/wordpress'

export type WP_Service_Objects = Array<WP_Service_Object>
export interface WP_Service_Object {
  post_name: string
}

export type WP_Services = Array<WP_Service>
export interface WP_Service {
  slug: string
  title: {
    rendered: string
  }
  acf: {
    description: string
  }
}

export type Services = Array<Service>
export interface Service {
  slug: string
  title: string
  description: string
}

export function parseServices(params: { services?: WP_Services }): Services {
  const services: Services = []
  for (const service of params.services || []) {
    services.push(parseService({ service }))
  }
  return services
}

export function parseService(params: { service?: WP_Service }): Service {
  const { service } = params
  return {
    slug: parseText(service?.slug),
    title: parseText(service?.title.rendered),
    description: parseText(service?.acf.description),
  }
}
