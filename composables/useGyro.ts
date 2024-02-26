//
// requires:
// ~/composables/useRaf
//

import { round } from '~/utils/index'
interface GyroOptions {
  normalizedY: boolean
}
export default function useGyro(opts?: GyroOptions) {
  const { addTicker, killTicker } = useRaf()

  const requested = ref<boolean>(false)
  const supported = ref<boolean>(false)

  const x = ref<number>(0)
  const y = ref<number>(0)
  const z = ref<number>(0)

  let tx: number = 0
  let ty: number = 0
  let tz: number = 0

  let rendering: boolean = false
  let normalizedY: boolean = opts?.normalizedY || false

  watch(supported, () => {
    supported.value && addGyroListeners()
  })

  function init(): void {
    requested.value = true
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission()
        .then(permissionState => {
          if (permissionState === 'granted') {
            supported.value = true
          }
        })
        .catch(console.error)
    }
  }

  function addGyroListeners(): void {
    console.log('addGyroListeners')
    window.addEventListener('devicemotion', update, { passive: false })
  }

  onUnmounted(() => {
    window.removeEventListener('devicemotion', update)
  })

  function update(e: DeviceMotionEvent): void {
    const _x: number = e.accelerationIncludingGravity?.x || 0
    const _y: number = e.accelerationIncludingGravity?.y || 0
    const _z: number = e.accelerationIncludingGravity?.z || 0
    tx = enoughMovement(tx, _x) ? round(_x, 2) : tx
    ty = enoughMovement(ty, _y) ? round(normalizedY ? _y + 4 : _y, 2) : ty
    tz = enoughMovement(tz, _z) ? round(_z, 2) : tz
    !inTarget() && !rendering && addTicker(raf)
  }

  function raf(): void {
    rendering = true

    x.value += (tx - x.value) * 0.025
    y.value += (ty - y.value) * 0.025
    z.value += (tz - z.value) * 0.025

    if (inTarget()) {
      x.value = tx
      y.value = ty
      z.value = tz
      killTicker(raf)
      rendering = false
    }
  }

  function enoughMovement(previous: number, current: number): boolean {
    return Math.abs(previous - current) > 0.25
  }

  function inTarget(): boolean {
    return (
      Math.abs(x.value - tx) < 0.005 &&
      Math.abs(y.value - ty) < 0.005 &&
      Math.abs(z.value - tz) < 0.005
    )
  }

  return { init, requested, supported, x, y, z }
}
