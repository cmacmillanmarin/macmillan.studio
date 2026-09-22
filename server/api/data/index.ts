import { get, getList } from '~/utils/fetch'
import { getPostNamesFrom } from '~/types/wordpress'
import type { WP_Projects, WP_Project } from '~/types/wordpress/project'
import { parseHomepage, type Homepage, type WP_Homepage } from '~/types/wordpress/homepage'
import type { WP_Services, WP_Service } from '~/types/wordpress/service'
import type { WP_Clients, WP_Client } from '~/types/wordpress/client'
import type { WP_Testimonials, WP_Testimonial } from '~/types/wordpress/testimonial'

// Every prerendered route calls this endpoint, so the CMS is read once per build
// instead of once per page. A rejection is cached too: if WordPress is down there is
// no point hammering it for each remaining route.
let prerendered: Promise<Homepage> | undefined

export default defineEventHandler(async (): Promise<Homepage> => {
  console.log('/api/data')

  if (import.meta.prerender) {
    prerendered = prerendered || getHomepage()
    return prerendered
  }

  return getHomepage()
})

async function getHomepage(): Promise<Homepage> {
  try {
    const homepage: WP_Homepage = await get('/custom-page?slug=homepage')
    if (!homepage?.acf) throw new Error('homepage post has no acf payload')

    let slugs: string

    slugs = getPostNamesFrom(homepage.acf.projects.list)
    const projectsFetch: WP_Projects = slugs ? await getList(`/project?slug=${slugs}`) : []
    const projects: WP_Projects = []
    for (const slug of slugs.split(',')) {
      projects.push(projectsFetch.find(p => p.slug === slug) as WP_Project)
    }

    slugs = getPostNamesFrom(homepage.acf.services.list)
    const servicesFetch: WP_Services = slugs ? await getList(`/service?slug=${slugs}`) : []
    const services: WP_Services = []
    for (const slug of slugs.split(',')) {
      services.push(servicesFetch.find(s => s.slug === slug) as WP_Service)
    }

    const clients: WP_Clients = slugs ? await getList(`/client`) : []

    slugs = getPostNamesFrom(homepage.acf.about.testimonials)
    const testimonialsFetch: WP_Testimonials = slugs
      ? await getList(`/testimonial?slug=${slugs}`)
      : []
    const testimonials: WP_Testimonials = []
    for (const slug of slugs.split(',')) {
      testimonials.push(testimonialsFetch.find(t => t.slug === slug) as WP_Testimonial)
    }

    return parseHomepage({ homepage, projects, services, clients, testimonials })
  } catch (error) {
    // Returning an empty homepage here used to publish a blank site. Fail instead, so the
    // prerender fails and the previous deployment stays live.
    console.error('[api/data] unable to build the homepage payload', error)

    throw createError({
      statusCode: 502,
      statusMessage: `Unable to load content from the CMS: ${(error as Error)?.message || error}`,
    })
  }
}
