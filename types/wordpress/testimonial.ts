import { parseText, parseImage, type WP_Image, type Image } from '~/types/wordpress'

export type WP_Testimonial_Objects = Array<WP_Testimonial_Object>
export interface WP_Testimonial_Object {
  post_name: string
}

export type WP_Testimonials = Array<WP_Testimonial>
export interface WP_Testimonial {
  slug: string
  title: {
    rendered: string
  }
  acf: {
    quote: string
    credit: string
    thumbnail?: WP_Image
  }
}

export type Testimonials = Array<Testimonial>
export interface Testimonial {
  slug: string
  quote: string
  credit: string
  thumbnail?: Image
}

export function parseTestimonials(params: { testimonials?: WP_Testimonials }): Testimonials {
  const testimonials: Testimonials = []
  for (const testimonial of params.testimonials || []) {
    testimonials.push(parseTestimonial({ testimonial }))
  }
  return testimonials
}

export function parseTestimonial(params: { testimonial?: WP_Testimonial }): Testimonial {
  const { testimonial } = params
  return {
    slug: parseText(testimonial?.slug),
    quote: parseText(testimonial?.acf.quote),
    credit: parseText(testimonial?.acf.credit),
    thumbnail: parseImage(testimonial?.acf.thumbnail),
  }
}
