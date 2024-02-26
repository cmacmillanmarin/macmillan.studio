<template>
  <div class="c-carousel" v-intersect="{ callback: intersect }">
    <div v-if="bg" class="c-carousel__bg" />
    <button
      v-if="buttons"
      ref="buttonLeftEl"
      :class="[
        'c-carousel__button',
        'c-carousel__button--left',
        { 'c-carousel__button--visible': buttonLeftVisible },
      ]"
      aria-label="Previous"
      :tabindex="buttonLeftVisible ? 0 : -1"
      @click="onButtonLeftClick">
      <SvgArrowLeft class="c-carousel__button__arrow" />
    </button>
    <button
      v-if="buttons"
      ref="buttonRightEl"
      :class="[
        'c-carousel__button',
        'c-carousel__button--right',
        { 'c-carousel__button--visible': buttonRightVisible },
      ]"
      aria-label="Next"
      :tabindex="buttonRightVisible ? 0 : -1"
      @click="onButtonRigthClick">
      <SvgArrowLeft class="c-carousel__button__arrow" />
    </button>
    <div
      ref="contentEl"
      :class="['c-carousel__content', { 'c-carousel__content--right': bounding === 0 && right }]">
      <div ref="scrollerEl" class="c-carousel__content__scroller">
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
const props = defineProps<{
  bg?: boolean
  buttons?: boolean
  loop?: boolean
  right?: boolean
  static?: boolean
}>()

const contentEl = ref<HTMLElement>()
const scrollerEl = ref<HTMLElement>()
const buttonLeftEl = ref<HTMLElement>()
const buttonRightEl = ref<HTMLElement>()
const buttonLeftVisible = computed<boolean>(
  (): boolean => Math.abs(current.value) > layoutIndent.value
)
const buttonRightVisible = computed<boolean>(
  (): boolean => Math.abs(current.value) < bounding.value - layoutIndent.value
)

const inView = ref<boolean>(false)
const bounding = ref<number>(0)
const target = ref<number>(0)
const start = ref<number>(0)
const current = ref<number>(0)
const direction = ref<1 | -1>(-1)

const { onResize } = useResize()
const { init, panStart, panHorizontal, onPan } = useSwipe({
  preventLeft: true,
  preventRight: true,
})
const { addTicker, killTicker } = useRaf()
const { layoutIndent } = useCss()

watch(inView, (): void => {
  bounding.value > 0 && inView.value ? addTicker(raf) : killTicker(raf)
})

watch(current, (): void => {
  gsap.set(scrollerEl.value, { x: toPx(current.value) })
})

watch(onResize, update)

watch(panStart, (): void => {
  start.value = current.value
})

watch(panHorizontal, (): void => {
  if (bounding.value > 0) {
    target.value = clamp(start.value - panHorizontal.value)
    direction.value = panHorizontal.value > 0 ? -1 : 1
  }
})

onMounted(async (): Promise<void> => {
  await nextTick()
  await nextTick()
  update()
  init({ el: scrollerEl.value as HTMLElement, cursor: true })
})

function clamp(value: number): number {
  return Math.min(Math.max(bounding.value * -1, value), 0)
}

function raf(): void {
  if (!onPan.value && !props.static) {
    target.value = clamp(target.value + direction.value * 0.6)
  }
  current.value += (target.value - current.value) * 0.175
  if (Math.abs(current.value - target.value) < 0.1) {
    current.value = target.value
    if (props.loop && !props.static) {
      direction.value = direction.value === 1 ? -1 : 1
    }
  }
}

function intersect(el: HTMLElement, visible: boolean): void {
  inView.value = visible
}

function update(): void {
  const content = contentEl.value?.clientWidth || 0
  const scroller = scrollerEl.value?.clientWidth || 0

  bounding.value = Math.max(0, scroller - content)
}

function onButtonLeftClick(): void {
  target.value = clamp(target.value + 200)
  direction.value = 1
}

function onButtonRigthClick(): void {
  target.value = clamp(target.value - 200)
  direction.value = -1
}

onUnmounted((): void => {
  killTicker(raf)
})
</script>

<style lang="scss">
.c-carousel {
  position: relative;

  width: 100%;
  max-width: var(--layout-max-width);
  overflow: var(--overflow--hidden);

  margin: 0 auto;

  &__bg {
    position: absolute;
    z-index: 1;
    top: 0;
    left: calc(var(--layout-indent) * 0.5);
    width: calc(100% - var(--layout-indent));
    height: 100%;
    background-color: var(--bone);
    @include from__desktop {
      left: var(--layout-indent);
      width: calc(100% - var(--layout-indent) * 2);
    }
  }

  &__button {
    position: absolute;
    top: 50%;
    transform: translate(0, calc(-50% - 1.6rem));
    z-index: 3;
    margin: 0;
    padding: 0;
    height: 4.8rem;
    width: 4.8rem;
    background-color: var(--beige);
    border: 1px solid var(--bone);
    border-radius: var(--border-radius--s);

    @include from__desktop {
      height: 5.6rem;
      width: 5.6rem;
      transform: translate(0, calc(-50% - 5rem));
    }

    opacity: 0;
    will-change: opacity;
    transition: opacity 0.4s ease-in-out;
    pointer-events: none;

    display: flex;
    align-items: center;
    justify-content: center;

    &--visible {
      opacity: 1;
      pointer-events: auto;
    }

    &--left {
      left: calc(var(--layout-indent) * 0.5);
      @include from__desktop {
        left: var(--layout-indent);
      }
    }

    &--right {
      right: calc(var(--layout-indent) * 0.5);
      @include from__desktop {
        right: var(--layout-indent);
      }

      .c-carousel__button__arrow {
        transform: rotate(180deg);
      }
    }

    &__arrow {
      width: 1.1rem;
      @include from__desktop {
        width: 1.2rem;
      }
      path {
        stroke: var(--burgundy);
      }
    }
  }

  &__content {
    position: relative;
    z-index: 2;

    font-size: 0;

    &--right {
      text-align: right;
    }

    &__scroller {
      display: inline-block;
      white-space: nowrap;

      cursor: grab;
      will-change: transform;

      &__image {
        display: inline-block;
        height: 30rem;

        margin-right: var(--layout-gap);

        pointer-events: none;

        img {
          height: 100%;
          width: auto;
        }

        &--empty {
          aspect-ratio: 3/4;
          border-radius: var(--border-radius--m);
          background-color: var(--burgundy--dark);
        }
      }
    }
  }
}
</style>
