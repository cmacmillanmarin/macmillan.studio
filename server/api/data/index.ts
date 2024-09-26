import { get, getList } from '~/utils/fetch'
import { getPostNamesFrom } from '~/types/wordpress'
import type { WP_Projects, WP_Project } from '~/types/wordpress/project'
import { parseHomepage, type Homepage, type WP_Homepage } from '~/types/wordpress/homepage'
import type { WP_Services, WP_Service } from '~/types/wordpress/service'
import type { WP_Clients, WP_Client } from '~/types/wordpress/client'
import type { WP_Testimonials, WP_Testimonial } from '~/types/wordpress/testimonial'

export default defineEventHandler(async (): Promise<Homepage> => {
  console.log('/api/data')

  try {
    const homepage: WP_Homepage = await get('/custom-page?slug=homepage')
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
    console.log(error)
    return parseHomepage({})
  }
})
