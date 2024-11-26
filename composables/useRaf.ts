import { gsap } from 'gsap/gsap-core'

export default function useRaf() {
  function addTicker(callback: GSAPTickerCallback): void {
    gsap.ticker.add(callback)
  }

  function killTicker(callback: GSAPTickerCallback): void {
    gsap.ticker.remove(callback)
  }

  return { addTicker, killTicker }
}
