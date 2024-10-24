import he from 'he'
import { storeToRefs } from 'pinia'
import useStore from '~/store/useStore'

export function targetify(input: string): string {
  return `${slugify(input)}-target`
}

export function sleep(time: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}

export function capitalize(str: string): string {
  const lower = str.toLowerCase()
  return str.charAt(0).toUpperCase() + lower.slice(1)
}

export function hyphensToCamelcase(input: string): string {
  const lowercase: string = input.toLocaleLowerCase()
  let output: Array<string> = lowercase.split('-')
  output = output.map(word => word[0].toUpperCase() + word.substring(1))
  return output.join('')
}

export function parseVariables(params: {
  input: string
  keys: Array<string>
  values: Array<string>
}): string {
  const { keys, values } = params
  let input: string = params.input
  for (const index in keys) {
    input = input.replaceAll(`{{${keys[index]}}}`, values[index])
  }
  return input
}

export function cast(n: number, min: number, max: number) {
  return Math.min(Math.max(min, n), max)
}

export function natural(n: number): number {
  return Math.max(n, 0)
}

export function toPx(n: number): string {
  return `${n}px`
}

export function toPercentage(n: number): string {
  return `${n}%`
}

export function toUSD(n: number): string {
  return `$${n.toLocaleString('en-US')}`
}

export function startWithZero(n: number): string {
  return n < 10 ? `0${n}` : n.toString()
}

export function round(n: number, decimals?: number): number {
  return parseFloat(n.toFixed(decimals || 0))
}

export const focusable =
  'a[href], button, input, textarea, select, embed, object, iframe, details,[tabindex]:not([tabindex="-1"])'

export function getKeyboardFocusableElements(element: HTMLElement | undefined): Array<Element> {
  const el = element || document
  return [...el.querySelectorAll(focusable)].filter(
    el =>
      !el.hasAttribute('disabled') &&
      !el.getAttribute('aria-hidden') &&
      window.getComputedStyle(el).display !== 'none'
  )
}

export function loadScript(params: { src: string; name: string }) {
  return new Promise(async resolve => {
    const { src, name } = params
    if (window[name as any]) resolve(true)
    else {
      console.log('Load script', name, src)
      document?.body?.classList.add('loading')
      const script = document.createElement('script')
      script.src = src
      script.onload = () => {
        document?.body?.classList.remove('loading')
        console.log('Script loaded', name, window[name as any])
        resolve(true)
      }
      document?.head?.appendChild(script)
    }
  })
}

export function InView(el: HTMLElement): any {
  const { top, height } = el.getBoundingClientRect()
  const { innerHeight } = window
  const initPos = Math.ceil(top)
  const lastPos = Math.ceil(initPos + height)
  return innerHeight > initPos && lastPos > 0
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function validateEmail(email: string): boolean {
  return !!email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    )
}

export function validatePhoneNumber(phone: string): boolean {
  return /^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/.test(phone)
}

export function validateZipCode(code: string): boolean {
  return /(^\d{5}$)|(^\d{5}-\d{4}$)/.test(code)
}

export function readingTime(text: string): number {
  const wpm: number = 225
  const words: number = text.trim().split(/\s+/).length
  const time: number = Math.ceil(words / wpm)
  return time
}

export function navigateBack(params: { fallback: string }) {
  const store = useStore()
  const { routeFrom } = storeToRefs(store)

  const router = useRouter()

  routeFrom.value ? router.back() : router.push(params.fallback)
}

export function multiplyArrayValues(data?: { input?: Array<any>; times: number }): Array<any> {
  const input: Array<any> = data?.input || [{ label: 'test' }]
  const output: Array<any> = []
  for (let i = 0; i < (data?.times || 10); i++) {
    output.push(...input)
  }
  return output
}

export function words(input: string): string {
  const words = input.split(' ')
  const output: Array<string> = []
  words.forEach(word => {
    output.push(`<span class='t-word'>${word}</span>`)
  })
  return output.join(' ')
}

export function wordsForHtml(input: string): string {
  const el: HTMLElement = document.createElement('div')
  el.innerHTML = input
  const arr = Array.from(el.childNodes).map((e: ChildNode) => {
    // @ts-expect-error
    return e.outerHTML || e.nodeValue?.split(' ').filter(t => t)
  })
  const output: Array<string> = []
  for (const word of [].concat.apply([], arr)) {
    output.push(`<span class='t-word'>${word}</span>`)
  }

  return output.join(' ')
}

export function shuffle(array: Array<any>): Array<any> {
  let currentIndex: number = array.length,
    temporaryValue,
    randomIndex

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1

    // And swap it with the current element.
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array
}

export function splitArray<T>(array: T[], n: number): T[][] {
  const result: T[][] = []
  const chunkSize = Math.ceil(array.length / n)

  for (let i = 0; i < n; i++) {
    const start = i * chunkSize
    const end = start + chunkSize
    const chunk = array.slice(start, end)
    chunk.length && result.push(chunk)
  }

  return result
}

export function formattedDate(d: Date): string {
  const year =
    ('0' + d.getUTCDate()).slice(-2) +
    '/' +
    ('0' + (d.getUTCMonth() + 1)).slice(-2) +
    '/' +
    d.getUTCFullYear()
  const hour = ('0' + d.getUTCHours()).slice(-2) + ':' + ('0' + d.getUTCMinutes()).slice(-2)
  return hour + ' ' + year
}

export function removeHtmlTags(input?: string) {
  let output: string = input || ''
  output = output.replace(/<[^>]*>/g, '')
  output = output.replace(/\/[^\/]*\//g, '')
  return decodeHtmlEntity(he.decode(he.decode(output)))
}

export function decodeHtmlEntity(str: string): string {
  return str
    .replaceAll(/&amp;/g, '&')
    .replaceAll(/&lt;/g, '<')
    .replaceAll(/&gt;/g, '>')
    .replaceAll(/&quot;/g, '"')
    .replaceAll(/&#039;/g, "'")
    .replaceAll(/&apos;/g, "'")
    .replaceAll(/&#8217;/g, "'")
}

export function numberToMonth(number: string): string {
  switch (number) {
    case '01':
      return 'January'
    case '02':
      return 'February'
    case '03':
      return 'March'
    case '04':
      return 'April'
    case '05':
      return 'May'
    case '06':
      return 'June'
    case '07':
      return 'July'
    case '08':
      return 'August'
    case '09':
      return 'September'
    case '10':
      return 'October'
    case '11':
      return 'November'
    default:
      return 'December'
  }
}

export function numberToShortMonth(number: string): string {
  switch (number) {
    case '01':
      return 'Jan'
    case '02':
      return 'Feb'
    case '03':
      return 'Mar'
    case '04':
      return 'Apr'
    case '05':
      return 'May'
    case '06':
      return 'Jun'
    case '07':
      return 'Jul'
    case '08':
      return 'Aug'
    case '09':
      return 'Sept'
    case '10':
      return 'Oct'
    case '11':
      return 'Nov'
    default:
      return 'Dec'
  }
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  // Remove the hash at the start if it's there
  hex = hex.replace(/^#/, '')

  // Parse the hex string
  let bigint
  if (hex.length === 3) {
    bigint = parseInt(
      hex
        .split('')
        .map(char => char + char)
        .join(''),
      16
    )
  } else if (hex.length === 6) {
    bigint = parseInt(hex, 16)
  } else {
    return { r: 1, g: 1, b: 1 }
  }

  // Extract the RGB values
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255

  return { r, g, b }
}

export function rbgToVec4(color: { r: number; g: number; b: number; a?: number }): Array<number> {
  return [color.r / 255, color.g / 255, color.b / 255, color.a || 1]
}

export function videoLoaded(video: HTMLVideoElement): boolean {
  return !!(video.currentTime > 0 && video.readyState > 2)
}
