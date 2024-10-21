<template>
  <div :class="['custom-input', { 'custom-input--error': !valid }]">
    <label>{{ data.placeholder }}</label>
    <input
      ref="inputEl"
      v-model="model"
      :type="type"
      :name="data.name"
      :placeholder="placeholderLabel"
      :max="data.max"
      :min="data.min"
      :aria-label="data.placeholder"
      :class="{ clicked: click }"
      class="custom-input__el"
      @mousedown="onClick"
      @blur="onBlur" />
  </div>
</template>

<script lang="ts" setup>
import { toPercentage, toUSD, validateEmail, validatePhoneNumber, validateZipCode } from '~/utils'
import type { Input, InputType, InputValue, InputEmit } from '~/types/front/index'

const props = defineProps<{
  data: Input
}>()

const { isDesktop } = useDevice()

const valid = ref<boolean>(true)
const click = ref<boolean>(false)
const model = ref<InputValue>(props.data.value || '')

const type = computed<InputType>((): InputType => {
  return props.data.type
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

onMounted((): void => {
  update()
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
  if (type === 'number') {
    const { max, min, type } = props.data
    if (min && parseFloat(model.value.toString()) < min) {
      let value: string | number = min
      errorLabel.value = `Enter a value greater than ${value}`
      return false
    }
    if (max && parseFloat(model.value.toString()) > max) {
      let value: string | number = max
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
.custom-input {
  position: relative;

  &__el {
    padding: 1.2rem;

    border: 0.1rem solid var(--border-blue);
    border-radius: 0.8rem;

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
