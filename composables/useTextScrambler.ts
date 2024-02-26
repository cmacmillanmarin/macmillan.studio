import { sleep } from '~/utils/index'

export default () => {
  let sit: any
  let sto: any
  let initHTML: string
  let initEl: HTMLElement
  let markupIndex: Array<number>
  let scrambledChars: number = 0
  let scrambledCharsLimit: number = 5
  const scrabledCharsSet: string = 'wxyz+?$@%-~*_'

  function _scrambleText(el: HTMLElement) {
    // Keeps some readability only allowing X scrambled characters
    if (scrambledChars >= scrambledCharsLimit) {
      scrambledChars = 0
      el.innerHTML = initHTML
      return
    }
    // Gets each individual character
    const chars: Array<string> = el.innerHTML.split('')
    //
    // Gets a random character
    let randomCharIndex: number = Math.floor(Math.random() * chars.length)
    // Gets a random replacement character
    const randomReplacementCharIndex: number = Math.floor(Math.random() * scrabledCharsSet.length)
    // Checks that the random index is not markup or space
    if (!markupIndex.includes(randomCharIndex) && chars[randomCharIndex] != ' ') {
      chars[randomCharIndex] = scrabledCharsSet[randomReplacementCharIndex]
      // Updates text
      el.innerHTML = chars.join('')
      scrambledChars++
    } else {
      _scrambleText(el)
    }
  }

  async function scramble(params: {
    el: HTMLElement
    charsLimit?: number
    delay?: number
    duration?: number
    classes?: Array<string>
    centered?: boolean
  }): Promise<void> {
    // console.log('scramble', params.el)
    const { el, charsLimit, delay, duration, classes, centered } = params
    if (delay) await sleep(delay * 1000)
    if (duration) sto = setTimeout(destroy, duration * 1000)
    if (charsLimit) scrambledCharsLimit = charsLimit
    if (!el) return
    initEl = el
    initHTML = initEl.innerHTML
    _getMarkupIndex(el)
    _startScramble(el)
  }

  function destroy(): void {
    // console.log('destroy')
    _clear()
    _clean()
  }

  function _getMarkupIndex(el: HTMLElement): void {
    let markup: boolean = false
    markupIndex = []
    const chars = el.innerHTML.split('')
    for (const i in chars) {
      const char = chars[i]
      if (char === '<') markup = true
      if (markup) markupIndex.push(parseInt(i))
      if (char === '>') markup = false
    }
    for (const i in chars) {
      const char = chars[i]
      if (char === '&') markup = true
      if (markup) markupIndex.push(parseInt(i))
      if (char === ';') markup = false
    }
  }

  function _startScramble(el: HTMLElement): void {
    sit = setInterval(() => {
      _scrambleText(el)
    }, 100)
  }

  function _clean(): void {
    if (initEl && initHTML) {
      initEl.innerHTML = initHTML
    }
  }

  function _clear(): void {
    sit && clearInterval(sit)
    sto && clearTimeout(sto)
  }

  return { scramble, destroy }
}
