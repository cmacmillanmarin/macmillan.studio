type SoundType = 'click' | 'pixel' | 'error' | 'success'
type Click = '1' | '2' | '3' | '4'
const clicks: Array<Click> = ['1', '2', '3', '4']

class Sound {
  private static instance: Sound
  private audio: HTMLAudioElement | null = null
  private _enable: () => void = this.enable.bind(this)
  private _previusClick: Click = '1'

  private constructor() {}

  private enable() {
    this.audio = new Audio()
    console.log('enable', this)
    document.removeEventListener('click', this._enable)
  }

  public init() {
    console.log('init')
    document.addEventListener('click', this._enable)
  }

  public static get(): Sound {
    if (!Sound.instance) {
      Sound.instance = new Sound()
    }
    return Sound.instance
  }

  public emit(src: SoundType): void {
    if (this.audio) {
      if (src === 'click') {
        let click = clicks[Math.floor(Math.random() * clicks.length)]
        while (this._previusClick === click) {
          click = clicks[Math.floor(Math.random() * clicks.length)]
        }

        this._previusClick = click
        this.audio.src = '/assets/audio/' + click + '.mp3'
      }
      this.audio.play()
    }
  }
}

export const sound = Sound.get()
