export function ease(): string {
  return CustomEase.create('custom', 'M0,0 C0.53,0.24 0.08,0.99 1,1')
}

export async function fadeIn(params: {
  el: HTMLElement | Array<HTMLElement>
  delay?: number
  duration?: number
  ease?: string
  translate?: boolean
  done?: Function
}): Promise<void> {
  return new Promise(resolve => {
    const { el, delay, duration, translate, done } = params
    const opacity = {
      duration: duration || 1,
      ease: params.ease || ease(),
      opacity: 1,
      pointerEvents: 'auto',
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
  el: HTMLElement | Array<HTMLElement>
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
      pointerEvents: 'none',
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

export function prepareFadeIn(el: Element): void {
  gsap.set(el, { opacity: 0 })
}

export function prepareAbsolute(el: Element): void {
  gsap.set(el, { position: 'absolute', top: 0, left: 0, width: '100%', opacity: 0 })
}

export function restoreAbsolute(el: Element): void {
  gsap.set(el, { clearProps: 'all' })
}

export async function delayedTransitionFadeIn(el: Element, done: Function): Promise<void> {
  await fadeIn({ el: el as HTMLElement, delay: 1 })
  done()
}

export async function transitionFadeIn(el: Element, done: Function): Promise<void> {
  await fadeIn({ el: el as HTMLElement })
  done()
}

export async function transitionFadeOut(el: Element, done: Function): Promise<void> {
  await fadeOut({ el: el as HTMLElement })
  done()
}

export function transitionOut(el: Element, done: Function): void {
  done()
}

export async function overlayIn(el: Element, done: Function): Promise<void> {
  await fadeIn({ el: el as HTMLElement })
  done()
}

export async function overlayOut(el: Element, done: Function): Promise<void> {
  await fadeOut({ el: el as HTMLElement })
  done()
}

export async function getYourQuoteOverlayIn(el: Element, done: Function): Promise<void> {
  await fadeIn({ el: el as HTMLElement, translate: true, delay: 1 })
  done()
}
