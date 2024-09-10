import { parseText } from '~/types/wordpress'

export type WP_Client_Objects = Array<WP_Client_Object>
export interface WP_Client_Object {
  post_name: string
}

export type WP_Clients = Array<WP_Client>
export interface WP_Client {
  slug: string
  title: {
    rendered: string
  }
  acf: {
    featured: boolean
    name: string
  }
}

export type Clients = Array<Client>
export interface Client {
  slug: string
  name: string
  featured: boolean
}

export function parseClients(params: { clients?: WP_Clients }): Clients {
  const clients: Clients = []
  for (const client of params.clients || []) {
    clients.push(parseClient({ client }))
  }
  return clients
}

export function parseClient(params: { client?: WP_Client }): Client {
  const { client } = params
  return {
    slug: parseText(client?.slug),
    name: parseText(client?.acf.name),
    featured: !!client?.acf.featured,
  }
}
