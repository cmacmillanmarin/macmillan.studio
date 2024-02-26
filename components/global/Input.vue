<template>
  <div
    :class="[
      'c-input',
      { 'c-input--error': !valid },
      { 'c-input--margin': data.type === 'percentage' || data.type === 'currency' },
    ]">
    <transition
      mode="out-in"
      :css="false"
      @before-enter="prepareFadeIn"
      @enter="empty ? undefined : transitionFadeIn"
      @leave="transitionFadeOut"
      @after-enter="animate">
      <label ref="labelEl" v-if="valid" class="c-input__label t-microcopy t-burgundy">{{
        placeholderLabel
      }}</label>
      <label ref="labelEl" v-else class="c-input__label t-microcopy t-red">
        <span class="c-input__label__icon"><SvgError /></span>{{ errorLabel }}</label
      >
    </transition>

    <label
      ref="infoEl"
      class="c-input__info t-input"
      :class="{ 't-burgundy--dark': valid, 't-red': !valid }"
      v-if="data.type === 'percentage' || data.type === 'currency'"
      v-html="`${data.type === 'percentage' ? '%' : '$'}`" />

    <input
      ref="inputEl"
      v-model="model"
      :type="type"
      :name="data.name"
      :placeholder="placeholderLabel"
      :max="data.max"
      :min="data.min"
      :aria-label="data.placeholder"
      :class="{ clicked: click, 't-burgundy--dark': valid, 't-red': !valid }"
      class="c-input__el t-input"
      @mousedown="onClick"
      @blur="onBlur" />
  </div>
</template>

<script lang="ts" setup>
import { toPercentage, toUSD, validateEmail, validatePhoneNumber, validateZipCode } from '~/utils'
import { prepareFadeIn, transitionFadeIn, transitionFadeOut } from '~/utils/animations'
import type { Input, InputType, InputValue, InputEmit } from '~/types/front/index'

const props = defineProps<{
  data: Input
}>()

const { isDesktop } = useDevice()

const valid = ref<boolean>(true)
const click = ref<boolean>(false)
const model = ref<InputValue>(props.data.value || '')

const type = computed<InputType>((): InputType => {
  switch (props.data.type) {
    case 'number':
    case 'currency':
    case 'percentage':
      return 'text'

    default:
      return props.data.type
  }
})

const empty = computed<boolean>((): boolean => model.value === '')
const required = computed<boolean>((): boolean => !!props.data.required)

const placeholderLabel = ref<string>(
  `${required.value && !props.data.exception ? '*' : ''}${props.data.placeholder}`
)
const errorLabel = ref<string>('')

const labelEl = ref<HTMLElement>()
const inputEl = ref<HTMLElement>()
const infoEl = ref<HTMLElement>()

watch(model, update)
watch(empty, animate)
watch(valid, animate)

onMounted((): void => {
  update()
  animate()
})

function get(): InputEmit {
  return {
    key: props.data.name,
    value: model.value,
    valid: isValid(),
  }
}

function update(): void {
  valid.value = true
  emit('change', get())
}

function refresh(data: string | number): void {
  model.value = data
}

function animate(): void {
  gsap.killTweensOf([labelEl.value, inputEl.value, infoEl.value])
  const visible = !empty.value || !valid.value
  const y = visible ? (isDesktop.value ? 10 : 7) : 0
  const yDelay = visible ? 0 : 0.2
  const opacity = visible ? 1 : 0
  const opacityDelay = visible ? 0.2 : 0
  const opacityEase = visible ? 'power1.in' : 'power1.out'
  labelEl.value &&
    gsap.to(labelEl.value, { opacity, duration: 0.4, ease: opacityEase, delay: opacityDelay })
  infoEl.value && gsap.to(infoEl.value, { y, duration: 0.4, delay: yDelay })
  inputEl.value &&
    gsap.to(inputEl.value, {
      paddingTop: 15 + y,
      paddingBottom: 15 - y,
      duration: 0.4,
      delay: yDelay,
    })
}

function isValid(): boolean {
  if (required.value && model.value === '') {
    errorLabel.value = 'Required field'
    return false
  }
  const { max, min, type } = props.data
  if (type === 'email') {
    errorLabel.value = 'Please enter a valid email address'
    if (model.value !== '') return validateEmail(model.value.toString())
  }
  if (type === 'phone') {
    errorLabel.value = 'Please enter a valid phone number'
    if (model.value !== '') return validatePhoneNumber(model.value.toString())
  }
  if (type === 'zip') {
    errorLabel.value = 'Invalid code'
    if (model.value !== '') return validateZipCode(model.value.toString())
  }
  if (type === 'number' || type === 'percentage' || type === 'currency') {
    const { max, min, type } = props.data
    if (min && parseFloat(model.value.toString()) < min) {
      let value: string | number = min
      if (type === 'percentage') value = toPercentage(value)
      else if (type === 'currency') value = toUSD(value)
      errorLabel.value = `Enter a value greater than ${value}`
      return false
    }
    if (max && parseFloat(model.value.toString()) > max) {
      let value: string | number = max
      if (type === 'percentage') value = toPercentage(value)
      else if (type === 'currency') value = toUSD(value)
      errorLabel.value = `Enter a value lower than ${value}`
      return false
    }
  }
  return true
}

function onClick() {
  click.value = true
}

function onBlur() {
  click.value = false
  check()
  emit('update', get())
}

function check(): void {
  valid.value = isValid()
}

const emit = defineEmits<{
  (e: 'change', value: InputEmit): void
  (e: 'update', value: InputEmit): void
}>()

defineExpose({
  get,
  check,
  refresh,
  valid,
})
</script>

<style lang="scss">
.c-input {
  position: relative;

  border: 0.1rem solid var(--beige);
  border-bottom: 0.1rem solid var(--burgundy--dark);
  border-radius: 0;
  border-top-left-radius: var(--border-radius--s);
  border-top-right-radius: var(--border-radius--s);
  background-color: var(--white);

  &--error {
    border: 0.1rem solid var(--red);
    border-bottom: 0.1rem solid var(--burgundy--dark);
  }

  &--margin {
    .c-input__el {
      padding-left: 3rem;
      @include from__desktop {
        padding-left: 3.8rem;
      }
    }
  }

  &__info {
    position: absolute;
    top: 0;
    left: 1.25rem;
    padding-top: 1.8rem;
    will-change: transform;
    width: 0;
    text-align: right;
  }

  &__label {
    position: absolute;
    top: 0.6rem;
    left: 1.2rem;

    opacity: 0;
    will-change: opacity;

    z-index: 1;

    display: flex;
    justify-content: flex-start;
    align-items: center;

    @include from__desktop {
      left: 1.5rem;
    }

    &__icon {
      margin-right: 0.4rem;
    }
  }

  &__el {
    padding: 1.2rem;

    border: none;
    border-radius: 0;
    border-top-left-radius: var(--border-radius--s);
    border-top-right-radius: var(--border-radius--s);

    will-change: transform;

    @include from__desktop {
      padding: 1.5rem;
    }

    &:-webkit-autofill,
    &:-webkit-autofill:hover,
    &:-webkit-autofill:focus {
      -webkit-box-shadow: 0 0 0 100rem var(--white) inset;
    }
  }
}
</style>
