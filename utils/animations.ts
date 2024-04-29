export function ease(): string {
  return CustomEase.create('custom', 'M0,0 C0.53,0.24 0.08,0.99 1,1')
}

export async function fadeIn(params: {
  el: Element | HTMLElement | Array<HTMLElement>
  delay?: number
  duration?: number
  ease?: string
  translate?: boolean
  done?: Function
}): Promise<void> {
  return new Promise(resolve => {
    const { el, delay, duration, translate, done } = params
    const opacity = {
      duration: duration || 1.2,
      ease: params.ease || ease(),
      opacity: 1,
    }
    gsap.killTweensOf(el)
    gsap.set(el, { y: translate ? 16 : undefined })
    gsap.to(el, { y: translate ? 0 : undefined, delay, ease: 'Power1.out' })
    gsap.to(el, {
      ...opacity,
      delay,
      onComplete: (): void => {
        done && done()
        resolve()
      },
    })
  })
}

export async function fadeOut(params: {
  el: Element | HTMLElement | Array<HTMLElement>
  delay?: number
  duration?: number
  ease?: string
  translate?: boolean
  done?: Function
}): Promise<void> {
  return new Promise(resolve => {
    const { el, delay, duration, translate, done } = params
    const opacity = {
      duration: duration || 0.5,
      ease: params.ease || ease(),
      opacity: 0,
      y: translate ? 16 : undefined,
    }
    gsap.killTweensOf(el)
    gsap.to(el, {
      ...opacity,
      delay,
      onComplete: (): void => {
        done && done()
        resolve()
      },
    })
  })
}

export function transitionFadeIn(el: Element, done: Function): void {
  fadeIn({ el, done })
}

export function transitionFadeOut(el: Element, done: Function): void {
  fadeOut({ el, done })
}
