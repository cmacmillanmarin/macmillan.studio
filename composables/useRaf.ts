export default function useRaf() {
  function addTicker(callback: Function): void {
    gsap?.ticker.add(callback)
  }

  function killTicker(callback: Function): void {
    gsap?.ticker.remove(callback)
  }

  return { addTicker, killTicker }
}
