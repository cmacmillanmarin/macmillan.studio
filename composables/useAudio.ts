type Audio = 'click' | 'pixel' | 'error' | 'success'
type Click = '1' | '2' | '3' | '4'
const clicks: Array<Click> = ['1', '2', '3', '4']

export default function useAudio() {
  function emit(type: Audio) {
    if (type === 'click') {
      const click = clicks[Math.floor(Math.random() * clicks.length)]
      const audio = new Audio(`/assets/audio/${click}.mp3`)
      audio.play()
    }
  }

  return { emit }
}
